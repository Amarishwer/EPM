import Link from 'next/link'

import { requireTenantUser } from '@/lib/auth'
import { TenantSignOutButton } from '@/app/tenant/sign-out-button'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenant = await requireTenantUser()

  return (
    <div className="min-h-screen bg-[#f3efe7]">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tenant portal</p>
            <h1 className="text-2xl font-semibold text-slate-950">
              {[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Home</Link>
            <TenantSignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
