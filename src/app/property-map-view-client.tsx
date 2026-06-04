'use client'

import { PropertyStatus, PropertyType } from '@prisma/client'
import L from 'leaflet'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

import { formatCurrency } from '@/lib/format'

type Property = {
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
  status: PropertyStatus
}

export interface PropertyMapViewProps {
  properties: Property[]
}

interface PropertyWithCoordinates {
  property: Property
  coordinates: { latitude: number; longitude: number }
}

interface Cluster {
  centroidLat: number
  centroidLng: number
  properties: PropertyWithCoordinates[]
}

function getCoordinates(property: Property) {
  const latitude = property.latitude === null || property.latitude === undefined ? null : Number(property.latitude)
  const longitude = property.longitude === null || property.longitude === undefined ? null : Number(property.longitude)

  if (latitude === null || longitude === null || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null
  }

  return { latitude, longitude }
}

function mapPropertiesWithCoordinates(properties: Property[]) {
  return properties
    .map((property) => ({ property, coordinates: getCoordinates(property) }))
    .filter((item): item is PropertyWithCoordinates => Boolean(item.coordinates))
}

function getAddress(property: Property) {
  return [property.doorNumber, property.buildingName, property.colonyName, property.areaName, property.locality]
    .filter(Boolean)
    .join(', ')
}

function createMarkerIcon(status: PropertyStatus) {
  const isVacant = status === PropertyStatus.VACANT
  const backgroundColor = isVacant ? '#10b981' : '#ef4444'
  const label = isVacant ? 'OK' : '-'

  return L.divIcon({
    html: `
      <div style="
        background-color: ${backgroundColor};
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        ${label}
      </div>
    `,
    className: 'property-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
}

function createClusterIcon(count: number, hasVacant: boolean) {
  const backgroundColor = hasVacant ? '#10b981' : '#ef4444'

  return L.divIcon({
    html: `
      <div style="
        background-color: ${backgroundColor};
        border: 3px solid white;
        border-radius: 50%;
        width: 42px;
        height: 42px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        font-weight: bold;
        color: white;
        font-size: 14px;
      ">
        ${count}
      </div>
    `,
    className: 'property-cluster-marker',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -21],
  })
}

function clusterProperties(properties: PropertyWithCoordinates[], proximityDegrees = 0.01): Cluster[] {
  const clusters: Cluster[] = []
  const processed = new Set<string>()

  for (const item of properties) {
    if (processed.has(item.property.id)) continue

    const cluster: Cluster = {
      centroidLat: item.coordinates.latitude,
      centroidLng: item.coordinates.longitude,
      properties: [item],
    }
    processed.add(item.property.id)

    for (const other of properties) {
      if (processed.has(other.property.id)) continue

      const latDiff = Math.abs(other.coordinates.latitude - item.coordinates.latitude)
      const lngDiff = Math.abs(other.coordinates.longitude - item.coordinates.longitude)

      if (latDiff <= proximityDegrees && lngDiff <= proximityDegrees) {
        cluster.properties.push(other)
        processed.add(other.property.id)
      }
    }

    cluster.centroidLat = cluster.properties.reduce((sum, p) => sum + p.coordinates.latitude, 0) / cluster.properties.length
    cluster.centroidLng = cluster.properties.reduce((sum, p) => sum + p.coordinates.longitude, 0) / cluster.properties.length
    clusters.push(cluster)
  }

  return clusters
}

export function PropertyMapViewClient({ properties: initialProperties }: PropertyMapViewProps) {
  const initialMappedProperties = useMemo(
    () => mapPropertiesWithCoordinates(initialProperties),
    [initialProperties],
  )
  const [properties, setProperties] = useState<PropertyWithCoordinates[]>(initialMappedProperties)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    setProperties(initialMappedProperties)
  }, [initialMappedProperties])

  const fetchProperties = useCallback(async () => {
    try {
      const response = await fetch('/api/properties', {
        cache: 'no-store',
      })

      if (!response.ok) {
        return
      }

      const data: Property[] = await response.json()
      setProperties(mapPropertiesWithCoordinates(data))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      setProperties((currentProperties) => currentProperties)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()

    const interval = window.setInterval(() => {
      fetchProperties()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [fetchProperties])

  if (isLoading && properties.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        Loading map...
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
        No properties have GPS coordinates yet.
      </div>
    )
  }

  const clusters = clusterProperties(properties)
  const latitudes = properties.map((item) => item.coordinates.latitude)
  const longitudes = properties.map((item) => item.coordinates.longitude)
  const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2
  const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2

  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-slate-200">
      <MapContainer center={[centerLat, centerLng]} zoom={12} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {clusters.map((cluster, idx) => {
          const hasVacant = cluster.properties.some((p) => p.property.status === PropertyStatus.VACANT)

          if (cluster.properties.length === 1) {
            const { property, coordinates } = cluster.properties[0]
            const isVacant = property.status === PropertyStatus.VACANT
            const address = getAddress(property)

            return (
              <Marker
                key={property.id}
                position={[coordinates.latitude, coordinates.longitude]}
                icon={createMarkerIcon(property.status)}
              >
                <Popup maxWidth={300}>
                  <div className="min-w-[250px]">
                    <h4 className="mb-2 font-semibold text-slate-950">{property.name}</h4>
                    <p className="mb-2 text-xs text-slate-600">{address || property.locality || 'Hyderabad'}</p>

                    <div className="mb-3 space-y-1 border-y border-slate-200 py-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Type:</span>
                        <span className="font-semibold">{property.propertyType}</span>
                      </div>
                      {property.propertyType === PropertyType.RESIDENTIAL && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">Bedrooms/Bathrooms:</span>
                          <span className="font-semibold">
                            {property.bedrooms ?? 0} / {property.bathrooms ?? 0}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Monthly rent:</span>
                        <span className="font-semibold">{formatCurrency(Number(property.monthlyRent))}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Deposit:</span>
                        <span className="font-semibold">{formatCurrency(Number(property.securityDeposit))}</span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${isVacant ? 'bg-emerald-500' : 'bg-red-500'}`}
                      />
                      <span className="text-xs font-semibold">{isVacant ? 'Available now' : 'Not available'}</span>
                    </div>

                    {isVacant && (
                      <Link
                        href={`/register?propertyId=${property.id}`}
                        className="block w-full rounded-lg bg-[#092136] px-4 py-2 text-center text-xs font-semibold !text-white transition hover:bg-[#0d2c4a]"
                      >
                        APPLY NOW
                      </Link>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          }

          return (
            <Marker
              key={`cluster-${idx}`}
              position={[cluster.centroidLat, cluster.centroidLng]}
              icon={createClusterIcon(cluster.properties.length, hasVacant)}
            >
              <Popup maxWidth={350}>
                <div className="min-w-[320px]">
                  <h4 className="mb-3 font-semibold text-slate-950">{cluster.properties.length} properties nearby</h4>
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {cluster.properties.map(({ property }) => {
                      const isVacant = property.status === PropertyStatus.VACANT
                      const address = getAddress(property)

                      return (
                        <div key={property.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <div className="mb-2">
                            <h5 className="font-semibold text-slate-950">{property.name}</h5>
                            <p className="text-xs text-slate-600">{address || property.locality || 'Hyderabad'}</p>
                          </div>

                          <div className="mb-2 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Type:</span>
                              <span className="font-semibold">{property.propertyType}</span>
                            </div>
                            {property.propertyType === PropertyType.RESIDENTIAL && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">BHK:</span>
                                <span className="font-semibold">
                                  {property.bedrooms ?? 0} / {property.bathrooms ?? 0}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-600">Rent:</span>
                              <span className="font-semibold">{formatCurrency(Number(property.monthlyRent))}</span>
                            </div>
                          </div>

                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${isVacant ? 'bg-emerald-500' : 'bg-red-500'}`}
                            />
                            <span className="text-xs font-semibold">{isVacant ? 'Available' : 'Not available'}</span>
                          </div>

                          {isVacant && (
                            <Link
                              href={`/register?propertyId=${property.id}`}
                              className="block w-full rounded-md bg-[#092136] px-3 py-1.5 text-center text-xs font-semibold !text-white transition hover:bg-[#0d2c4a]"
                            >
                              APPLY
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="mb-3 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs font-bold text-white">
              OK
            </div>
            <span className="text-sm font-medium text-slate-700">Available for Application</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white">
              -
            </div>
            <span className="text-sm font-medium text-slate-700">Not Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs font-bold text-white">
              2+
            </div>
            <span className="text-sm font-medium text-slate-700">Clustered Properties</span>
          </div>
        </div>
        {lastUpdated && <p className="text-xs text-slate-500">Last updated: {lastUpdated}</p>}
      </div>
    </div>
  )
}
