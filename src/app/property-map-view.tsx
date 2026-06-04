'use client'

import dynamic from 'next/dynamic'

import type { PropertyMapViewProps } from '@/app/property-map-view-client'

const LeafletPropertyMapView = dynamic(
  () => import('@/app/property-map-view-client').then((mod) => mod.PropertyMapViewClient),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Loading map...
      </div>
    ),
  },
)

export function PropertyMapView(props: PropertyMapViewProps) {
  return <LeafletPropertyMapView {...props} />
}
