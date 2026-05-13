'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/security'

function getSafeReturnPath(value: string) {
  if (value === '/admin' || value === '/tenant') {
    return value
  }

  return '/tenant'
}

export async function changePasswordAction(formData: FormData) {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    redirect('/tenant-login')
  }

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')
  const returnTo = getSafeReturnPath(String(formData.get('returnTo') ?? '/tenant'))

  if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
    redirect(`${returnTo}?password=invalid`)
  }

  const validationError = validatePassword(newPassword)
  if (validationError) {
    redirect(`${returnTo}?password=weak`)
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    redirect('/tenant-login')
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
  if (!isCurrentPasswordValid) {
    redirect(`${returnTo}?password=invalid`)
  }

  const password = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { password },
  })

  revalidatePath(returnTo)
  redirect(`${returnTo}?password=changed`)
}
