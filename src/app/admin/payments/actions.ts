'use server'

import { PaymentStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdminUser } from '@/lib/auth'
import { formatCurrency } from '@/lib/format'
import { calculateLateFee } from '@/lib/late-fees'
import { notifyAdmins } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

function parseDecimal(value: FormDataEntryValue | null) {
  const parsed = Number.parseFloat(String(value ?? '0'))
  return Number.isNaN(parsed) ? '0.00' : parsed.toFixed(2)
}

function parseDate(value: FormDataEntryValue | null) {
  const date = new Date(String(value ?? ''))
  return Number.isNaN(date.getTime()) ? null : date
}

export async function syncOverduePayments() {
  await requireAdminUser()

  const now = new Date()
  const pendingPayments = await prisma.payment.findMany({
    where: {
      isArchived: false,
      status: PaymentStatus.PENDING,
      dueDate: { lt: now },
    },
    include: {
      tenant: true,
      property: true,
    },
  })

  if (!pendingPayments.length) return

  await prisma.payment.updateMany({
    where: { id: { in: pendingPayments.map((payment) => payment.id) } },
    data: { status: PaymentStatus.OVERDUE },
  })

  for (const payment of pendingPayments) {
    const lateFee = calculateLateFee(Number(payment.amount), payment.dueDate)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: 'overdue_rent',
        link: '/admin/payments',
        message: { contains: payment.id },
      },
    })

    if (!existingNotification) {
      await notifyAdmins({
        title: 'Overdue rent alert',
        message: `Payment ${payment.id} for ${payment.property.name} is overdue for ${payment.tenant.firstName ?? payment.tenant.email}. Late fee currently: ${formatCurrency(lateFee)}.`,
        type: 'overdue_rent',
        link: '/admin/payments',
      })
    }
  }
}

export async function createPaymentAction(formData: FormData) {
  await requireAdminUser()

  const propertyId = parseString(formData.get('propertyId'))
  const submittedTenantId = parseString(formData.get('tenantId'))
  const amount = parseDecimal(formData.get('amount'))
  const dueDate = parseDate(formData.get('dueDate'))
  const chargeMonth = parseDate(formData.get('chargeMonth'))
  const note = parseString(formData.get('note'))

  if (!propertyId || !dueDate) {
    redirect('/admin/payments?error=create')
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { tenantId: true },
  })

  const tenantId = property?.tenantId ?? submittedTenantId
  if (!tenantId) {
    redirect('/admin/payments?error=create')
  }

  await prisma.payment.create({
    data: {
      propertyId,
      tenantId,
      amount,
      dueDate,
      chargeMonth,
      note,
      status: PaymentStatus.PENDING,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/payments')
  redirect('/admin/payments?created=1')
}

export async function updatePaymentAction(formData: FormData) {
  await requireAdminUser()

  const paymentId = String(formData.get('paymentId') ?? '')
  const status = String(formData.get('status') ?? PaymentStatus.PENDING) as PaymentStatus
  const note = parseString(formData.get('note'))
  const paidDate = parseDate(formData.get('paidDate'))
  const archive = String(formData.get('archive') ?? '') === '1'

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: archive ? PaymentStatus.ARCHIVED : status,
      note,
      paidDate: status === PaymentStatus.PAID ? paidDate ?? new Date() : null,
      isArchived: archive,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/payments')
}
