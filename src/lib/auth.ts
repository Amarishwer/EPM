import { TenantStatus, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { prisma } from '@/lib/prisma'

const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function isLoginLimited(email: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt || attempt.resetAt <= now) {
    loginAttempts.set(email, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return false
  }

  attempt.count += 1
  return attempt.count > MAX_LOGIN_ATTEMPTS
}

function clearLoginLimit(email: string) {
  loginAttempts.delete(email)
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin-login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.toLowerCase().trim()
        if (isLoginLimited(email)) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || user.status === UserStatus.ARCHIVED) {
          return null
        }

        if (
          user.role === UserRole.TENANT &&
          user.tenantStatus !== TenantStatus.APPROVED &&
          user.tenantStatus !== TenantStatus.REJECTED
        ) {
          return null
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password)
        if (!isValidPassword) {
          return null
        }

        clearLoginLimit(email)

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.status = user.status
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
        session.user.role = (token.role as UserRole | undefined) ?? UserRole.TENANT
        session.user.status = (token.status as UserStatus | undefined) ?? UserStatus.ACTIVE
      }

      return session
    },
  },
}

export async function getAuthSession() {
  return getServerSession(authOptions)
}

export async function getCurrentAdmin() {
  const session = await getAuthSession()

  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
  })
}

export async function requireAdminUser() {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin-login')
  }

  return admin
}

export async function getCurrentTenant() {
  const session = await getAuthSession()

  if (!session?.user?.id || session.user.role !== UserRole.TENANT) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenant: {
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
      payments: {
        where: { isArchived: false },
        orderBy: [{ dueDate: 'asc' }],
      },
      maintenanceRequests: {
        where: { isArchived: false },
        orderBy: [{ createdAt: 'desc' }],
      },
      notifications: {
        orderBy: [{ createdAt: 'desc' }],
        take: 8,
      },
      tenantDocuments: {
        where: {
          OR: [
            { uploadedByAdmin: false },
            { isVisibleToTenant: true },
          ],
        },
        orderBy: [{ createdAt: 'desc' }],
      },
      depositTransactions: {
        orderBy: [{ createdAt: 'desc' }],
      },
    },
  })
}

export async function requireTenantUser() {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    redirect('/tenant-login')
  }

  return tenant
}
