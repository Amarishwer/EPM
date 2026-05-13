'use server'

import crypto from 'node:crypto'

import bcrypt from 'bcryptjs'
import { UserRole, UserStatus } from '@prisma/client'
import { redirect } from 'next/navigation'

import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { isRateLimited, validatePassword } from '@/lib/security'

const RESET_TOKEN_BYTES = 32
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function getBaseUrl() {
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function getRequestedRole(value: FormDataEntryValue | null) {
  return String(value ?? '') === 'admin' ? UserRole.ADMIN : UserRole.TENANT
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = getRequestedRole(formData.get('role'))

  if (!email || isRateLimited(`password-reset:${email}`, 3, 60 * 60 * 1000)) {
    redirect('/forgot-password?sent=1')
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      role,
      status: { not: UserStatus.ARCHIVED },
    },
  })

  if (user) {
    const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex')
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset your EPM password',
        html: `<p>Use this link to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">Reset password</a></p>`,
        text: `Use this link to reset your password. It expires in 1 hour: ${resetUrl}`,
      })
    } catch (error) {
      console.error('Password reset email failed.', error)
    }
  }

  redirect('/forgot-password?sent=1')
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get('token') ?? '')
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!token || !password || password !== confirmPassword || validatePassword(password)) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=invalid`)
  }

  const tokenHash = hashToken(token)
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date() || resetToken.user.status === UserStatus.ARCHIVED) {
    redirect('/reset-password?error=expired')
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        NOT: { id: resetToken.id },
      },
      data: { usedAt: new Date() },
    }),
  ])

  redirect('/reset-password?success=1')
}
