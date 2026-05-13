import { MaintenanceStatus, PropertyStatus } from '@prisma/client'

import { createMaintenanceAction, updateMaintenanceAction } from '@/app/admin/maintenance/actions'
import { formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function MaintenancePage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; error?: string }>
}) {
  const params = (await searchParams) ?? {}

  const [properties, requests] = await Promise.all([
    prisma.property.findMany({
      where: {
        isArchived: false,
        status: { in: [PropertyStatus.OCCUPIED, PropertyStatus.MAINTENANCE, PropertyStatus.RESERVED] },
      },
      include: { tenant: true },
      orderBy: { name: 'asc' },
    }),
    prisma.maintenanceRequest.findMany({
      where: { isArchived: false },
      include: {
        property: true,
        tenant: true,
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    }),
  ])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Maintenance dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Tenant service requests</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Create and manage maintenance work orders, assign a vendor or person, add internal notes, and move requests through the full status workflow.</p>
        {params.created === '1' && <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">Maintenance request created successfully.</div>}
        {params.error === 'create' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Please choose a property, tenant, title, and description before creating a request.</div>}
      </section>
      <section className="grid gap-5 md:grid-cols-4">
        {Object.values(MaintenanceStatus).slice(0, 4).map((status) => (
          <article key={status} className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{status}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{requests.filter((request) => request.status === status).length}</p>
          </article>
        ))}
      </section>
      <form action={createMaintenanceAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Create maintenance request</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Property</span><select required name="propertyId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="" disabled>Select property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Tenant</span><select required name="tenantId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="" disabled>Select tenant</option>{properties.filter((property) => property.tenant).map((property) => <option key={property.tenant!.id} value={property.tenant!.id}>{[property.tenant!.firstName, property.tenant!.lastName].filter(Boolean).join(' ') || property.tenant!.email}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Issue title</span><input required name="title" placeholder="Issue title" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Vendor or assignee</span><input name="assignee" placeholder="Vendor or assignee" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Priority</span><select name="priority" defaultValue="medium" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
          <label className="block lg:col-span-3"><span className="mb-2 block text-sm font-medium text-slate-700">Description</span><textarea required name="description" rows={4} placeholder="Describe the maintenance issue" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
        </div>
        <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">CREATE REQUEST</button>
      </form>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Maintenance queue</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr><th className="px-4 py-4">Request</th><th className="px-4 py-4">Property / tenant</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Assignment</th><th className="px-4 py-4">Admin update</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((request) => (
                <tr key={request.id} className="align-top">
                  <td className="px-4 py-5 text-sm text-slate-700"><p className="font-semibold text-slate-950">{request.title}</p><p className="mt-1 text-slate-600">{request.description}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">Created {formatDate(request.createdAt)}</p></td>
                  <td className="px-4 py-5 text-sm text-slate-700"><p className="font-semibold text-slate-950">{request.property.name}</p><p>{[request.tenant.firstName, request.tenant.lastName].filter(Boolean).join(' ') || request.tenant.email}</p></td>
                  <td className="px-4 py-5 text-sm text-slate-700"><p>{request.status}</p><p className="text-slate-500">{request.priority ?? 'No priority'}</p></td>
                  <td className="px-4 py-5 text-sm text-slate-700">{request.assignee ?? 'Unassigned'}</td>
                  <td className="px-4 py-5">
                    <form action={updateMaintenanceAction} className="space-y-3">
                      <input type="hidden" name="requestId" value={request.id} />
                      <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Status</span><select name="status" defaultValue={request.status} className="w-44 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">{Object.values(MaintenanceStatus).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                      <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Priority</span><input name="priority" defaultValue={request.priority ?? ''} placeholder="Priority" className="w-44 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                      <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Assignee</span><input name="assignee" defaultValue={request.assignee ?? ''} placeholder="Assignee" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                      <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Admin notes</span><textarea name="adminNotes" rows={3} defaultValue={request.adminNotes ?? ''} placeholder="Admin notes" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">SAVE</button>
                        <button type="submit" name="archive" value="1" className="rounded-full bg-slate-500 px-4 py-2 text-xs font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-600">ARCHIVE</button>
                      </div>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
