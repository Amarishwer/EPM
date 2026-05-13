# Complete Database Setup Guide

## Current Status ✅
- ✅ Prisma schema created (`prisma/schema.prisma`)
- ✅ Prisma client generated (`node_modules/.prisma/client/`)
- ✅ Environment variables configured (`.env`)
- ❌ Database file not created yet
- ❌ Tables not created yet
- ❌ Initial data not seeded yet

## What Needs to Be Done

### Step 1: Fix Permissions Issue (EPERM Error)

The error `spawn EPERM` means Prisma can't execute the schema engine. This is often caused by:

**Option A: OneDrive Sync Issue (Most Common)**
- OneDrive might be syncing your project folder and locking files
- **Solution:** Temporarily pause OneDrive sync for this folder, or move the project outside OneDrive

**Option B: Antivirus Blocking**
- Your antivirus might be blocking Prisma executables
- **Solution:** Add an exception for:
  - `node_modules/@prisma/engines/`
  - `prisma/` folder

**Option C: Run as Administrator**
- Try running PowerShell/Command Prompt as Administrator

### Step 2: Create Database and Tables

Once permissions are fixed, run:

```bash
cd c:\Users\amari\OneDrive\Documents\epm
npx prisma migrate dev --name init
```

This will:
- Create `prisma/dev.db` (SQLite database file)
- Create all tables (users, properties, payments, maintenance_requests)
- Create a migration history

### Step 3: Seed Initial Data

After migration succeeds, run:

```bash
npm run db:seed
```

This will:
- Create or update the admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Create all 17 properties from your admin dashboard

### Step 4: Verify Setup

Check if everything worked:

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

This opens at `http://localhost:5555` where you can see all your data.

---

## Alternative: Manual Database Creation

If the migration keeps failing, you can manually create the database:

1. **Create the database file:**
   ```bash
   # This will be created automatically when Prisma connects
   # Just ensure the prisma/ folder exists and is writable
   ```

2. **Use Prisma Studio to create tables:**
   ```bash
   npx prisma studio
   ```
   Then manually create tables (not recommended, but works as a workaround)

---

## Quick Fix Commands

Try these in order:

```bash
# 1. Clear Prisma cache
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue

# 2. Regenerate client
npx prisma generate

# 3. Try migration again
npx prisma migrate dev --name init

# 4. If still failing, try with explicit path
$env:DATABASE_URL="file:./prisma/dev.db"
npx prisma migrate dev --name init
```

---

## Expected Final Structure

After successful setup, you should have:

```
epm/
├── prisma/
│   ├── schema.prisma          ✅ (exists)
│   ├── dev.db                 ❌ (needs to be created)
│   └── migrations/            ❌ (needs to be created)
│       └── 20250123_init/
│           └── migration.sql
└── node_modules/
    └── .prisma/
        └── client/            ✅ (exists)
```

---

## Troubleshooting

### If migration still fails:

1. **Check file permissions:**
   - Right-click `prisma/` folder → Properties → Security
   - Ensure your user has Full Control

2. **Try different terminal:**
   - Use Git Bash or Windows Terminal instead of PowerShell

3. **Check OneDrive:**
   - Pause OneDrive sync temporarily
   - Or move project to `C:\Projects\epm` (outside OneDrive)

4. **Manual database creation:**
   - Create empty file: `prisma/dev.db`
   - Run: `npx prisma db push` (alternative to migrate)

---

## Next Steps After Database Setup

Once database is ready:
1. ✅ Set up NextAuth authentication
2. ✅ Create API routes for login/register
3. ✅ Connect forms to database
4. ✅ Build resident dashboard
5. ✅ Enhance admin dashboard
