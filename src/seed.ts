import { PropertyStatus, UserRole, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

import { prisma } from './lib/prisma'

async function main() {
  console.log('Starting database seed...')

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running the seed script.')
  }

  if (process.env.NODE_ENV === 'production' && adminPassword.length < 14) {
    throw new Error('ADMIN_PASSWORD must be at least 14 characters in production.')
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  })

  console.log(`Created admin user: ${admin.email}`)

  const properties = [
    { name: 'Lakshmi nilayam G1', monthlyRent: '30600.00' },
    { name: 'Lakshmi nilayam G2', monthlyRent: '22990.00' },
    { name: 'Lakshmi nilayam G3&G4', monthlyRent: '40000.00' },
    { name: 'Lakshmi nilayam G5', monthlyRent: '9075.00' },
    { name: 'Lakshmi nilayam G6', monthlyRent: '5000.00' },
    { name: 'Lakshmi nilayam F1', monthlyRent: '17000.00' },
    { name: 'Lakshmi nilayam F2', monthlyRent: '17000.00' },
    { name: 'Lakshmi nilayam S1', monthlyRent: '16000.00' },
    { name: 'Lakshmi nilayam S2', monthlyRent: '16000.00' },
    { name: 'Lakshmi nilayam PH', monthlyRent: '6000.00' },
    { name: 'Lakshmi nilayam tower', monthlyRent: '19602.00' },
    { name: 'RBI colony plot 21', monthlyRent: '35000.00' },
    { name: 'RBI colony plot 20', monthlyRent: '40000.00' },
    { name: 'PVT shop 13', monthlyRent: '72000.00' },
    { name: 'PVT shop 325', monthlyRent: '15000.00' },
    { name: 'Main road plot A5', monthlyRent: '400000.00' },
    { name: 'Dilsukhnagar 17-33', monthlyRent: '32500.00' },
  ]

  for (const property of properties) {
    await prisma.property.upsert({
      where: { name: property.name },
      update: {
        monthlyRent: property.monthlyRent,
        status: PropertyStatus.VACANT,
        isArchived: false,
      },
      create: {
        name: property.name,
        monthlyRent: property.monthlyRent,
        securityDeposit: '0.00',
        status: PropertyStatus.VACANT,
      },
    })
  }

  console.log(`Created or updated ${properties.length} properties`)
  console.log('Seed completed.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
