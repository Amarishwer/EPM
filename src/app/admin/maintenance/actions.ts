'use server'

import { MaintenanceStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdminUser } from '@/lib/auth'
import { notifyAdmins } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

export async function createMaintenanceAction(formData: FormData) {
  await requireAdminUser()

  const propertyId = parseString(formData.get('propertyId'))
  const submittedTenantId = parseString(formData.get('tenantId'))
  const title = parseString(formData.get('title'))
  const description = parseString(formData.get('description'))
  const priority = parseString(formData.get('priority'))
  const assignee = parseString(formData.get('assignee'))

  if (!propertyId || !title || !description) {
    redirect('/admin/maintenance?error=create')
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { tenantId: true },
  })

  const tenantId = property?.tenantId ?? submittedTenantId
  if (!tenantId) {
    redirect('/admin/maintenance?error=create')
  }

  const request = await prisma.maintenanceRequest.create({
    data: {
      propertyId,
      tenantId,
      title,
      description,
      priority,
      assignee,
    },
    include: {
      property: true,
      tenant: true,
    },
  })

  await notifyAdmins({
    title: 'New maintenance request alert',
    message: `${request.title} was created for ${request.property.name}.`,
    type: 'maintenance_request',
    link: '/admin/maintenance',
  })

  revalidatePath('/admin')
  revalidatePath('/admin/maintenance')
  redirect('/admin/maintenance?created=1')
}

export async function updateMaintenanceAction(formData: FormData) {
  await requireAdminUser()

  const requestId = String(formData.get('requestId') ?? '')
  const status = String(formData.get('status') ?? MaintenanceStatus.PENDING) as MaintenanceStatus
  const priority = parseString(formData.get('priority'))
  const assignee = parseString(formData.get('assignee'))
  const adminNotes = parseString(formData.get('adminNotes'))
  const archive = String(formData.get('archive') ?? '') === '1'

  await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: archive ? MaintenanceStatus.ARCHIVED : status,
      priority,
      assignee,
      adminNotes,
      completedAt: status === MaintenanceStatus.COMPLETED ? new Date() : null,
      isArchived: archive,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/maintenance')
}
