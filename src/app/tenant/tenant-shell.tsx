'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { TenantSignOutButton } from '@/app/tenant/sign-out-button'

const navigation = [
  { label: 'Resident Guide', href: '/help', icon: 'ⓘ' },
  { label: 'Payments', href: '/tenant#payments', icon: '▤', active: true },
  { label: 'Maintenance Request', href: '/help', icon: '⚒' },
  { label: 'Lease', href: '/tenant#property-details', icon: '♧' },
  { label: 'Concierge', href: '/help', icon: '♙' },
  { label: 'Documents', href: '/tenant#documents', icon: '▧' },
  { label: 'Refer a Friend Program', href: '/help', icon: '○' },
]

export function TenantShell({
  tenantName,
  children,
}: {
  tenantName: string
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`min-h-screen bg-white text-slate-800 lg:grid ${isCollapsed ? 'lg:grid-cols-[76px_minmax(0,1fr)]' : 'lg:grid-cols-[250px_minmax(0,1fr)]'}`}>
      <aside className={`border-b border-slate-200 bg-white lg:row-span-2 lg:border-b-0 lg:border-r ${isCollapsed ? 'max-lg:pb-0' : ''}`}>
        <div className={`flex items-center justify-between gap-4 px-5 py-4 lg:px-7 lg:py-6 ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
          {isCollapsed ? (
            <Link href="/tenant" aria-label="Edam Property Management home" className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white lg:flex">E</Link>
          ) : (
            <Link href="/tenant" aria-label="Edam Property Management home" className="block">
              <Image src="/logo.png" alt="Edam Property Management" width={150} height={54} className="h-12 w-auto object-contain" priority />
            </Link>
          )}
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand tenant menu' : 'Collapse tenant menu'}
            aria-expanded={!isCollapsed}
            aria-controls="tenant-navigation"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-2xl leading-none text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            <span aria-hidden="true">☰</span>
          </button>
        </div>

        <div className={`flex items-center justify-between border-t border-slate-100 px-5 py-4 lg:mx-3 lg:mt-8 lg:rounded-lg lg:border-0 ${isCollapsed ? 'max-lg:hidden lg:mx-0 lg:mt-3 lg:justify-center lg:px-0' : ''}`}>
          <div className={`flex min-w-0 items-center gap-2 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{tenantName.slice(0, 2).toUpperCase()}</span>
            <span className={`truncate text-sm font-semibold text-slate-900 ${isCollapsed ? 'lg:hidden' : ''}`}>{tenantName}</span>
          </div>
          <span className={isCollapsed ? 'lg:hidden' : ''}><TenantSignOutButton /></span>
        </div>

        <nav id="tenant-navigation" aria-label="Tenant menu" className={`px-3 pb-4 lg:mt-4 ${isCollapsed ? 'max-lg:hidden lg:px-2' : ''}`}>
          <p className={`hidden px-3 pb-2 text-xs font-bold uppercase text-slate-600 lg:block ${isCollapsed ? 'lg:hidden' : ''}`}>Menu</p>
          <div className={`flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible ${isCollapsed ? 'lg:items-center' : ''}`}>
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`flex shrink-0 items-center gap-3 border-l-4 px-3 py-3 text-sm transition hover:bg-slate-100 ${isCollapsed ? 'lg:w-12 lg:justify-center lg:border-l-0 lg:px-0' : ''} ${item.active ? 'border-slate-900 bg-slate-200 font-semibold text-slate-950' : 'border-transparent text-slate-700'}`}
              >
                <span aria-hidden="true" className="w-4 text-center">{item.icon}</span>
                <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      <div className="flex min-h-[calc(100vh-7rem)] min-w-0 flex-col lg:min-h-screen">
        <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 px-4 py-7 sm:px-7 lg:px-10 lg:py-8">
            <div className="mb-6">
              <Link href="/" className="text-sm font-semibold text-slate-800 hover:underline">Home</Link>
              <span aria-hidden="true" className="px-2 text-slate-500">›</span>
              <span className="text-sm text-slate-600">Payments</span>
              <h1 className="mt-2 text-3xl font-normal tracking-tight text-slate-800 sm:text-4xl">Payments</h1>
            </div>
            {children}
          </main>

          <aside className="border-t border-slate-200 bg-slate-50 px-5 py-6 lg:border-l lg:border-t-0 lg:px-7 lg:py-5">
            <h2 className="text-base font-medium leading-6 text-slate-800">Have questions?</h2>
            <p className="text-base leading-6 text-slate-800">Please review our FAQ pages for:</p>
            <div className="mt-4 space-y-2">
              {['Debit Cards', 'Credit Cards', 'Bank Accounts'].map((topic) => (
                <Link key={topic} href="/help" className="flex items-center justify-between bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition hover:bg-slate-100">
                  <span><span className="mr-2 font-semibold text-blue-700">ⓘ</span>{topic}</span>
                  <span aria-hidden="true" className="text-xl font-semibold text-blue-700">›</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>

        <footer className="mt-auto text-center text-sm">
          <div className="bg-slate-100 px-4 py-4 text-slate-700">Edam Property Management <span className="px-2 text-slate-400">|</span> Tenant Portal</div>
          <div className="bg-[#292929] px-4 py-4 text-white">© {new Date().getFullYear()} Edam Property Management <span className="hidden sm:inline">| All Rights Reserved</span> <Link href="/help" className="ml-2 underline">Accessibility &amp; Help</Link></div>
        </footer>
      </div>
    </div>
  )
}
