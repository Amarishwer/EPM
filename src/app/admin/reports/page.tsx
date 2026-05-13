import { MaintenanceStatus, PaymentStatus, PropertyStatus } from '@prisma/client'

import { formatCurrency, formatMonth } from '@/lib/format'
import { prisma } from '@/lib/prisma'

export default async function ReportsPage() {
  const [properties, payments, maintenanceRequests] = await Promise.all([
    prisma.property.findMany({
      where: { isArchived: false },
    }),
    prisma.payment.findMany({
      where: { isArchived: false },
    }),
    prisma.maintenanceRequest.findMany({
      where: { isArchived: false },
    }),
  ])

  const occupancyCount = properties.filter((property) => property.status === PropertyStatus.OCCUPIED).length
  const totalProperties = properties.length || 1
  const occupancyRate = Math.round((occupancyCount / totalProperties) * 100)

  const rentDuePayments = payments.filter((payment) => payment.status === PaymentStatus.PENDING)
  const overduePayments = payments.filter((payment) => payment.status === PaymentStatus.OVERDUE)
  const collectionByMonth = Array.from(
    payments
      .filter((payment) => payment.status === PaymentStatus.PAID)
      .reduce((map, payment) => {
        const label = formatMonth(payment.chargeMonth ?? payment.paidDate ?? payment.createdAt)
        map.set(label, (map.get(label) ?? 0) + Number(payment.amount))
        return map
      }, new Map<string, number>()),
  )
  const maintenanceByStatus = Object.values(MaintenanceStatus).map((status) => ({
    status,
    count: maintenanceRequests.filter((request) => request.status === status).length,
  }))

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Reports</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">Operational reporting</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
          Occupancy, rent due, overdue balances with late-fee context, payment collection by month, and maintenance status reporting are all generated directly from live admin data.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-4">
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Occupancy rate</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{occupancyRate}%</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Rent due</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{rentDuePayments.length}</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Overdue payments</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{overduePayments.length}</p>
        </article>
        <article className="rounded-[1.75rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Maintenance requests</p>
          <p className="mt-4 text-4xl font-semibold text-slate-950">{maintenanceRequests.length}</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Payment collection by month</h2>
          <div className="mt-6 space-y-3">
            {collectionByMonth.length ? (
              collectionByMonth.map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4">
                  <span className="text-sm font-medium text-slate-700">{month}</span>
                  <span className="text-sm font-semibold text-slate-950">{formatCurrency(amount)}</span>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                No paid charges yet.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Maintenance status report</h2>
          <div className="mt-6 space-y-3">
            {maintenanceByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-3xl border border-slate-200 px-4 py-4">
                <span className="text-sm font-medium text-slate-700">{item.status}</span>
                <span className="text-sm font-semibold text-slate-950">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
