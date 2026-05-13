import Link from 'next/link'
import { PaymentStatus, PropertyStatus, UserRole } from '@prisma/client'

import { changePasswordAction } from '@/app/account/actions'
import { formatCurrency } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ password?: string }>
}) {
  const params = (await searchParams) ?? {}
  const [propertyCount, occupiedCount, tenantCount, overduePayments, recentProperties, notifications] = await Promise.all([
    prisma.property.count({ where: { isArchived: false } }),
    prisma.property.count({ where: { isArchived: false, status: PropertyStatus.OCCUPIED } }),
    prisma.user.count({ where: { role: UserRole.TENANT } }),
    prisma.payment.count({ where: { status: PaymentStatus.OVERDUE, isArchived: false } }),
    prisma.property.findMany({
      where: { isArchived: false },
      include: { tenant: true, photos: { take: 1, where: { isPrimary: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  const cards = [
    { label: 'Active properties', value: propertyCount, helper: 'Live inventory across the portfolio' },
    { label: 'Occupied units', value: occupiedCount, helper: 'Lease-backed units currently assigned' },
    { label: 'Tenants', value: tenantCount, helper: 'Tenant accounts and pending approvals' },
    { label: 'Overdue charges', value: overduePayments, helper: 'Items needing payment follow-up' },
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,_#fff7ed_0%,_#ffffff_48%,_#eff6ff_100%)] p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">Tenant operations live</p>
            <h1 className="mt-4 text-4xl font-semibold text-slate-950">Admin portal overview</h1>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Manage properties, tenants, security deposits, documents, payments, maintenance workflows, announcements, and reporting from one protected workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/properties/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">ADD PROPERTY</Link>
            <Link href="/admin/tenants" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-white">OPEN TENANTS</Link>
          </div>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.helper}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Recently updated properties</h2>
              <p className="mt-2 text-sm text-slate-500">Quick visibility into the units most recently touched by the admin team.</p>
            </div>
            <Link href="/admin/properties" className="text-sm font-semibold text-amber-700 hover:text-amber-800">Open properties</Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentProperties.map((property) => (
              <div key={property.id} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{property.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Status: {property.status} {property.tenant ? `- Tenant: ${property.tenant.firstName ?? ''} ${property.tenant.lastName ?? ''}` : '- No tenant assigned'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Monthly rent</p>
                    <p className="text-2xl font-semibold text-slate-950">{formatCurrency(Number(property.monthlyRent))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Notification center</h2>
          <p className="mt-2 text-sm text-slate-500">In-app alerts are ready. Email delivery stays disabled until SMTP credentials are added.</p>
          <div className="mt-6 space-y-3">
            {notifications.length ? notifications.map((notification) => (
              <div key={notification.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{notification.type}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
              </div>
            )) : <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">Notifications will appear here when overdue payments, maintenance issues, and tenant approvals are wired in.</div>}
          </div>
        </article>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Account security</h2>
        {params.password === 'changed' && <p className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Password updated.</p>}
        {(params.password === 'invalid' || params.password === 'weak') && <p className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Password update failed. Check your current password and use at least 12 characters with uppercase, lowercase, and a number.</p>}
        <form action={changePasswordAction} className="mt-6 grid gap-4 md:grid-cols-3">
          <input type="hidden" name="returnTo" value="/admin" />
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Current password</span><input required type="password" name="currentPassword" placeholder="Current password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">New password</span><input required type="password" name="newPassword" minLength={12} placeholder="New password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span><input required type="password" name="confirmPassword" minLength={12} placeholder="Confirm new password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800 md:w-fit">UPDATE PASSWORD</button>
        </form>
      </section>
    </div>
  )
}
