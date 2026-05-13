import { UserRole, UserStatus } from '@prisma/client'

import { createPropertyAction } from '@/app/admin/properties/actions'
import { PropertyForm } from '@/app/admin/properties/property-form'
import { prisma } from '@/lib/prisma'

export default async function NewPropertyPage() {
  const tenants = await prisma.user.findMany({
    where: {
      role: UserRole.TENANT,
      status: {
        not: UserStatus.ARCHIVED,
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return (
    <PropertyForm
      action={createPropertyAction}
      tenants={tenants}
      heading="Create property"
      subheading="Add a new unit or building to the portfolio, including lease terms, pricing, security deposit, operational status, imagery, and tenant assignment."
      submitLabel="SAVE PROPERTY"
    />
  )
}
