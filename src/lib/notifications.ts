import { UserRole, UserStatus } from '@prisma/client'

import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

type NotificationInput = {
  title: string
  message: string
  type: string
  link?: string
}

export async function notifyAdmins(input: NotificationInput) {
  const admins = await prisma.user.findMany({
    where: {
      role: UserRole.ADMIN,
      status: {
        not: UserStatus.ARCHIVED,
      },
    },
    select: {
      id: true,
      email: true,
    },
  })

  if (!admins.length) {
    return
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
    })),
  })

  await Promise.all(
    admins.map(async (admin) => {
      const result = await sendEmail({
        to: admin.email,
        subject: input.title,
        html: `<p>${input.message}</p>`,
        text: input.message,
      })

      return result
    }),
  )
}

export async function notifyTenant(userId: string, email: string, input: NotificationInput) {
  await prisma.notification.create({
    data: {
      userId,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
    },
  })

  await sendEmail({
    to: email,
    subject: input.title,
    html: `<p>${input.message}</p>`,
    text: input.message,
  })
}
