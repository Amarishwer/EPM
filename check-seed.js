// Simple script to check if database has data
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Cannot open database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
});

// Check users
db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
  if (err) {
    console.log('❌ Users table error:', err.message);
  } else {
    console.log(`👥 Users in database: ${row.count}`);
    if (row.count > 0) {
      db.all("SELECT email, role FROM users LIMIT 5", (err, users) => {
        if (!err) {
          users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
        }
        checkProperties();
      });
    } else {
      console.log('   ⚠️  No users found - seed data not loaded');
      checkProperties();
    }
  }
});

function checkProperties() {
  db.get("SELECT COUNT(*) as count FROM properties", (err, row) => {
    if (err) {
      console.log('\n❌ Properties table error:', err.message);
    } else {
      console.log(`\n🏠 Properties in database: ${row.count}`);
      if (row.count > 0) {
        db.all("SELECT name, monthlyRent FROM properties LIMIT 5", (err, props) => {
          if (!err) {
            props.forEach(p => console.log(`   - ${p.name}: ₹${p.monthlyRent}`));
            if (row.count > 5) {
              console.log(`   ... and ${row.count - 5} more`);
            }
          }
          finish();
        });
      } else {
        console.log('   ⚠️  No properties found - seed data not loaded');
        finish();
      }
    }
  });
}

function finish() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    console.log('\n' + '='.repeat(50));
    console.log('📊 Database Status Summary:');
    console.log('   - Database file: ✅ EXISTS');
    console.log('   - Tables: Check above for status');
    console.log('\n💡 If no data found, run: npm run db:seed');
    console.log('   (After fixing Prisma client)');
  });
}
