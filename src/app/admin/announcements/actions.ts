'use server'

import { AnnouncementAudience } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { requireAdminUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function parseString(value: FormDataEntryValue | null) {
  const parsed = String(value ?? '').trim()
  return parsed || null
}

export async function createAnnouncementAction(formData: FormData) {
  const admin = await requireAdminUser()

  const title = parseString(formData.get('title'))
  const body = parseString(formData.get('body'))
  const audience = String(formData.get('audience') ?? AnnouncementAudience.BOTH) as AnnouncementAudience
  const shouldPublish = String(formData.get('isPublished') ?? '') === '1'

  if (!title || !body) {
    return
  }

  await prisma.announcement.create({
    data: {
      title,
      body,
      audience,
      isPublished: shouldPublish,
      publishedAt: shouldPublish ? new Date() : null,
      createdById: admin.id,
    },
  })

  revalidatePath('/admin/announcements')
}

export async function toggleAnnouncementPublishAction(formData: FormData) {
  await requireAdminUser()

  const announcementId = String(formData.get('announcementId') ?? '')
  const shouldPublish = String(formData.get('shouldPublish') ?? '') === '1'

  await prisma.announcement.update({
    where: { id: announcementId },
    data: {
      isPublished: shouldPublish,
      publishedAt: shouldPublish ? new Date() : null,
    },
  })

  revalidatePath('/admin/announcements')
}
