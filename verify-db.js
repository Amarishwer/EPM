const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verify() {
  try {
    console.log('🔍 Verifying database setup...\n')
    
    // Check users
    const userCount = await prisma.user.count()
    console.log(`✅ Users: ${userCount}`)
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true }
      })
      users.forEach(u => console.log(`   - ${u.email} (${u.role})`))
    }
    
    // Check properties
    const propertyCount = await prisma.property.count()
    console.log(`✅ Properties: ${propertyCount}`)
    if (propertyCount > 0) {
      const props = await prisma.property.findMany({
        select: { name: true, monthlyRent: true },
        take: 5
      })
      props.forEach(p => console.log(`   - ${p.name}: ₹${p.monthlyRent}`))
      if (propertyCount > 5) console.log(`   ... and ${propertyCount - 5} more`)
    }
    
    console.log('\n' + '='.repeat(50))
    if (userCount > 0 && propertyCount > 0) {
      console.log('✅ DATABASE IS SET UP AND SEEDED!')
      console.log('\nYou can now:')
      console.log('  - Login with the ADMIN_EMAIL and ADMIN_PASSWORD used during seeding')
      console.log('  - View data: npx prisma studio')
    } else if (userCount === 0 && propertyCount === 0) {
      console.log('⚠️  Database exists but is EMPTY')
      console.log('\nRun: npm run db:seed')
    } else {
      console.log('⚠️  Database partially set up')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
