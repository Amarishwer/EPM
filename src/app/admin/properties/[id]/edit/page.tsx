import { notFound } from 'next/navigation'
import { UserRole, UserStatus } from '@prisma/client'

import { updatePropertyAction } from '@/app/admin/properties/actions'
import { PropertyForm } from '@/app/admin/properties/property-form'
import { prisma } from '@/lib/prisma'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [property, tenants] = await Promise.all([
    prisma.property.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
      },
    }),
    prisma.user.findMany({
      where: {
        role: UserRole.TENANT,
        status: {
          not: UserStatus.ARCHIVED,
        },
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    }),
  ])

  if (!property) {
    notFound()
  }

  const action = updatePropertyAction.bind(null, property.id)

  return (
    <PropertyForm
      action={action}
      tenants={tenants}
      property={property}
      heading={`Edit ${property.name}`}
      subheading="Update occupancy details, lease information, security deposit, notes, and property photos without removing the historical record."
      submitLabel="SAVE CHANGES"
    />
  )
}
