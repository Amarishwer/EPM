import Image from 'next/image'
import { DocumentCategory, PaymentStatus, TenantStatus } from '@prisma/client'

import { changePasswordAction } from '@/app/account/actions'
import { PublishedAnnouncements } from '@/app/shared/published-announcements'
import { uploadTenantDocumentAction } from '@/app/tenant/actions'
import { requireTenantUser } from '@/lib/auth'
import { formatCurrency, formatDate, formatDocumentSize } from '@/lib/format'
import { getDocumentDownloadHref } from '@/lib/documents'
import { calculateAmountDueWithLateFee } from '@/lib/late-fees'

export default async function TenantPortalPage({
  searchParams,
}: {
  searchParams?: Promise<{ password?: string }>
}) {
  const params = (await searchParams) ?? {}
  const tenant = await requireTenantUser()
  const isRejectedTenant = tenant.tenantStatus === TenantStatus.REJECTED

  const outstandingBalance = tenant.payments
    .filter((payment) => payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.OVERDUE)
    .reduce((sum, payment) => sum + calculateAmountDueWithLateFee(Number(payment.amount), payment.dueDate).totalDue, 0)
  const todayLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="space-y-6">
      <section id="payments" className="rounded-md bg-white p-4 shadow-md ring-1 ring-slate-200 sm:p-5">
        <div className="relative min-h-[210px] overflow-hidden bg-[#f1f1f1] p-5 sm:min-h-[235px] sm:p-6">
          <div className="relative z-10 max-w-[70%] sm:max-w-[75%]">
            <p className="text-sm text-slate-700">Your account balance as of <strong>{todayLabel}</strong></p>
            <p className="mt-3 text-5xl font-light tracking-tight text-[#333] sm:text-6xl">{formatCurrency(outstandingBalance)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#payment-history" className="bg-[#111820] px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700">Review Charges</a>
              <a href="#account-security" className="bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Account Details</a>
            </div>
          </div>
          <div aria-hidden="true" className="absolute -right-8 -bottom-16 h-56 w-56 rounded-full bg-slate-200 sm:right-6 sm:bottom-[-5rem] sm:h-64 sm:w-64" />
          <div aria-hidden="true" className="absolute right-8 bottom-0 hidden h-36 w-28 rounded-t-[48%] bg-[#d5dce0] sm:block" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-500 text-xl text-slate-700">◷</span>
            <div>
              <h2 className="font-semibold text-slate-900">Automatic Payments</h2>
              <p className="text-sm text-slate-600"><span className="mr-1 text-red-600">●</span>Not set up <span className="hidden sm:inline">| Automatic payments are not available in this portal yet.</span></p>
            </div>
          </div>
          <button type="button" disabled title="Automatic payments are not available yet" className="cursor-not-allowed bg-slate-100 px-4 py-2 text-sm text-slate-500">Setup Autopay</button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 bg-[#f1f1f1] px-4 py-3 text-sm">
          <p className="text-slate-700">{tenant.payments.length ? `${tenant.payments.length} charge${tenant.payments.length === 1 ? '' : 's'} on your account.` : "Looks like you don't have any charges at the moment..."}</p>
          <div className="flex gap-1 text-blue-700 underline">
            <a href="#payment-history">Recent Activity</a><span>|</span><a href="#payment-history">Monthly Charges</a>
          </div>
        </div>
      </section>

      {isRejectedTenant && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          Your current tenant status is rejected. To request a different property or resubmit your details, use the registration flow again and an admin can review the new request.
        </div>
      )}

      <section id="property-details" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-2xl font-semibold text-slate-950">Property details</h3>
          {tenant.tenant ? (
            <div className="mt-6 space-y-5">
              {tenant.tenant.photos[0] && (
                <div className="relative aspect-[16/8] overflow-hidden rounded-[1.5rem]">
                  <Image src={tenant.tenant.photos[0].path} alt={tenant.tenant.name} fill className="object-cover" />
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Monthly rent</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(tenant.tenant.monthlyRent))}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Security deposit</p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(tenant.tenant.securityDeposit))}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600">Lease: {formatDate(tenant.tenant.leaseStartDate)} - {formatDate(tenant.tenant.leaseEndDate)}</p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-600">Your account is approved, but no property is assigned yet.</p>
          )}
        </article>
        <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-2xl font-semibold text-slate-950">Recent alerts</h3>
          <div className="mt-6 space-y-3">
            {tenant.notifications.length ? tenant.notifications.map((notification) => (
              <div key={notification.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-2 text-sm text-slate-600">{notification.message}</p>
              </div>
            )) : <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No alerts yet.</div>}
          </div>
        </article>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <article id="payment-history" className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-2xl font-semibold text-slate-950">Payment history</h3>
          <div className="mt-6 space-y-3">
            {tenant.payments.length ? tenant.payments.map((payment) => {
              const lateFeeDetails = calculateAmountDueWithLateFee(Number(payment.amount), payment.dueDate)
              return (
                <div key={payment.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{formatCurrency(Number(payment.amount))}</span>
                    <span className="text-sm text-slate-500">{payment.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">Due {formatDate(payment.dueDate)}</p>
                  {lateFeeDetails.lateFee > 0 && <p className="mt-2 text-sm text-amber-700">Late fee: {formatCurrency(lateFeeDetails.lateFee)} | Total due: {formatCurrency(lateFeeDetails.totalDue)}</p>}
                  {payment.note && <p className="mt-2 text-sm text-slate-500">{payment.note}</p>}
                </div>
              )
            }) : <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No payment records yet.</div>}
          </div>
        </article>
        <article id="documents" className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-2xl font-semibold text-slate-950">Documents</h3>
          <form action={uploadTenantDocumentAction} className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document title</span><input name="title" placeholder="Document title" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document category</span><select name="category" defaultValue={DocumentCategory.MISCELLANEOUS} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100">
                {Object.values(DocumentCategory).map((category) => <option key={category} value={category}>{category}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document file</span><input type="file" name="documentFile" className="w-full text-sm text-slate-600" /></label>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800">UPLOAD DOCUMENT</button>
            <p className="text-xs text-slate-500">Uploads are limited to 25MB.</p>
          </form>
          <div className="mt-6 space-y-3">
            {tenant.tenantDocuments.length ? tenant.tenantDocuments.map((document) => (
              <a key={document.id} href={getDocumentDownloadHref(document.filePath)} target="_blank" rel="noreferrer" className="block rounded-3xl border border-slate-200 px-4 py-4 transition hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{document.title}</span>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{formatDocumentSize(document.sizeBytes)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{document.category}</p>
              </a>
            )) : <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">No visible documents yet.</div>}
          </div>
        </article>
      </section>
      <section id="account-security" className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-2xl font-semibold text-slate-950">Account security</h3>
        {params.password === 'changed' && <p className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Password updated.</p>}
        {(params.password === 'invalid' || params.password === 'weak') && <p className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Password update failed. Check your current password and use at least 12 characters with uppercase, lowercase, and a number.</p>}
        <form action={changePasswordAction} className="mt-6 grid gap-4 md:grid-cols-3">
          <input type="hidden" name="returnTo" value="/tenant" />
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Current password</span><input required type="password" name="currentPassword" placeholder="Current password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">New password</span><input required type="password" name="newPassword" minLength={12} placeholder="New password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span><input required type="password" name="confirmPassword" minLength={12} placeholder="Confirm new password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800 md:w-fit">UPDATE PASSWORD</button>
        </form>
      </section>
      <PublishedAnnouncements audience="PUBLIC" />
    </div>
  )
}
