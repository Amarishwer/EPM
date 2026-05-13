const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Checking database status...\n')
  
  // Check if database file exists
  const dbPath = path.join(__dirname, 'prisma', 'dev.db')
  const dbExists = fs.existsSync(dbPath)
  
  console.log(`Database file exists: ${dbExists ? '✅ YES' : '❌ NO'}`)
  if (dbExists) {
    const stats = fs.statSync(dbPath)
    console.log(`Database size: ${(stats.size / 1024).toFixed(2)} KB`)
  }
  console.log('')
  
  if (!dbExists) {
    console.log('❌ Database file not found. Run: npx prisma db push')
    await prisma.$disconnect()
    return
  }
  
  try {
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
    `
    console.log(`Tables found: ${tables.length}`)
    tables.forEach(table => {
      console.log(`  - ${table.name}`)
    })
    console.log('')
    
    // Check users
    const userCount = await prisma.user.count()
    console.log(`Users in database: ${userCount}`)
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { email: true, role: true, firstName: true }
      })
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) ${user.firstName || ''}`)
      })
    }
    console.log('')
    
    // Check properties
    const propertyCount = await prisma.property.count()
    console.log(`Properties in database: ${propertyCount}`)
    if (propertyCount > 0) {
      const properties = await prisma.property.findMany({
        select: { name: true, monthlyRent: true },
        take: 5
      })
      properties.forEach(prop => {
        console.log(`  - ${prop.name}: ₹${prop.monthlyRent}`)
      })
      if (propertyCount > 5) {
        console.log(`  ... and ${propertyCount - 5} more`)
      }
    }
    console.log('')
    
    // Summary
    if (userCount > 0 && propertyCount > 0) {
      console.log('✅ Database is set up and seeded!')
    } else if (userCount === 0 && propertyCount === 0) {
      console.log('⚠️  Database exists but is empty. Run: npm run db:seed')
    } else {
      console.log('⚠️  Database partially seeded')
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
