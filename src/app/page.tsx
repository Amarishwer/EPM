import { PropertyStatus, PropertyType } from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import { PublishedAnnouncements } from '@/app/shared/published-announcements'
import { PropertyMapView } from '@/app/property-map-view'
import { formatCurrency, formatDate } from '@/lib/format'
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
  latitude: unknown
  longitude: unknown
  propertyType: PropertyType
  bedrooms: number | null
  bathrooms: number | null
  monthlyRent: unknown
  securityDeposit: unknown
  leaseEndDate: Date | null
  status: PropertyStatus
  photos: { path: string; altText: string | null }[]
}

type PublicMapProperty = Omit<
  PublicProperty,
  'latitude' | 'longitude' | 'monthlyRent' | 'securityDeposit' | 'leaseEndDate' | 'photos'
> & {
  latitude: number | null
  longitude: number | null
  monthlyRent: number
  securityDeposit: number
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + months)
  return copy
}

function getLocality(property: PublicProperty) {
  return property.locality || property.areaName || property.colonyName || 'Other Hyderabad localities'
}

function getAddress(property: PublicProperty) {
  return [property.doorNumber, property.buildingName, property.colonyName, property.areaName, property.locality]
    .filter(Boolean)
    .join(', ')
}

function getCoordinates(property: PublicProperty) {
  const latitude = property.latitude === null || property.latitude === undefined ? null : Number(property.latitude)
  const longitude = property.longitude === null || property.longitude === undefined ? null : Number(property.longitude)

  if (latitude === null || longitude === null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return { latitude, longitude }
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null
  }

  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? null : numberValue
}

function toMapProperty(property: PublicProperty) {
  return {
    id: property.id,
    name: property.name,
    areaName: property.areaName,
    colonyName: property.colonyName,
    locality: property.locality,
    buildingName: property.buildingName,
    doorNumber: property.doorNumber,
    latitude: toNullableNumber(property.latitude),
    longitude: toNullableNumber(property.longitude),
    propertyType: property.propertyType,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    monthlyRent: toNullableNumber(property.monthlyRent) ?? 0,
    securityDeposit: toNullableNumber(property.securityDeposit) ?? 0,
    status: property.status,
  }
}

function groupByLocality(properties: PublicProperty[]) {
  return properties.reduce<Record<string, PublicProperty[]>>((groups, property) => {
    const locality = getLocality(property)
    groups[locality] = groups[locality] ? [...groups[locality], property] : [property]
    return groups
  }, {})
}

function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center" style={{ textDecoration: 'none' }}>
          <Image src="/EPM logo.png" alt="EPM Logo" width={120} height={140} className="object-cover mix-blend-multiply" />
          <span className="ml-3 flex flex-col leading-tight">
            <span className="text-xl font-bold tracking-wide whitespace-nowrap text-[#092136]">EDAM</span>
            <span className="text-sm font-semibold tracking-wide whitespace-nowrap text-[#092136]">PROPERTY MANAGEMENT</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-3">
          <Link href="/tenant-login" className="rounded-full bg-[#092136] px-5 py-2 text-sm font-semibold !text-white shadow transition hover:bg-[#0d2c4a]">Tenant Login</Link>
          <Link href="/admin-login" className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Admin</Link>
        </nav>
      </div>
    </header>
  )
}

function PropertyCard({ property }: { property: PublicProperty }) {
  const address = getAddress(property)
  const coordinates = getCoordinates(property)
  const isAvailableNow = property.status === PropertyStatus.VACANT

  return (
    <article className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative aspect-[16/9] bg-slate-100">
        {property.photos[0] ? (
          <Image src={property.photos[0].path} alt={property.photos[0].altText ?? property.name} fill className="object-cover" />
        ) : (
          <Image src="/skyline5.png" alt={property.name} fill className="object-cover" />
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{property.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{address || 'Hyderabad, Telangana'}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {isAvailableNow ? 'Available now' : 'Opening soon'}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{property.propertyType}</span>
          {property.propertyType === PropertyType.RESIDENTIAL && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{property.bedrooms ?? 0} bed / {property.bathrooms ?? 0} bath</span>
          )}
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Monthly rent</dt>
            <dd className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(property.monthlyRent))}</dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">Deposit</dt>
            <dd className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(Number(property.securityDeposit))}</dd>
          </div>
        </dl>
        {property.leaseEndDate && !isAvailableNow && (
          <p className="mt-4 text-sm text-slate-600">Current lease ends {formatDate(property.leaseEndDate)}.</p>
        )}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href={`/register?propertyId=${property.id}`} className="rounded-full bg-[#092136] px-5 py-3 text-center text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-[#0d2c4a]">
            APPLY
          </Link>
          {coordinates ? (
            <a href={`https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-semibold tracking-[0.16em] text-slate-700 transition hover:bg-slate-100">
              MAP
            </a>
          ) : (
            <span className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-semibold tracking-[0.16em] text-slate-400">NO GPS</span>
          )}
        </div>
      </div>
    </article>
  )
}

function LocalityGroups({ title, properties }: { title: string; properties: PublicProperty[] }) {
  const groups = groupByLocality(properties)
  const localities = Object.keys(groups).sort((a, b) => a.localeCompare(b))

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">{title}</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Available properties by locality</h2>
      </div>
      <div className="mt-8 space-y-10">
        {localities.length ? localities.map((locality) => (
          <div key={locality}>
            <h3 className="text-2xl font-semibold text-slate-900">{locality}</h3>
            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              {groups[locality].map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          </div>
        )) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">No properties are listed in this category right now.</div>
        )}
      </div>
    </section>
  )
}

function PropertyMap({ properties }: { properties: PublicMapProperty[] }) {
  return (
    <section id="map-view" className="mx-auto max-w-6xl px-4 pb-12">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">Map view</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-950">Find properties by GPS location</h2>
      </div>
      <div className="mt-8">
        <PropertyMapView properties={properties} />
      </div>
    </section>
  )
}

export default async function Home() {
  const today = new Date()
  const threeMonthsFromNow = addMonths(today, 3)

  const properties = await prisma.property.findMany({
    where: {
      isArchived: false,
      OR: [
        { status: PropertyStatus.VACANT },
        {
          status: { not: PropertyStatus.VACANT },
          leaseEndDate: {
            gte: today,
            lte: threeMonthsFromNow,
          },
        },
      ],
    },
    include: {
      photos: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: [{ locality: 'asc' }, { monthlyRent: 'asc' }, { name: 'asc' }],
  })

  const residentialProperties = properties.filter((property) => property.propertyType === PropertyType.RESIDENTIAL)
  const commercialProperties = properties.filter((property) => property.propertyType === PropertyType.COMMERCIAL)
  const mapProperties = properties.map(toMapProperty)

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8f4ec_0%,_#eef3f8_100%)]">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-slate-950">
          <Image src="/skyline2.png" alt="Hyderabad skyline" fill priority className="object-cover opacity-55" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] !text-white">Hyderabad rentals</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight !text-white sm:text-6xl">Find your next Edam managed property.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 !text-white text-slate-100">
                Browse residential and commercial properties by locality, review upcoming availability, and use GPS map links to find each property.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#residential-properties" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-white/10">RESIDENTIAL</Link>
                <Link href="#commercial-properties" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-white/10">COMMERCIAL</Link>
                <Link href="#map-view" className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold tracking-[0.16em] !text-white transition hover:bg-white/10">MAP VIEW</Link>
              </div>
            </div>
          </div>
        </section>

        <div id="residential-properties">
          <LocalityGroups title="Residential properties" properties={residentialProperties} />
        </div>
        <div id="commercial-properties">
          <LocalityGroups title="Commercial properties" properties={commercialProperties} />
        </div>
        <PropertyMap properties={mapProperties} />

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-12 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-950">Contact us</h2>
            <div className="mt-5 space-y-2 text-sm leading-7 text-slate-600">
              <p>Phone: +91 9440348141</p>
              <p>Email: info@edamproperty.com</p>
              <p>H.no: 11-11-143, Telephone colony, Saroornagar, Hyderabad, Telangana 500035, India.</p>
            </div>
          </div>
          <PublishedAnnouncements audience="PUBLIC" />
        </section>
      </main>
    </div>
  )
}
