import Image from 'next/image'
import { PropertyStatus, PropertyType, type Property, type PropertyPhoto, type User } from '@prisma/client'

type TenantOption = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>

type PropertyFormProps = {
  action: (formData: FormData) => void | Promise<void>
  tenants: TenantOption[]
  property?: Property & { photos: PropertyPhoto[] }
  heading: string
  subheading: string
  submitLabel: string
}

const statuses = Object.values(PropertyStatus)
const propertyTypes = Object.values(PropertyType)

export function PropertyForm({ action, tenants, property, heading, subheading, submitLabel }: PropertyFormProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold text-slate-950">{heading}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{subheading}</p>
      </section>
      <form action={action} className="space-y-8">
        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-semibold text-slate-950">Property profile</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Property name</span><input required name="name" defaultValue={property?.name ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Postal code</span><input name="postalCode" defaultValue={property?.postalCode ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Door number</span><input name="doorNumber" defaultValue={property?.doorNumber ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Area name</span><input name="areaName" defaultValue={property?.areaName ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Colony name</span><input name="colonyName" defaultValue={property?.colonyName ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Locality</span><input name="locality" defaultValue={property?.locality ?? ''} placeholder="Example: Saroornagar" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Property type</span><select name="propertyType" defaultValue={property?.propertyType ?? PropertyType.RESIDENTIAL} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">{propertyTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                <label className="md:col-span-2"><span className="mb-2 block text-sm font-medium text-slate-700">Building name</span><input name="buildingName" defaultValue={property?.buildingName ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Latitude</span><input type="number" step="any" name="latitude" defaultValue={property?.latitude ? Number(property.latitude).toString() : ''} placeholder="17.3850" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Longitude</span><input type="number" step="any" name="longitude" defaultValue={property?.longitude ? Number(property.longitude).toString() : ''} placeholder="78.4867" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Bedrooms</span><input type="number" min="0" name="bedrooms" defaultValue={property?.bedrooms ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Bathrooms</span><input type="number" min="0" name="bathrooms" defaultValue={property?.bathrooms ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
              </div>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-semibold text-slate-950">Lease and pricing</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Monthly rent</span><input required type="number" step="0.01" min="0" name="monthlyRent" defaultValue={property ? Number(property.monthlyRent).toFixed(2) : '0.00'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Security Deposit</span><input type="number" step="0.01" min="0" name="securityDeposit" defaultValue={property ? Number(property.securityDeposit).toFixed(2) : '0.00'} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Lease start date</span><input type="date" name="leaseStartDate" defaultValue={property?.leaseStartDate ? property.leaseStartDate.toISOString().slice(0, 10) : ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Lease end date</span><input type="date" name="leaseEndDate" defaultValue={property?.leaseEndDate ? property.leaseEndDate.toISOString().slice(0, 10) : ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" /></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Status</span><select name="status" defaultValue={property?.status ?? PropertyStatus.VACANT} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
                <label><span className="mb-2 block text-sm font-medium text-slate-700">Assigned tenant</span><select name="tenantId" defaultValue={property?.tenantId ?? ''} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"><option value="">No tenant assigned</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{[tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email}</option>)}</select></label>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-semibold text-slate-950">Photos</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">Upload one primary image and any additional gallery images. Files are stored locally in the app.</p>
              <div className="mt-6 space-y-5">
                <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Primary photo</span><input type="file" name="primaryPhoto" accept="image/*" className="block w-full text-sm text-slate-600" /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium text-slate-700">Gallery photos</span><input type="file" name="galleryPhotos" accept="image/*" multiple className="block w-full text-sm text-slate-600" /></label>
              </div>
              {property?.photos?.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {property.photos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
                      <div className="relative aspect-[4/3]">
                        <Image src={photo.path} alt={photo.altText ?? property.name} fill className="object-cover" />
                      </div>
                      <div className="flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <span>{photo.isPrimary ? 'Primary' : 'Gallery'}</span>
                        <span>Stored</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="mt-6 rounded-3xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No photos uploaded yet.</div>}
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-2xl font-semibold text-slate-950">Internal notes</h2>
              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Internal notes</span>
                <textarea name="notes" rows={10} defaultValue={property?.notes ?? ''} placeholder="Add property notes, follow-ups, and admin-only context." className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100" />
              </label>
            </div>
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold tracking-[0.18em] !text-white transition hover:bg-slate-800">{submitLabel}</button>
        </div>
      </form>
    </div>
  )
}
