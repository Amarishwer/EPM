import Link from 'next/link'
import { DepositTransactionType, DocumentCategory, TenantStatus, UserRole, UserStatus } from '@prisma/client'
import { notFound } from 'next/navigation'

import {
  recordDepositTransactionAction,
  resetTenantPasswordAction,
  setTenantDepositRequiredAction,
  toggleTenantDocumentVisibilityAction,
  updateTenantDetailsAction,
  updateTenantLifecycleAction,
  uploadTenantDocumentAction,
} from '@/app/admin/tenants/actions'
import { formatCurrency, formatDate, formatDocumentSize } from '@/lib/format'
import { getDocumentDownloadHref } from '@/lib/documents'
import { prisma } from '@/lib/prisma'

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [tenant, properties] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        tenant: true,
        requestedProperty: true,
        tenantDocuments: {
          orderBy: [{ createdAt: 'desc' }],
        },
        depositTransactions: {
          orderBy: [{ createdAt: 'desc' }],
        },
      },
    }),
    prisma.property.findMany({
      where: { isArchived: false },
      orderBy: [{ name: 'asc' }],
    }),
  ])

  if (!tenant || tenant.role !== UserRole.TENANT) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Tenant details</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">{[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">Edit identity, tenancy, account status, temporary password, security deposit, and documents from one screen.</p>
          </div>
          <Link href="/admin/tenants" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Back to tenants</Link>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form action={updateTenantDetailsAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <input type="hidden" name="tenantId" value={tenant.id} />
          <h2 className="text-2xl font-semibold text-slate-950">Edit tenant</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">First name</span><input required name="firstName" defaultValue={tenant.firstName ?? ''} placeholder="First name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Last name</span><input required name="lastName" defaultValue={tenant.lastName ?? ''} placeholder="Last name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Email</span><input required type="email" name="email" defaultValue={tenant.email} placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Phone</span><input name="phone" defaultValue={tenant.phone ?? ''} placeholder="Phone" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Requested property</span><select name="requestedPropertyId" defaultValue={tenant.requestedPropertyId ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                <option value="">No requested property</option>
                {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Assigned property</span><select name="assignedPropertyId" defaultValue={tenant.tenant?.id ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                <option value="">No assigned property</option>
                {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Account status</span><select name="status" defaultValue={tenant.status} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                {Object.values(UserStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Tenant status</span><select name="tenantStatus" defaultValue={tenant.tenantStatus ?? TenantStatus.PENDING} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                {Object.values(TenantStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Deposit required</span><input type="number" step="0.01" min="0" name="depositRequired" defaultValue={Number(tenant.depositRequired).toFixed(2)} placeholder="Deposit required" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Deposit paid</span><input type="number" step="0.01" min="0" name="depositPaid" defaultValue={Number(tenant.depositPaid).toFixed(2)} placeholder="Deposit paid" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Deposit balance</span><input type="number" step="0.01" name="depositBalance" defaultValue={Number(tenant.depositBalance).toFixed(2)} placeholder="Deposit balance" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
          </div>
          <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">SAVE DETAILS</button>
        </form>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-950">Application details</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Current address:</span> {tenant.currentAddress ?? 'Not provided'}</p>
              <p><span className="font-semibold text-slate-900">Occupation:</span> {tenant.occupation ?? 'Not provided'}</p>
              <p><span className="font-semibold text-slate-900">Monthly income:</span> {tenant.monthlyIncome ? formatCurrency(Number(tenant.monthlyIncome)) : 'Not provided'}</p>
              <p><span className="font-semibold text-slate-900">Desired move-in:</span> {formatDate(tenant.desiredMoveInDate)}</p>
              <p><span className="font-semibold text-slate-900">Applicant note:</span> {tenant.applicationMessage ?? 'Not provided'}</p>
            </div>
          </section>

          <form action={updateTenantLifecycleAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <input type="hidden" name="assignedPropertyId" value={tenant.tenant?.id ?? tenant.requestedPropertyId ?? ''} />
            <h2 className="text-2xl font-semibold text-slate-950">Lifecycle actions</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="submit" name="lifecycleAction" value="approve" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-emerald-700">APPROVE</button>
              <button type="submit" name="lifecycleAction" value="reject" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-amber-600">REJECT</button>
              <button type="submit" name="lifecycleAction" value="archive" className="rounded-full bg-slate-600 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-700">ARCHIVE</button>
              <button type="submit" name="lifecycleAction" value="unarchive" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">UNARCHIVE</button>
            </div>
          </form>

          <form action={resetTenantPasswordAction} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <h2 className="text-2xl font-semibold text-slate-950">Temporary password reset</h2>
            <p className="mt-3 text-sm text-slate-600">Temporary passwords are emailed and are not stored after generation.</p>
            <button type="submit" className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">RESET TEMP PASSWORD</button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Security deposit controls</h2>
          <p className="mt-3 text-sm text-slate-600">Required: {formatCurrency(Number(tenant.depositRequired))} | Paid: {formatCurrency(Number(tenant.depositPaid))} | Balance: {formatCurrency(Number(tenant.depositBalance))}</p>
          <form action={setTenantDepositRequiredAction} className="mt-6 space-y-3">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <input type="hidden" name="propertyId" value={tenant.tenant?.id ?? ''} />
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Required deposit amount</span><input type="number" step="0.01" min="0" name="amount" defaultValue={Number(tenant.depositRequired).toFixed(2)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Requirement note</span><input name="note" placeholder="Why this security deposit amount applies" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800">SET REQUIRED AMOUNT</button>
          </form>
          <form action={recordDepositTransactionAction} className="mt-6 space-y-3">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <input type="hidden" name="propertyId" value={tenant.tenant?.id ?? ''} />
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Transaction type</span><select name="type" defaultValue={DepositTransactionType.PAYMENT} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">
                {Object.values(DepositTransactionType).filter((type) => type !== DepositTransactionType.REQUIRED).map((type) => <option key={type} value={type}>{type}</option>)}
              </select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Transaction amount</span><input type="number" step="0.01" min="0" name="amount" placeholder="Amount" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Transaction note</span><input name="note" placeholder="Deposit transaction note" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800">RECORD TRANSACTION</button>
          </form>
          <div className="mt-6 space-y-3">
            {tenant.depositTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-900">{transaction.type}</span>
                  <span className="text-sm text-slate-500">{formatCurrency(Number(transaction.amount))}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{transaction.note ?? 'No note'}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">{formatDate(transaction.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-semibold text-slate-950">Tenant documents</h2>
          <form action={uploadTenantDocumentAction} className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-4">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <input type="hidden" name="propertyId" value={tenant.tenant?.id ?? tenant.requestedPropertyId ?? ''} />
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document title</span><input name="title" placeholder="Document title" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document category</span><select name="category" defaultValue={DocumentCategory.MISCELLANEOUS} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100">
                {Object.values(DocumentCategory).map((category) => <option key={category} value={category}>{category}</option>)}
              </select></label>
            <label className="inline-flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" name="isVisibleToTenant" value="1" /> Visible to tenant</label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Document file</span><input type="file" name="documentFile" className="w-full text-sm text-slate-600" /></label>
            <button type="submit" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold !text-white transition hover:bg-slate-800">UPLOAD DOCUMENT</button>
          </form>
          <div className="mt-6 space-y-3">
            {tenant.tenantDocuments.map((document) => (
              <div key={document.id} className="rounded-3xl border border-slate-200 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <a href={getDocumentDownloadHref(document.filePath)} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:underline">{document.title}</a>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500">{formatDocumentSize(document.sizeBytes)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{document.category} | {document.uploadedByAdmin ? 'Admin upload' : 'Tenant upload'}</p>
                <form action={toggleTenantDocumentVisibilityAction} className="mt-3 flex items-center gap-3">
                  <input type="hidden" name="documentId" value={document.id} />
                  <input type="hidden" name="tenantId" value={tenant.id} />
                  <input type="hidden" name="isVisibleToTenant" value={document.isVisibleToTenant ? '0' : '1'} />
                  <button type="submit" className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-slate-100">
                    {document.isVisibleToTenant ? 'HIDE FROM TENANT' : 'MAKE VISIBLE'}
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
