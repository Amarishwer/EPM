import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'

import { SignOutButton } from '@/app/admin/sign-out-button'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const navigation = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/properties', label: 'Properties' },
  { href: '/admin/tenants', label: 'Tenants' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/maintenance', label: 'Maintenance' },
  { href: '/admin/announcements', label: 'Announcements' },
  { href: '/admin/reports', label: 'Reports' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession()

  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    redirect('/admin-login')
  }

  const [admin, unreadNotifications] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    }),
  ])

  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#172554_100%)] px-6 py-8 text-white">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">EPM Admin</p>
            <h1 className="mt-4 text-2xl font-semibold text-white">Operations Hub</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Protected workspace for property operations, tenant oversight, payments, maintenance, documents, and alerts.
            </p>
          </div>
          <nav className="mt-8 space-y-2">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-10 rounded-[2rem] border border-amber-300/20 bg-amber-400/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Unread alerts</p>
            <p className="mt-3 text-4xl font-semibold text-white">{unreadNotifications}</p>
            <p className="mt-2 text-sm text-slate-200">Dashboard notifications stay in-app until email is configured.</p>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Admin session</p>
                <h2 className="text-2xl font-semibold text-slate-950">
                  {[admin?.firstName, admin?.lastName].filter(Boolean).join(' ') || admin?.email}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Secure session active</div>
                <SignOutButton />
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
