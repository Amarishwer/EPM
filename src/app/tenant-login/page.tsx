import Image from 'next/image'
import Link from 'next/link'

import { PublishedAnnouncements } from '@/app/shared/published-announcements'
import { TenantLoginForm } from '@/app/tenant-login/tenant-login-form'

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="EPM Logo" width={96} height={96} className="object-cover mix-blend-multiply" />
          <span className="ml-4 flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-wide whitespace-nowrap text-[#092136]">EDAM</span>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap text-[#092136]">PROPERTY MANAGEMENT</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/help" className="rounded-full bg-[#092136] px-5 py-2 text-sm font-semibold !text-white shadow transition hover:bg-[#0d2c4a]">Help</Link>
          <Link href="/admin-login" className="rounded-full bg-[#cd7f32] px-5 py-2 text-sm font-semibold !text-white shadow transition hover:bg-[#b87333]">Admin Login</Link>
        </div>
      </div>
    </header>
  )
}

export default async function TenantLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,138,82,0.22),_transparent_34%),linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)]">
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-105px)] max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <p className="inline-flex rounded-full border border-amber-300/70 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-800">Tenant Portal</p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950">Access your tenancy details, billing updates, and support history in one place.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Approved tenants can sign in to review property information, security deposit status, rent due details including late fees, maintenance activity, and shared documents.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Tenancy Snapshot', 'See your assigned unit, lease dates, rent, and security deposit summary.'],
              ['Billing Visibility', 'Track pending, paid, overdue, and late-fee-adjusted charges from your dashboard.'],
              ['Shared Documents', 'View and download visible agreements, ID files, bills, and other records.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
          <PublishedAnnouncements audience="PUBLIC" />
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.5)]">
          <h2 className="text-3xl font-semibold text-slate-950">Tenant sign in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use your approved tenant account credentials to enter the portal. If your account is still pending, an admin needs to approve it before sign-in will work.
          </p>
          <TenantLoginForm authError={params.error} />
          <div className="mt-6">
            <Link href="/register" className="block w-full rounded-full bg-[#092136] px-4 py-3 text-center text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-[#0d2c4a]">
              NEW TENANT
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
