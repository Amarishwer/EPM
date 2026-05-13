'use server'

import { DocumentCategory } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { requireTenantUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { saveUploadedDocument } from '@/lib/uploads'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

export async function uploadTenantDocumentAction(formData: FormData) {
  const tenant = await requireTenantUser()
  const file = formData.get('documentFile')
  const category = String(formData.get('category') ?? DocumentCategory.MISCELLANEOUS) as DocumentCategory
  const title = parseString(formData.get('title')) ?? 'Tenant Document'
  const propertyId = tenant.tenant?.id ?? null

  if (!(file instanceof File) || !file.size || !propertyId) {
    return
  }

  const storedFile = await saveUploadedDocument(file)
  if (!storedFile) {
    return
  }

  await prisma.tenantDocument.create({
    data: {
      title,
      category,
      filePath: storedFile.filePath,
      fileName: storedFile.fileName,
      mimeType: storedFile.mimeType,
      sizeBytes: storedFile.sizeBytes,
      uploadedByAdmin: false,
      isVisibleToTenant: true,
      tenantId: tenant.id,
      propertyId,
    },
  })

  revalidatePath('/tenant')
}
