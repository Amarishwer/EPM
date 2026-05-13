# Quick Fix for Database Setup

## The Problem
You're getting `spawn EPERM` error when running `npx prisma migrate dev`. This is a permissions issue.

## What's Already Done ✅
- Prisma schema created
- Prisma client generated
- Environment configured

## What's Left ❌
- Create database file
- Create tables
- Seed initial data

## Solution: Use `prisma db push` Instead

The `db push` command is simpler and doesn't require migration files. Try this:

```bash
cd c:\Users\amari\OneDrive\Documents\epm

# Option 1: Try db push (simpler, no migration files)
npx prisma db push

# If that works, then seed:
npm run db:seed
```

## If That Still Fails

### Fix 1: Run as Administrator
1. Right-click PowerShell/Command Prompt
2. Select "Run as Administrator"
3. Navigate to project and run commands

### Fix 2: Pause OneDrive
1. Right-click OneDrive icon in system tray
2. Click "Pause syncing" → "2 hours"
3. Try the commands again

### Fix 3: Check Antivirus
- Temporarily disable antivirus
- Or add exception for `node_modules/@prisma/engines/`

### Fix 4: Manual Database File
Create the database file manually:

```bash
# Create the prisma directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "prisma"

# Create empty database file
New-Item -ItemType File -Path "prisma\dev.db"

# Then try db push
npx prisma db push
```

## Success Indicators

You'll know it worked when you see:
- ✅ `prisma/dev.db` file exists
- ✅ `npx prisma studio` opens and shows tables
- ✅ Seed script runs without errors

## After Success

Once database is created:
1. Run `npm run db:seed` to populate initial data
2. Verify with `npx prisma studio`
3. You're ready to build authentication! 🎉
