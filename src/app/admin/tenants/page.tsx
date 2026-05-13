import Link from 'next/link'
import { Prisma, TenantStatus, UserRole, UserStatus } from '@prisma/client'

import { createAdminAction, createTenantAction } from '@/app/admin/tenants/actions'
import { formatCurrency } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function TenantsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; tenantStatus?: string; accountStatus?: string; assignedProperty?: string; requestedProperty?: string; created?: string; error?: string }>
}) {
  const params = (await searchParams) ?? {}

  const where: Prisma.UserWhereInput = {
    role: UserRole.TENANT,
    ...(params.q
      ? {
          OR: [
            { firstName: { contains: params.q } },
            { lastName: { contains: params.q } },
            { email: { contains: params.q } },
          ],
        }
      : {}),
    ...(params.tenantStatus ? { tenantStatus: params.tenantStatus as TenantStatus } : {}),
    ...(params.accountStatus ? { status: params.accountStatus as UserStatus } : {}),
    ...(params.assignedProperty ? { tenant: { is: { id: params.assignedProperty } } } : {}),
    ...(params.requestedProperty ? { requestedPropertyId: params.requestedProperty } : {}),
  }

  const [tenants, properties, admins] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        tenant: true,
        requestedProperty: true,
      },
      orderBy: [{ createdAt: 'desc' }],
    }),
    prisma.property.findMany({
      where: { isArchived: false },
      orderBy: [{ name: 'asc' }],
    }),
    prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      orderBy: [{ createdAt: 'desc' }],
    }),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Tenant management</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Tenants and admins</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Search and filter one complete tenant list, then open any tenant record to edit details, approve or reject, archive or unarchive, manage deposits, and upload documents.
        </p>
        {params.created && <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">{params.created === 'tenant' ? 'Tenant account created and the temporary password was sent by email.' : 'Admin account created and the temporary password was sent by email.'}</div>}
        {params.error && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Please complete the required form fields before submitting.</div>}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <form action={createTenantAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Create tenant account</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">First name</span><input required name="firstName" placeholder="First name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Last name</span><input required name="lastName" placeholder="Last name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Email address</span><input required type="email" name="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span><input name="phone" placeholder="Phone number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Property</span><select name="propertyId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                <option value="">No property selected yet</option>
                {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
              </select></label>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">CREATE TENANT</button>
        </form>
        <form action={createAdminAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Create admin user</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">First name</span><input required name="firstName" placeholder="First name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Last name</span><input required name="lastName" placeholder="Last name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Email address</span><input required type="email" name="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span><input name="phone" placeholder="Phone number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">CREATE ADMIN</button>
        </form>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form className="grid gap-4 md:grid-cols-5">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Search tenants</span><input type="search" name="q" defaultValue={params.q ?? ''} placeholder="Search tenant by name or email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Tenant status</span><select name="tenantStatus" defaultValue={params.tenantStatus ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="">All tenant statuses</option>{Object.values(TenantStatus).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Account status</span><select name="accountStatus" defaultValue={params.accountStatus ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="">All account statuses</option>{Object.values(UserStatus).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Assigned property</span><select name="assignedProperty" defaultValue={params.assignedProperty ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="">All assigned properties</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Requested property</span><select name="requestedProperty" defaultValue={params.requestedProperty ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="">All requested properties</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800 md:col-span-5 md:w-fit">APPLY FILTERS</button>
        </form>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Tenant list</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Tenant</th>
                <th className="px-4 py-4">Tenant status</th>
                <th className="px-4 py-4">Account status</th>
                <th className="px-4 py-4">Requested property</th>
                <th className="px-4 py-4">Assigned property</th>
                <th className="px-4 py-4">Security deposit balance</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="px-4 py-5 text-sm text-slate-700"><p className="font-semibold text-slate-950">{[tenant.firstName, tenant.lastName].filter(Boolean).join(' ')}</p><p>{tenant.email}</p></td>
                  <td className="px-4 py-5 text-sm text-slate-700">{tenant.tenantStatus ?? 'PENDING'}</td>
                  <td className="px-4 py-5 text-sm text-slate-700">{tenant.status}</td>
                  <td className="px-4 py-5 text-sm text-slate-700">{tenant.requestedProperty?.name ?? 'None'}</td>
                  <td className="px-4 py-5 text-sm text-slate-700">{tenant.tenant?.name ?? 'Unassigned'}</td>
                  <td className="px-4 py-5 text-sm text-slate-700">{formatCurrency(Number(tenant.depositBalance))}</td>
                  <td className="px-4 py-5"><Link href={`/admin/tenants/${tenant.id}`} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-slate-100">EDIT</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Admin accounts</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr><th className="px-4 py-4">Admin</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Password delivery</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-5 text-sm text-slate-700"><p className="font-semibold text-slate-950">{[admin.firstName, admin.lastName].filter(Boolean).join(' ')}</p><p>{admin.email}</p></td>
                  <td className="px-4 py-5 text-sm text-slate-700">{admin.status}</td>
                  <td className="px-4 py-5 text-sm text-slate-700">Temporary passwords are emailed and not stored.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
