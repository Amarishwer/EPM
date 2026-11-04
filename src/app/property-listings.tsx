'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { formatCurrency } from '@/lib/format'

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
  monthlyRent: number | string | { toString(): string }
  securityDeposit: number | string | { toString(): string }
  photos: { path: string; altText: string | null }[]
}

function getLocality(property: PublicProperty) {
  return property.locality || property.areaName || property.colonyName || 'Other Hyderabad localities'
}

function getAddress(property: PublicProperty) {
  return [property.doorNumber, property.buildingName, property.colonyName, property.areaName, property.locality]
    .filter(Boolean)
    .join(', ')
}

function PropertyCard({ property }: { property: PublicProperty }) {
  const address = getAddress(property)

  return (
    <article className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] bg-slate-100">
        {property.photos[0] ? (
          <Image src={property.photos[0].path} alt={property.photos[0].altText ?? property.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
        ) : (
          <Image src="/skyline5.png" alt={property.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
        )}
        <span className="absolute left-4 top-4 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Available now</span>
      </div>
      <div className="p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{property.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{address || 'Hyderabad, Telangana'}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{property.propertyType}</span>
          {property.propertyType === 'RESIDENTIAL' && (
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
        <Link href={`/register?propertyId=${property.id}`} className="mt-6 block rounded-full bg-[#123b36] px-5 py-3 text-center text-sm font-semibold tracking-[0.1em] !text-white transition hover:bg-[#1d5149]">
          Enquire / apply
        </Link>
      </div>
    </article>
  )
}

export function PropertyListings({ properties }: { properties: PublicProperty[] }) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [location, setLocation] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [minRent, setMinRent] = useState('')
  const [maxRent, setMaxRent] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [sortOrder, setSortOrder] = useState('')

  const locations = useMemo(
    () => [...new Set(properties.map(getLocality))].sort((a, b) => a.localeCompare(b)),
    [properties],
  )
  const bedroomOptions = useMemo(
    () => [...new Set(properties.map((property) => property.bedrooms).filter((value): value is number => value !== null))].sort((a, b) => a - b),
    [properties],
  )
  const bathroomOptions = useMemo(
    () => [...new Set(properties.map((property) => property.bathrooms).filter((value): value is number => value !== null))].sort((a, b) => a - b),
    [properties],
  )

  const activeFilterCount = [location, propertyType, minRent, maxRent, bedrooms, bathrooms].filter(Boolean).length

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((property) => (
      (!location || getLocality(property) === location)
      && (!propertyType || property.propertyType === propertyType)
      && (!minRent || Number(property.monthlyRent) >= Number(minRent))
      && (!maxRent || Number(property.monthlyRent) <= Number(maxRent))
      && (!bedrooms || (property.bedrooms !== null && property.bedrooms >= Number(bedrooms)))
      && (!bathrooms || (property.bathrooms !== null && property.bathrooms >= Number(bathrooms)))
    ))

    if (sortOrder === 'price-asc' || sortOrder === 'price-desc') {
      filtered.sort((a, b) => (Number(a.monthlyRent) - Number(b.monthlyRent)) * (sortOrder === 'price-asc' ? 1 : -1))
    } else if (sortOrder === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    return filtered
  }, [bathrooms, bedrooms, location, maxRent, minRent, properties, propertyType, sortOrder])

  function clearFilters() {
    setLocation('')
    setPropertyType('')
    setMinRent('')
    setMaxRent('')
    setBedrooms('')
    setBathrooms('')
    setSortOrder('')
  }

  return (
    <section id="listings" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-800">Ready for move-in</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Featured Hyderabad properties</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Browse homes and commercial spaces available right now.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-start gap-4">
          <button type="button" aria-expanded={filtersOpen} aria-controls="property-filters" onClick={() => setFiltersOpen((open) => !open)} className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition ${filtersOpen || activeFilterCount ? 'border-emerald-800 bg-emerald-50 text-emerald-900' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-700 hover:text-emerald-900'}`}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5"><path d="M4 7h16M7 12h10m-7 5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
            {filtersOpen ? 'Hide filters' : 'Filters'}
            {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-800 px-1 text-[11px] text-white">{activeFilterCount}</span>}
          </button>
        <p className="text-sm font-medium text-slate-600" aria-live="polite">Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'listing' : 'listings'}</p>

        {filtersOpen && (
          <div id="property-filters" className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Refine your results</h3>
                <p className="mt-1 text-sm text-slate-500">Choose what matters to you.</p>
              </div>
              <button type="button" onClick={clearFilters} disabled={!activeFilterCount && !sortOrder} className="text-sm font-semibold text-emerald-900 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-slate-400">Clear all</button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Location</span>
                <select value={location} onChange={(event) => setLocation(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
                  <option value="">All locations</option>
                  {locations.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Property type</span>
                <select value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
                  <option value="">All property types</option>
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </label>
              <fieldset>
                <legend className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly rent range</legend>
                <div className="grid grid-cols-2 gap-2">
                  <label><span className="sr-only">Minimum rent</span><input type="number" min="0" inputMode="numeric" value={minRent} onChange={(event) => setMinRent(event.target.value)} placeholder="Min rent" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100" /></label>
                  <label><span className="sr-only">Maximum rent</span><input type="number" min="0" inputMode="numeric" value={maxRent} onChange={(event) => setMaxRent(event.target.value)} placeholder="Max rent" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100" /></label>
                </div>
              </fieldset>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Bedrooms</span>
                <select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
                  <option value="">Any bedrooms</option>
                  {bedroomOptions.map((count) => <option key={count} value={count}>{count}+ {count === 1 ? 'bedroom' : 'bedrooms'}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Bathrooms</span>
                <select value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
                  <option value="">Any bathrooms</option>
                  {bathroomOptions.map((count) => <option key={count} value={count}>{count}+ {count === 1 ? 'bathroom' : 'bathrooms'}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</span>
                <select aria-label="Sort properties" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100">
                  <option value="">Recommended</option>
                  <option value="price-asc">Rent: low to high</option>
                  <option value="price-desc">Rent: high to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </label>
            </div>
          </div>
        )}
      </div>

      {filteredProperties.length ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      ) : (
        <div className="mt-7 rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No matching properties</h3>
          <p className="mt-2 text-sm text-slate-600">Try changing or clearing your filters to see available listings.</p>
          <button type="button" onClick={clearFilters} className="mt-5 rounded-full bg-[#123b36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1d5149]">Clear filters</button>
        </div>
      )}
    </section>
  )
}
