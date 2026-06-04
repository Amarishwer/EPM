import { PropertyStatus } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function addMonths(date: Date, months: number) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + months)
  return copy
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
      select: {
        id: true,
        name: true,
        areaName: true,
        colonyName: true,
        locality: true,
        buildingName: true,
        doorNumber: true,
        latitude: true,
        longitude: true,
        propertyType: true,
        bedrooms: true,
        bathrooms: true,
        monthlyRent: true,
        securityDeposit: true,
        status: true,
      },
      orderBy: [{ locality: 'asc' }, { monthlyRent: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Failed to fetch properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 },
    )
  }
}
