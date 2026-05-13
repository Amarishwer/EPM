'use server'

import bcrypt from 'bcryptjs'
import { TenantStatus, UserRole, UserStatus } from '@prisma/client'
import { redirect } from 'next/navigation'

import { notifyAdmins } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { isRateLimited, validatePassword } from '@/lib/security'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

export async function submitTenantRegistrationAction(formData: FormData) {
  const firstName = parseString(formData.get('firstName'))
  const lastName = parseString(formData.get('lastName'))
  const email = parseString(formData.get('email'))?.toLowerCase()
  const phone = parseString(formData.get('phone'))
  const password = String(formData.get('password') ?? '')
  const requestedPropertyId = parseString(formData.get('requestedPropertyId'))
  const currentAddress = parseString(formData.get('currentAddress'))
  const occupation = parseString(formData.get('occupation'))
  const monthlyIncomeValue = String(formData.get('monthlyIncome') ?? '').trim()
  const desiredMoveInDateValue = String(formData.get('desiredMoveInDate') ?? '').trim()
  const applicationMessage = parseString(formData.get('applicationMessage'))

  if (email && isRateLimited(`register:${email}`, 3, 60 * 60 * 1000)) {
    redirect('/register?error=limited')
  }

  if (!firstName || !lastName || !email || !password || !requestedPropertyId) {
    redirect('/register?error=missing')
  }

  if (validatePassword(password)) {
    redirect('/register?error=password')
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    redirect('/register?error=exists')
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const monthlyIncome = monthlyIncomeValue ? Number.parseFloat(monthlyIncomeValue) : null
  const desiredMoveInDate = desiredMoveInDateValue ? new Date(desiredMoveInDateValue) : null

  const tenant = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      currentAddress,
      occupation,
      monthlyIncome: monthlyIncome && !Number.isNaN(monthlyIncome) ? monthlyIncome.toFixed(2) : null,
      desiredMoveInDate: desiredMoveInDate && !Number.isNaN(desiredMoveInDate.getTime()) ? desiredMoveInDate : null,
      applicationMessage,
      role: UserRole.TENANT,
      status: UserStatus.ACTIVE,
      tenantStatus: TenantStatus.PENDING,
      requestedPropertyId,
    },
    include: {
      requestedProperty: true,
    },
  })

  await notifyAdmins({
    title: 'Tenant registration alert',
    message: `${tenant.firstName} ${tenant.lastName} registered and requested ${tenant.requestedProperty?.name ?? 'a property'}.`,
    type: 'tenant_registration',
    link: '/admin/tenants',
  })

  redirect('/register?success=1')
}
