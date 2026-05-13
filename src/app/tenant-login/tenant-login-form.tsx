'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'

export function TenantLoginForm({ authError }: { authError?: string }) {
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
        callbackUrl: '/tenant',
      })

      if (result?.error) {
        setError('Invalid email or password, or your tenant account is not approved yet.')
        return
      }

      router.push(result?.url ?? '/tenant')
      router.refresh()
    })
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input required type="email" name="email" placeholder="Email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <input required type="password" name="password" placeholder="Password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
      </label>
      {(error || authError) && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || 'You need an approved tenant account to continue.'}
        </p>
      )}
      <button type="submit" disabled={isPending} className="w-full rounded-full bg-[#092136] px-4 py-3 text-sm font-semibold tracking-[0.16em] text-white transition hover:bg-[#0d2c4a] disabled:cursor-not-allowed disabled:opacity-60">
        {isPending ? 'SIGNING IN...' : 'TENANT SIGN IN'}
      </button>
      <Link href="/forgot-password?role=tenant" className="block text-center text-sm font-semibold text-amber-700 hover:text-amber-800">
        Forgot password?
      </Link>
    </form>
  )
}
