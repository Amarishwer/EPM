'use server'

import bcrypt from 'bcryptjs'
import { DepositTransactionType, DocumentCategory, PropertyStatus, TenantStatus, UserRole, UserStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdminUser } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { notifyTenant } from '@/lib/notifications'
import { generateTemporaryPassword } from '@/lib/passwords'
import { prisma } from '@/lib/prisma'
import { saveUploadedDocument } from '@/lib/uploads'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

function parseDecimal(value: FormDataEntryValue | null) {
  const parsed = Number.parseFloat(String(value ?? '0'))
  return Number.isNaN(parsed) ? '0.00' : parsed.toFixed(2)
}

async function deliverTemporaryPassword(email: string, temporaryPassword: string, portalPath: string) {
  const result = await sendEmail({
    to: email,
    subject: 'Your EPM temporary password',
    html: `<p>Your temporary password is <strong>${temporaryPassword}</strong>.</p><p>Sign in and change it as soon as possible.</p>`,
    text: `Your temporary password is ${temporaryPassword}. Sign in and change it as soon as possible. ${portalPath}`,
  })

  if (!result.sent && process.env.NODE_ENV === 'production') {
    throw new Error('Temporary password email could not be sent.')
  }
}

async function syncTenantPropertyAssignment(userId: string, propertyId: string | null, shouldOccupy = false) {
  await prisma.property.updateMany({
    where: propertyId
      ? { tenantId: userId, NOT: { id: propertyId } }
      : { tenantId: userId },
    data: {
      tenantId: null,
      status: PropertyStatus.VACANT,
    },
  })

  if (!propertyId) {
    return
  }

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      tenantId: userId,
      status: shouldOccupy ? PropertyStatus.OCCUPIED : undefined,
    },
  })
}

async function recalculateTenantDeposit(tenantId: string) {
  const [tenant, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: tenantId } }),
    prisma.depositTransaction.findMany({ where: { tenantId } }),
  ])

  if (!tenant) {
    return
  }

  const paid = transactions
    .filter((transaction) => transaction.type === DepositTransactionType.PAYMENT)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)

  const deductions = transactions
    .filter((transaction) => transaction.type === DepositTransactionType.DEDUCTION)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)

  const refunds = transactions
    .filter((transaction) => transaction.type === DepositTransactionType.REFUND)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0)

  const balance = Number((paid - deductions - refunds).toFixed(2))

  await prisma.user.update({
    where: { id: tenantId },
    data: {
      depositPaid: paid.toFixed(2),
      depositBalance: balance.toFixed(2),
    },
  })
}

export async function createTenantAction(formData: FormData) {
  await requireAdminUser()

  const firstName = parseString(formData.get('firstName'))
  const lastName = parseString(formData.get('lastName'))
  const email = parseString(formData.get('email'))?.toLowerCase()
  const phone = parseString(formData.get('phone'))
  const propertyId = parseString(formData.get('propertyId'))

  if (!firstName || !lastName || !email) {
    redirect('/admin/tenants?error=tenant')
  }

  const temporaryPassword = generateTemporaryPassword()
  const password = await bcrypt.hash(temporaryPassword, 10)

  const tenant = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: UserRole.TENANT,
      status: UserStatus.INVITED,
      tenantStatus: propertyId ? TenantStatus.APPROVED : TenantStatus.PENDING,
      requestedPropertyId: propertyId,
    },
  })

  if (propertyId) {
    await syncTenantPropertyAssignment(tenant.id, propertyId, true)
  }

  await deliverTemporaryPassword(tenant.email, temporaryPassword, '/tenant-login')

  revalidatePath('/admin')
  revalidatePath('/admin/tenants')
  revalidatePath('/admin/properties')
  redirect('/admin/tenants?created=tenant')
}

export async function createAdminAction(formData: FormData) {
  await requireAdminUser()

  const firstName = parseString(formData.get('firstName'))
  const lastName = parseString(formData.get('lastName'))
  const email = parseString(formData.get('email'))?.toLowerCase()
  const phone = parseString(formData.get('phone'))

  if (!firstName || !lastName || !email) {
    redirect('/admin/tenants?error=admin')
  }

  const temporaryPassword = generateTemporaryPassword()
  const password = await bcrypt.hash(temporaryPassword, 10)

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password,
      role: UserRole.ADMIN,
      status: UserStatus.INVITED,
    },
  })

  await deliverTemporaryPassword(email, temporaryPassword, '/admin-login')

  revalidatePath('/admin')
  revalidatePath('/admin/tenants')
  redirect('/admin/tenants?created=admin')
}

export async function updateTenantDetailsAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const firstName = parseString(formData.get('firstName'))
  const lastName = parseString(formData.get('lastName'))
  const email = parseString(formData.get('email'))?.toLowerCase()
  const phone = parseString(formData.get('phone'))
  const requestedPropertyId = parseString(formData.get('requestedPropertyId'))
  const assignedPropertyId = parseString(formData.get('assignedPropertyId'))
  const accountStatus = String(formData.get('status') ?? UserStatus.ACTIVE) as UserStatus
  const tenantStatus = String(formData.get('tenantStatus') ?? TenantStatus.PENDING) as TenantStatus
  const depositRequired = parseDecimal(formData.get('depositRequired'))
  const depositPaid = parseDecimal(formData.get('depositPaid'))
  const depositBalance = parseDecimal(formData.get('depositBalance'))

  await prisma.user.update({
    where: { id: tenantId },
    data: {
      firstName,
      lastName,
      email: email ?? undefined,
      phone,
      requestedPropertyId,
      status: accountStatus,
      tenantStatus,
      depositRequired,
      depositPaid,
      depositBalance,
    },
  })

  await syncTenantPropertyAssignment(tenantId, assignedPropertyId, tenantStatus === TenantStatus.APPROVED && accountStatus !== UserStatus.ARCHIVED)

  revalidatePath('/admin')
  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/properties')
}

export async function updateTenantLifecycleAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const lifecycleAction = String(formData.get('lifecycleAction') ?? '')
  const assignedPropertyId = parseString(formData.get('assignedPropertyId'))

  const tenant = await prisma.user.findUnique({ where: { id: tenantId } })
  if (!tenant || tenant.role !== UserRole.TENANT) {
    redirect('/admin/tenants')
  }

  if (lifecycleAction === 'approve') {
    await prisma.user.update({
      where: { id: tenantId },
      data: {
        tenantStatus: TenantStatus.APPROVED,
        status: UserStatus.ACTIVE,
        requestedPropertyId: assignedPropertyId ?? tenant.requestedPropertyId,
      },
    })
    await syncTenantPropertyAssignment(tenantId, assignedPropertyId ?? tenant.requestedPropertyId, true)
    await notifyTenant(tenant.id, tenant.email, {
      title: 'Tenant registration approved',
      message: 'Your tenant account has been approved and linked to your property.',
      type: 'tenant_approved',
      link: '/tenant-login',
    })
  }

  if (lifecycleAction === 'reject') {
    await prisma.user.update({
      where: { id: tenantId },
      data: {
        tenantStatus: TenantStatus.REJECTED,
      },
    })
    await notifyTenant(tenant.id, tenant.email, {
      title: 'Tenant registration update',
      message: 'Your registration was reviewed and marked as rejected. You can reapply later or contact support for next steps.',
      type: 'tenant_rejected',
      link: '/register',
    })
  }

  if (lifecycleAction === 'archive') {
    await prisma.user.update({
      where: { id: tenantId },
      data: {
        tenantStatus: TenantStatus.ARCHIVED,
        status: UserStatus.ARCHIVED,
        requestedPropertyId: null,
      },
    })
    await syncTenantPropertyAssignment(tenantId, null, false)
  }

  if (lifecycleAction === 'unarchive') {
    await prisma.user.update({
      where: { id: tenantId },
      data: {
        tenantStatus: TenantStatus.PENDING,
        status: UserStatus.ACTIVE,
      },
    })
  }

  revalidatePath('/admin')
  revalidatePath('/admin/tenants')
  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/admin/properties')
}

export async function resetTenantPasswordAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const temporaryPassword = generateTemporaryPassword()
  const password = await bcrypt.hash(temporaryPassword, 10)

  await prisma.user.update({
    where: { id: tenantId },
    data: {
      password,
    },
  })

  const tenant = await prisma.user.findUnique({
    where: { id: tenantId },
    select: { email: true },
  })

  if (tenant) {
    await deliverTemporaryPassword(tenant.email, temporaryPassword, '/tenant-login')
  }

  revalidatePath(`/admin/tenants/${tenantId}`)
}

export async function setTenantDepositRequiredAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const propertyId = parseString(formData.get('propertyId'))
  const amount = parseDecimal(formData.get('amount'))
  const note = parseString(formData.get('note'))

  await prisma.user.update({
    where: { id: tenantId },
    data: {
      depositRequired: amount,
    },
  })

  await prisma.depositTransaction.create({
    data: {
      tenantId,
      propertyId,
      type: DepositTransactionType.REQUIRED,
      amount,
      note: note ?? 'Security deposit requirement set by admin',
    },
  })

  revalidatePath(`/admin/tenants/${tenantId}`)
}

export async function recordDepositTransactionAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const propertyId = parseString(formData.get('propertyId'))
  const type = String(formData.get('type') ?? DepositTransactionType.PAYMENT) as DepositTransactionType
  const amount = parseDecimal(formData.get('amount'))
  const note = parseString(formData.get('note'))

  await prisma.depositTransaction.create({
    data: {
      tenantId,
      propertyId,
      type,
      amount,
      note,
    },
  })

  await recalculateTenantDeposit(tenantId)
  revalidatePath(`/admin/tenants/${tenantId}`)
}

export async function uploadTenantDocumentAction(formData: FormData) {
  await requireAdminUser()

  const tenantId = String(formData.get('tenantId') ?? '')
  const propertyId = String(formData.get('propertyId') ?? '')
  const title = parseString(formData.get('title')) ?? 'Tenant Document'
  const category = String(formData.get('category') ?? DocumentCategory.MISCELLANEOUS) as DocumentCategory
  const isVisibleToTenant = String(formData.get('isVisibleToTenant') ?? '') === '1'
  const file = formData.get('documentFile')

  if (!(file instanceof File) || !file.size) {
    return
  }

  const storedFile = await saveUploadedDocument(file)
  if (!storedFile) {
    return
  }

  await prisma.tenantDocument.create({
    data: {
      tenantId,
      propertyId,
      title,
      category,
      filePath: storedFile.filePath,
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      sizeBytes: storedFile.sizeBytes,
      uploadedByAdmin: true,
      isVisibleToTenant,
    },
  })

  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/tenant')
}

export async function toggleTenantDocumentVisibilityAction(formData: FormData) {
  await requireAdminUser()

  const documentId = String(formData.get('documentId') ?? '')
  const tenantId = String(formData.get('tenantId') ?? '')
  const isVisibleToTenant = String(formData.get('isVisibleToTenant') ?? '') === '1'

  await prisma.tenantDocument.update({
    where: { id: documentId },
    data: {
      isVisibleToTenant,
    },
  })

  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath('/tenant')
}
