import Link from 'next/link'

import { resetPasswordAction } from '@/app/password-reset/actions'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string; error?: string; success?: string }>
}) {
  const params = (await searchParams) ?? {}

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)] px-4 py-12">
      <section className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Password reset</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Choose a new password</h1>
        {params.success === '1' ? (
          <>
            <p className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">Password updated. You can sign in with the new password.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/tenant-login" className="rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-semibold !text-white transition hover:bg-slate-800">Tenant sign in</Link>
              <Link href="/admin-login" className="rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Admin sign in</Link>
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-600">Use at least 12 characters with uppercase, lowercase, and a number.</p>
            {params.error === 'invalid' && <p className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">Check that the passwords match and meet the password rules.</p>}
            {params.error === 'expired' && <p className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">This reset link is invalid or expired. Request a new one.</p>}
            <form action={resetPasswordAction} className="mt-8 space-y-4">
              <input type="hidden" name="token" value={params.token ?? ''} />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
                <input required type="password" name="password" minLength={12} placeholder="New password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span>
                <input required type="password" name="confirmPassword" minLength={12} placeholder="Confirm new password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </label>
              <button type="submit" className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">UPDATE PASSWORD</button>
            </form>
            <Link href="/forgot-password" className="mt-6 block text-center text-sm font-semibold text-amber-700 hover:text-amber-800">Request a new link</Link>
          </>
        )}
      </section>
    </main>
  )
}
