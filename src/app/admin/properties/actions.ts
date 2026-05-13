'use server'

import { PropertyStatus, PropertyType } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requireAdminUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveUploadedImages } from '@/lib/uploads'

function parseDecimal(value: FormDataEntryValue | null) {
  if (!value) return '0.00'
  const parsed = Number.parseFloat(String(value))
  return Number.isNaN(parsed) ? '0.00' : parsed.toFixed(2)
}

function parseDate(value: FormDataEntryValue | null) {
  if (!value) return null
  const date = new Date(String(value))
  return Number.isNaN(date.getTime()) ? null : date
}

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

function parseOptionalDecimal(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  if (!parsed) return null

  const number = Number.parseFloat(parsed)
  return Number.isNaN(number) ? null : number.toString()
}

function parseOptionalInt(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  if (!parsed) return null

  const number = Number.parseInt(parsed, 10)
  return Number.isNaN(number) ? null : number
}

async function syncTenantAssignment(propertyId: string, tenantId: string | null) {
  if (!tenantId) {
    return
  }

  await prisma.property.updateMany({
    where: {
      tenantId,
      NOT: { id: propertyId },
    },
    data: {
      tenantId: null,
      status: PropertyStatus.VACANT,
    },
  })
}

async function persistPropertyPhotos(propertyId: string, formData: FormData) {
  const primaryPhoto = formData.get('primaryPhoto')
  const galleryPhotos = formData.getAll('galleryPhotos')
  const files = [primaryPhoto, ...galleryPhotos].filter((item): item is File => item instanceof File && item.size > 0)
  if (!files.length) return
  const storedPaths = await saveUploadedImages(files)
  if (!storedPaths.length) return

  const existingPrimary = await prisma.propertyPhoto.findFirst({ where: { propertyId, isPrimary: true } })
  await prisma.propertyPhoto.createMany({
    data: storedPaths.map((storedPath, index) => ({
      propertyId,
      path: storedPath,
      isPrimary: index === 0 && !existingPrimary,
    })),
  })
}

function buildPropertyPayload(formData: FormData) {
  const tenantId = parseString(formData.get('tenantId'))
  const explicitStatus = String(formData.get('status') ?? PropertyStatus.VACANT) as PropertyStatus

  return {
    name: String(formData.get('name') ?? '').trim(),
    postalCode: parseString(formData.get('postalCode')),
    areaName: parseString(formData.get('areaName')),
    colonyName: parseString(formData.get('colonyName')),
    locality: parseString(formData.get('locality')),
    buildingName: parseString(formData.get('buildingName')),
    doorNumber: parseString(formData.get('doorNumber')),
    latitude: parseOptionalDecimal(formData.get('latitude')),
    longitude: parseOptionalDecimal(formData.get('longitude')),
    propertyType: String(formData.get('propertyType') ?? PropertyType.RESIDENTIAL) as PropertyType,
    bedrooms: parseOptionalInt(formData.get('bedrooms')),
    bathrooms: parseOptionalInt(formData.get('bathrooms')),
    notes: parseString(formData.get('notes')),
    monthlyRent: parseDecimal(formData.get('monthlyRent')),
    securityDeposit: parseDecimal(formData.get('securityDeposit')),
    leaseStartDate: parseDate(formData.get('leaseStartDate')),
    leaseEndDate: parseDate(formData.get('leaseEndDate')),
    tenantId,
    status: tenantId && explicitStatus === PropertyStatus.VACANT ? PropertyStatus.OCCUPIED : explicitStatus,
  }
}

export async function createPropertyAction(formData: FormData) {
  await requireAdminUser()
  const payload = buildPropertyPayload(formData)
  const property = await prisma.property.create({ data: payload })
  await syncTenantAssignment(property.id, payload.tenantId)
  await persistPropertyPhotos(property.id, formData)
  revalidatePath('/admin')
  revalidatePath('/admin/properties')
  redirect(`/admin/properties/${property.id}/edit?created=1`)
}

export async function updatePropertyAction(propertyId: string, formData: FormData) {
  await requireAdminUser()
  const payload = buildPropertyPayload(formData)
  await syncTenantAssignment(propertyId, payload.tenantId)
  await prisma.property.update({ where: { id: propertyId }, data: payload })
  await persistPropertyPhotos(propertyId, formData)
  revalidatePath('/admin')
  revalidatePath('/admin/properties')
  revalidatePath(`/admin/properties/${propertyId}/edit`)
  redirect(`/admin/properties/${propertyId}/edit?saved=1`)
}

export async function togglePropertyArchiveAction(propertyId: string, shouldArchive: boolean) {
  await requireAdminUser()
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      isArchived: shouldArchive,
      status: shouldArchive ? PropertyStatus.ARCHIVED : PropertyStatus.VACANT,
    },
  })
  revalidatePath('/admin')
  revalidatePath('/admin/properties')
}
