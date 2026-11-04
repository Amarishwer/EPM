import { PropertyStatus } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import { PublishedAnnouncements } from '@/app/shared/published-announcements'
import { PropertyListings } from '@/app/property-listings'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type PublicProperty = {
  id: string
  name: string
  areaName: string | null
  colonyName: string | null
  locality: string | null
  buildingName: string | null
  doorNumber: string | null
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  monthlyRent: number
  securityDeposit: number
  photos: { path: string; altText: string | null }[]
}

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Edam Property Management home" className="flex items-center" style={{ textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Edam Property Management" width={64} height={64} className="h-14 w-14 object-contain" />
          <span className="ml-3 flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-[0.12em] text-[#123b36]">EDAM</span>
            <span className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-slate-600 sm:text-xs">PROPERTY MANAGEMENT</span>
          </span>
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-slate-700">
          <Link href="#listings" className="transition hover:underline">Available properties</Link>
          <Link href="/tenant-login" className="rounded-full bg-[#123b36] px-5 py-2.5 font-semibold !text-white shadow-sm transition hover:bg-[#1d5149]">Tenant login</Link>
        </nav>
      </div>
    </header>
  )
}

export default async function Home() {
  const availableProperties = await prisma.property.findMany({
    where: {
      isArchived: false,
      status: PropertyStatus.VACANT,
    },
    include: {
      photos: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: [{ locality: 'asc' }, { monthlyRent: 'asc' }, { name: 'asc' }],
  })
  const properties: PublicProperty[] = availableProperties.map((property) => ({
    ...property,
    monthlyRent: Number(property.monthlyRent),
    securityDeposit: Number(property.securityDeposit),
  }))

  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <Header />
      <main>
        <section className="relative isolate min-h-[520px] overflow-hidden bg-[#102e2a] sm:min-h-[590px]">
          <Image src="/skyline7.png" alt="Hyderabad's modern residential skyline at sunset" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0c2422]/90 via-[#102e2a]/65 to-[#102e2a]/15" />
          <div className="mx-auto flex min-h-[520px] max-w-7xl items-center px-4 py-16 sm:min-h-[590px] sm:px-6">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] !text-white backdrop-blur-sm">Hyderabad, Telangana <span aria-hidden="true">·</span> Homes &amp; workspaces</p>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight !text-white sm:text-6xl">A better place to call home in Hyderabad.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 !text-white/90 sm:text-lg sm:leading-8">
                Browse homes and commercial spaces available now, compare rents, and enquire directly with our Hyderabad team.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#listings" className="rounded-full bg-[#d49a54] px-6 py-3.5 text-sm font-semibold !text-[#18211f] shadow-lg transition hover:bg-[#e2ae6d]">View available properties <span aria-hidden="true">→</span></Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm !text-white/85">
                <a href="tel:+919440348141" className="!text-white/90 hover:!text-white">Call our Hyderabad team <span className="font-semibold">+91 94403 48141</span></a>
                <Link href="/tenant-login" className="!text-white/90 underline decoration-white/40 underline-offset-4 hover:!text-white">Already a tenant? Sign in</Link>
              </div>
            </div>
          </div>
        </section>

        <PropertyListings properties={properties} />

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:py-16">
          <div className="rounded-[1.5rem] bg-[#123b36] p-8 text-white shadow-sm sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] !text-emerald-100">Local team, local knowledge</p>
            <h2 className="mt-3 text-3xl font-semibold !text-white">Let’s find your place in Hyderabad.</h2>
            <div className="mt-6 space-y-2 text-sm leading-7 !text-white/85">
              <p><a href="tel:+919440348141" className="!text-white hover:underline">Phone: +91 94403 48141</a></p>
              <p><a href="mailto:info@edamproperty.com" className="!text-white hover:underline">Email: info@edamproperty.com</a></p>
              <p>H.no: 11-11-143, Telephone Colony, Saroornagar, Hyderabad, Telangana 500035, India.</p>
            </div>
            <Link href="/register" className="mt-6 inline-flex rounded-full bg-[#d49a54] px-5 py-3 text-sm font-semibold !text-[#18211f] transition hover:bg-[#e2ae6d]">Enquire about a property <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
          <div className="space-y-6">
            <PublishedAnnouncements audience="PUBLIC" />
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-7">
              <h2 className="text-xl font-semibold text-slate-950">Already with Edam?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Access rent and deposit details, documents, and support updates through your tenant portal.</p>
              <Link href="/tenant-login" className="mt-4 inline-flex text-sm font-semibold text-emerald-800 hover:underline">Go to tenant login <span className="ml-2" aria-hidden="true"></span></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6">
          <p>© {new Date().getFullYear()} Edam Property Management · Hyderabad, India</p>
          <div className="flex gap-5"><Link href="/help" className="hover:underline">Help</Link><Link href="/tenant-login" className="hover:underline">Tenant login</Link><Link href="/admin-login" className="hover:underline">Admin</Link></div>
        </div>
      </footer>
    </div>
  )
}
