# Database Setup Guide

## Option 1: Cloud Database (Recommended - Easiest) ⭐

### Using Supabase (Free Tier Available)

1. **Sign up at [supabase.com](https://supabase.com)**
2. **Create a new project:**
   - Click "New Project"
   - Choose a name (e.g., "epm")
   - Set a database password (save this!)
   - Choose a region close to you
   - Wait for project to be created (~2 minutes)

3. **Get your connection string:**
   - Go to Project Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

4. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connect_timeout=15"
   ```
   Replace `[YOUR-PASSWORD]` with your actual password

### Using Neon (Free Tier Available)

1. **Sign up at [neon.tech](https://neon.tech)**
2. **Create a new project**
3. **Copy the connection string from the dashboard**
4. **Update your `.env` file with the connection string**

---

## Option 2: Local PostgreSQL Installation

### Windows Installation

1. **Download PostgreSQL:**
   - Visit [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - Download the installer from EnterpriseDB
   - Run the installer

2. **During installation:**
   - Remember the password you set for the `postgres` user
   - Keep default port (5432)
   - Complete the installation

3. **Create the database:**
   - Open "pgAdmin" (installed with PostgreSQL)
   - Or use Command Prompt:
     ```bash
     psql -U postgres
     ```
   - Then run:
     ```sql
     CREATE DATABASE epm;
     \q
     ```

4. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/epm?schema=public"
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation

---

## Option 3: Docker (If you have Docker installed)

1. **Run PostgreSQL in Docker:**
   ```bash
   docker run --name epm-postgres -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=epm -p 5432:5432 -d postgres
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/epm?schema=public"
   ```

---

## After Setting Up Database

Once you've updated your `.env` file with the correct `DATABASE_URL`, run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables (migration)
npx prisma migrate dev --name init

# Seed the database with initial data
npm run db:seed
```

---

## Quick Test

To verify your database connection works:

```bash
npx prisma studio
```

This opens a visual database browser at `http://localhost:5555`
