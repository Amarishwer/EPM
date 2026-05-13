import { PaymentStatus, PropertyStatus, UserRole } from '@prisma/client'

import { createPaymentAction, syncOverduePayments, updatePaymentAction } from '@/app/admin/payments/actions'
import { calculateAmountDueWithLateFee } from '@/lib/late-fees'
import { formatCurrency, formatDate, formatMonth } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ created?: string; error?: string }>
}) {
  const params = (await searchParams) ?? {}

  await syncOverduePayments()

  const [properties, payments, stats] = await Promise.all([
    prisma.property.findMany({
      where: {
        isArchived: false,
        status: { in: [PropertyStatus.OCCUPIED, PropertyStatus.RESERVED] },
        tenantId: { not: null },
      },
      include: { tenant: true },
      orderBy: { name: 'asc' },
    }),
    prisma.payment.findMany({
      where: { isArchived: false },
      include: {
        property: true,
        tenant: true,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.user.count({ where: { role: UserRole.TENANT } }),
  ])

  const totalOutstanding = payments
    .filter((payment) => payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.OVERDUE)
    .reduce((sum, payment) => sum + calculateAmountDueWithLateFee(Number(payment.amount), payment.dueDate).totalDue, 0)
  const totalCollected = payments
    .filter((payment) => payment.status === PaymentStatus.PAID)
    .reduce((sum, payment) => sum + Number(payment.amount), 0)

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Payments dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Tenant billing</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Create monthly charges manually, track due dates, add late fees based on 36% APR after the 10-day grace window, mark payments paid or overdue, and review payment history across all active properties.</p>
        {params.created === '1' && <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">Monthly charge created successfully.</div>}
        {params.error === 'create' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Please choose a property, tenant, and due date before creating a charge.</div>}
      </section>
      <section className="grid gap-5 md:grid-cols-4">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Tenant accounts</p><p className="mt-4 text-4xl font-semibold text-slate-950">{stats}</p></article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Payment records</p><p className="mt-4 text-4xl font-semibold text-slate-950">{payments.length}</p></article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Outstanding balance</p><p className="mt-4 text-4xl font-semibold text-slate-950">{formatCurrency(totalOutstanding)}</p></article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">Collected</p><p className="mt-4 text-4xl font-semibold text-slate-950">{formatCurrency(totalCollected)}</p></article>
      </section>
      <form action={createPaymentAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Create monthly charge</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Property</span><select required name="propertyId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="" disabled>Select property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Tenant</span><select required name="tenantId" defaultValue="" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="" disabled>Select tenant</option>{properties.filter((property) => property.tenant).map((property) => <option key={property.tenant!.id} value={property.tenant!.id}>{[property.tenant!.firstName, property.tenant!.lastName].filter(Boolean).join(' ') || property.tenant!.email}</option>)}</select></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Amount</span><input required type="number" step="0.01" min="0" name="amount" placeholder="Amount" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Due date</span><input required type="date" name="dueDate" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Charge month</span><input type="month" name="chargeMonth" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block lg:col-span-5"><span className="mb-2 block text-sm font-medium text-slate-700">Payment note</span><textarea name="note" rows={3} placeholder="Manual payment note" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
        </div>
        <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">CREATE CHARGE</button>
      </form>
      <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-semibold text-slate-950">Payment history</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Property / tenant</th>
                <th className="px-4 py-4">Charge month</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Due date</th>
                <th className="px-4 py-4">Late fee total</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Notes / update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => {
                const lateFeeDetails = calculateAmountDueWithLateFee(Number(payment.amount), payment.dueDate)
                return (
                  <tr key={payment.id} className="align-top">
                    <td className="px-4 py-5 text-sm text-slate-700"><p className="font-semibold text-slate-950">{payment.property.name}</p><p>{[payment.tenant.firstName, payment.tenant.lastName].filter(Boolean).join(' ') || payment.tenant.email}</p></td>
                    <td className="px-4 py-5 text-sm text-slate-700">{formatMonth(payment.chargeMonth)}</td>
                    <td className="px-4 py-5 text-sm font-semibold text-slate-950">{formatCurrency(Number(payment.amount))}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{formatDate(payment.dueDate)}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{lateFeeDetails.lateFee > 0 ? `${formatCurrency(lateFeeDetails.lateFee)} / ${formatCurrency(lateFeeDetails.totalDue)}` : 'No late fee'}</td>
                    <td className="px-4 py-5 text-sm text-slate-700">{payment.status}</td>
                    <td className="px-4 py-5">
                      <form action={updatePaymentAction} className="space-y-3">
                        <input type="hidden" name="paymentId" value={payment.id} />
                        <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Status</span><select name="status" defaultValue={payment.status} className="w-44 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">{Object.values(PaymentStatus).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                        <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Paid date</span><input type="date" name="paidDate" defaultValue={payment.paidDate ? payment.paidDate.toISOString().slice(0, 10) : ''} className="w-44 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                        <label className="block"><span className="mb-1 block text-xs font-medium text-slate-600">Note</span><textarea name="note" rows={3} defaultValue={payment.note ?? ''} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                        <div className="flex flex-wrap gap-2">
                          <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">SAVE</button>
                          <button type="submit" name="archive" value="1" className="rounded-full bg-slate-500 px-4 py-2 text-xs font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-600">ARCHIVE</button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
