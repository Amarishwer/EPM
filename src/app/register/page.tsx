import Image from 'next/image'
import Link from 'next/link'

import { submitTenantRegistrationAction } from '@/app/register/actions'
import { PublishedAnnouncements } from '@/app/shared/published-announcements'
import { formatCurrency, formatDate } from '@/lib/format'
import { prisma } from '@/lib/prisma'

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="EPM Logo" width={96} height={96} className="object-cover mix-blend-multiply" />
          <span className="ml-4 flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-wide whitespace-nowrap text-[#092136]">EDAM</span>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap text-[#092136]">PROPERTY MANAGEMENT</span>
          </span>
        </Link>
        <Link href="/tenant-login" className="rounded-full bg-[#092136] px-5 py-2 text-sm font-semibold !text-white shadow transition hover:bg-[#0d2c4a]">Login</Link>
      </div>
    </header>
  )
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; success?: string; propertyId?: string }>
}) {
  const params = (await searchParams) ?? {}
  const properties = await prisma.property.findMany({
    where: { isArchived: false },
    orderBy: [{ status: 'asc' }, { name: 'asc' }],
  })
  const selectedProperty = params.propertyId
    ? properties.find((property) => property.id === params.propertyId)
    : null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)]">
      <Header />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row">
        <section className="w-full lg:max-w-xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Tenant registration</p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-950">Create your tenant profile</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">Step 1 covers your personal information. Step 2 lets you choose the property or unit you want associated with your account for admin approval.</p>
            {selectedProperty && (
              <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Applying for {selectedProperty.name}. Rent: {formatCurrency(Number(selectedProperty.monthlyRent))}. Available {selectedProperty.status === 'VACANT' ? 'now' : formatDate(selectedProperty.leaseEndDate)}.
                <span className="mt-2 block">
                  Type: {selectedProperty.propertyType}
                  {selectedProperty.propertyType === 'RESIDENTIAL' ? ` - ${selectedProperty.bedrooms ?? 0} bed / ${selectedProperty.bathrooms ?? 0} bath` : ''}
                </span>
              </div>
            )}
            {params.success === '1' && <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">Registration submitted. An admin will review and approve your property assignment.</div>}
            {params.error === 'exists' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">An account with that email already exists.</div>}
            {params.error === 'missing' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Please complete all required fields before submitting.</div>}
            {params.error === 'password' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Use a password with at least 12 characters, including uppercase, lowercase, and a number.</div>}
            {params.error === 'limited' && <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Too many registration attempts. Please wait and try again later.</div>}
            <form action={submitTenantRegistrationAction} className="mt-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Step 1: Personal information</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">First name</span><input required name="firstName" placeholder="First name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Last name</span><input required name="lastName" placeholder="Last name" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Email address</span><input required type="email" name="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span><input required name="phone" placeholder="Phone number" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Create password</span><input required type="password" name="password" placeholder="Create password" minLength={12} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                </div>
                <p className="mt-3 text-xs text-slate-500">Use at least 12 characters with uppercase, lowercase, and a number.</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Step 2: Application details</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Occupation</span><input name="occupation" placeholder="Occupation" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Monthly income</span><input type="number" min="0" step="0.01" name="monthlyIncome" placeholder="Monthly income" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Desired move-in date</span><input type="date" name="desiredMoveInDate" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Current address</span><input name="currentAddress" placeholder="Current address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                  <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Application message</span><textarea name="applicationMessage" placeholder="Anything you want the property team to know" rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Step 3: Property or unit selection</h2>
                <div className="mt-5 space-y-4">
                  <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Requested property or unit</span><select required name="requestedPropertyId" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" defaultValue={params.propertyId ?? ''}>
                      <option value="" disabled>Select a property or unit</option>
                      {properties.map((property) => <option key={property.id} value={property.id}>{property.name} - {property.status}</option>)}
                    </select></label>
                  <p className="text-sm leading-6 text-slate-500">Your selection will be reviewed by an admin before your tenant-to-property link is confirmed.</p>
                </div>
              </div>
              <button type="submit" className="w-full rounded-full bg-[#092136] px-5 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-[#0d2c4a]">SUBMIT REGISTRATION</button>
            </form>
          </div>
        </section>
        <aside className="w-full space-y-8 lg:flex-1">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-950">What happens next</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <p>1. Your account is created with a pending tenant status.</p>
              <p>2. Admins review your registration and requested property.</p>
              <p>3. Once approved, your property assignment becomes active in the tenant portal.</p>
            </div>
            <div className="mt-8 rounded-3xl bg-slate-50 p-6">
              <h3 className="text-lg font-semibold text-slate-900">Already registered?</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Tenant sign-in works after your account is approved.</p>
              <Link href="/tenant-login" className="mt-5 inline-flex rounded-full bg-[#092136] px-5 py-3 text-sm font-semibold !text-white shadow transition hover:bg-[#0d2c4a]">TENANT LOGIN</Link>
            </div>
          </div>
          <PublishedAnnouncements audience="PUBLIC" />
        </aside>
      </main>
    </div>
  )
}
