'use client'

import { signOut } from 'next-auth/react'

export function TenantSignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/tenant-login' })}
      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
    >
      Sign out
    </button>
  )
}
