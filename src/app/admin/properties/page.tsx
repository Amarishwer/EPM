import Link from 'next/link'
import { Prisma, PropertyStatus, PropertyType, UserRole, UserStatus } from '@prisma/client'

import { togglePropertyArchiveAction } from '@/app/admin/properties/actions'
import { formatCurrency, formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; status?: string; type?: string; archived?: string }>
}) {
  const params = (await searchParams) ?? {}
  const search = params.q?.trim() ?? ''
  const status = params.status?.trim() ?? ''
  const type = params.type?.trim() ?? ''
  const archivedOnly = params.archived === '1'

  const where: Prisma.PropertyWhereInput = {
    isArchived: archivedOnly,
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { locality: { contains: search } },
            { areaName: { contains: search } },
            { colonyName: { contains: search } },
            { buildingName: { contains: search } },
          ],
        }
      : {}),
    ...(status && status !== 'ALL' ? { status: status as PropertyStatus } : {}),
    ...(type && type !== 'ALL' ? { propertyType: type as PropertyType } : {}),
  }

  const [properties, tenantsCount] = await Promise.all([
    prisma.property.findMany({
      where,
      include: {
        tenant: true,
        photos: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: [{ isArchived: 'asc' }, { updatedAt: 'desc' }],
    }),
    prisma.user.count({
      where: {
        role: UserRole.TENANT,
        status: {
          not: UserStatus.ARCHIVED,
        },
      },
    }),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Portfolio management</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Properties</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Search the portfolio, review occupancy, GPS location, property type, lease data, pricing, imagery, and tenant assignment.
            </p>
          </div>
          <Link href="/admin/properties/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">
            ADD PROPERTY
          </Link>
        </div>
      </section>
      <section className="grid gap-5 md:grid-cols-3">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-medium text-slate-500">Visible properties</p><p className="mt-4 text-4xl font-semibold text-slate-950">{properties.length}</p></article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-medium text-slate-500">Tenant accounts</p><p className="mt-4 text-4xl font-semibold text-slate-950">{tenantsCount}</p></article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm font-medium text-slate-500">Archive mode</p><p className="mt-4 text-lg font-semibold text-slate-950">{archivedOnly ? 'Showing archived units' : 'Showing active units'}</p></article>
      </section>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <form className="grid gap-4 md:grid-cols-[1fr_180px_180px_180px]">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Search properties</span><input type="search" name="q" defaultValue={search} placeholder="Search by name, locality, area, colony, or building" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Status</span><select name="status" defaultValue={status || 'ALL'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="ALL">All statuses</option>{Object.values(PropertyStatus).map((propertyStatus) => <option key={propertyStatus} value={propertyStatus}>{propertyStatus}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Property type</span><select name="type" defaultValue={type || 'ALL'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="ALL">All types</option>{Object.values(PropertyType).map((propertyType) => <option key={propertyType} value={propertyType}>{propertyType}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Archive filter</span><select name="archived" defaultValue={archivedOnly ? '1' : '0'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="0">Active properties</option><option value="1">Archived properties</option></select></label>
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] text-white transition hover:bg-slate-800 md:col-span-4 md:w-fit">APPLY FILTERS</button>
        </form>
      </section>
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tenant</th>                
                <th className="px-6 py-4">Monthly rent</th>
                <th className="px-6 py-4">Security deposit</th>
                <th className="px-6 py-4">Lease end</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => {
                const archiveAction = togglePropertyArchiveAction.bind(null, property.id, !property.isArchived)
                return (
                  <tr key={property.id} className="align-top">
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-base font-semibold text-slate-950">{property.name}</p>                        
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-600">{property.propertyType}{property.propertyType === PropertyType.RESIDENTIAL && (property.bedrooms || property.bathrooms) ? ` - ${property.bedrooms ?? 0} bed / ${property.bathrooms ?? 0} bath` : ''}</td>
                    <td className="px-6 py-5"><span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{property.status}</span></td>
                    <td className="px-6 py-5 text-sm text-slate-600">{property.tenant ? [property.tenant.firstName, property.tenant.lastName].filter(Boolean).join(' ') || property.tenant.email : 'Unassigned'}</td>                    
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800">{formatCurrency(Number(property.monthlyRent))}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatCurrency(Number(property.securityDeposit))}</td>
                    <td className="px-6 py-5 text-sm text-slate-600">{formatDate(property.leaseEndDate)}</td>
                    <td className="px-6 py-5"><div className="flex flex-wrap gap-3"><Link href={`/admin/properties/${property.id}/edit`} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-slate-100">EDIT</Link><form action={archiveAction}><button type="submit" className="rounded-full border border-amber-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-amber-800 transition hover:bg-amber-50">{property.isArchived ? 'UNARCHIVE' : 'ARCHIVE'}</button></form></div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!properties.length && <div className="px-6 py-16 text-center text-sm text-slate-500">No properties match the current filters.</div>}
      </section>
    </div>
  )
}
