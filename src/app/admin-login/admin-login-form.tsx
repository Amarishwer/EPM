'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-4" style={{ textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="EPM Logo"
            width={72}
            height={72}
            className="object-cover mix-blend-multiply"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-[0.18em] text-slate-900">EDAM</span>
            <span className="text-xs font-semibold tracking-[0.28em] text-slate-500">
              PROPERTY MANAGEMENT
            </span>
          </span>
        </Link>
      </div>
    </header>
  )
}

export function AdminLoginForm({ authError }: { authError?: string }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')

    startTransition(async () => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/admin',
      })

      if (result?.error) {
        setError('Invalid admin email or password.')
        return
      }

      router.push(result?.url ?? '/admin')
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,138,82,0.22),_transparent_34%),linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)]">
      <Header />
      <main className="mx-auto grid min-h-[calc(100vh-105px)] max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-6">
          <p className="inline-flex rounded-full border border-amber-300/70 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-amber-800">
            Admin Portal
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-slate-950">
            Run operations from one secure property command center.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Manage units, monitor occupancy, track rent, coordinate maintenance, and keep your
            internal team aligned from a protected dashboard.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Property CRUD', 'Archive-aware records, leases, deposits, and photo galleries.'],
              ['Tenant Oversight', 'Assignment-ready workflows for approvals, deposits, documents, and account setup.'],
              ['Operational Visibility', 'Notifications, reports, and payment tracking in one place.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-3xl border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.5)]">
          <h2 className="text-3xl font-semibold text-slate-950">Admin sign in</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use an administrator account to access the dashboard and property tools.
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Admin email</span>
              <input
                required
                type="email"
                name="email"
                placeholder="admin@edamproperty.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                required
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
            </label>
            {(error || authError) && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error || 'You need an active admin account to continue.'}
              </p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold tracking-[0.18em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
            <Link href="/forgot-password?role=admin" className="block text-center text-sm font-semibold text-amber-700 hover:text-amber-800">
              Forgot password?
            </Link>
          </form>
        </section>
      </main>
    </div>
  )
}
