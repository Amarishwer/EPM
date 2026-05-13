import Link from 'next/link'

import { requestPasswordResetAction } from '@/app/password-reset/actions'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string; sent?: string }>
}) {
  const params = (await searchParams) ?? {}
  const role = params.role === 'admin' ? 'admin' : 'tenant'
  const loginHref = role === 'admin' ? '/admin-login' : '/tenant-login'

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)] px-4 py-12">
      <section className="mx-auto max-w-lg rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Password reset</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Reset your password</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Enter your account email. If an active account exists, a reset link will be sent to that inbox.
        </p>
        {params.sent === '1' && (
          <p className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            If that email is registered, a reset link has been sent.
          </p>
        )}
        <form action={requestPasswordResetAction} className="mt-8 space-y-4">
          <input type="hidden" name="role" value={role} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
            <input required type="email" name="email" placeholder="Email address" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
          </label>
          <button type="submit" className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-slate-800">SEND RESET LINK</button>
        </form>
        <Link href={loginHref} className="mt-6 block text-center text-sm font-semibold text-amber-700 hover:text-amber-800">Back to sign in</Link>
      </section>
    </main>
  )
}
