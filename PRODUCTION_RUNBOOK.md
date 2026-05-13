# Production Runbook

## Required Environment

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET` with at least 32 characters
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_SECURE`
- `EMAIL_FROM`

For initial admin bootstrap only:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` with at least 14 characters in production

## Current Launch Settings

- Public URL: `http://edamproperty.com/`
- `NEXTAUTH_URL`: `http://edamproperty.com`
- Hosting target: Railway Free
- Email target: personal Gmail SMTP for low-volume account/password and notification emails
- Backup target: Google Drive

If SSL is enabled for the domain, change `NEXTAUTH_URL` to `https://edamproperty.com`.

## Deploy Commands

1. Install dependencies with `npm ci`.
2. Generate Prisma client with `npm run db:generate`.
3. Apply migrations with `npm run db:deploy`.
4. Build with `npm run build`.
5. Start with `npm run start`.

Run `npm run db:seed` only when bootstrapping a new environment.

## Recommended First Production Setup

For the current 20-30 tenant launch, keep the architecture simple:

- Use Railway with one persistent volume.
- Keep SQLite on the Railway persistent volume.
- Store `uploads/`, `public/uploads/properties/`, and the SQLite database on that volume.
- Take daily off-server backups of the database and uploads.

When tenant/property volume grows, move the database to Postgres and uploads to object storage without changing the main app workflows.

Railway Free currently has a small persistent volume allowance, so monitor storage usage. If photos/documents grow quickly, upgrade Railway or move uploads to object storage.

## Railway Setup

Use a Railway volume mounted at `/app/data`.

Recommended production variables:

```env
NODE_ENV=production
DATABASE_URL=file:/app/data/prisma/prod.db
NEXTAUTH_URL=http://edamproperty.com
NEXTAUTH_SECRET=<generate-a-strong-32+-character-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<your-gmail-address>
SMTP_PASSWORD=<your-google-app-password>
EMAIL_FROM=EDAM Property Management <your-gmail-address>
ADMIN_EMAIL=<initial-admin-email>
ADMIN_PASSWORD=<initial-admin-password>
```

Run these once after the first deploy:

```bash
npm run db:deploy
npm run db:seed
```

## Gmail SMTP

For the current low email volume, Gmail SMTP is acceptable. Use a Google app password, not your normal Google password. Enable 2-Step Verification on the Gmail account first, then create an app password for the website.

Suggested settings:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`

Move to a transactional provider such as SendGrid, Mailgun, Postmark, or AWS SES if emails begin landing in spam, volume grows, or you want better delivery logs.

## Google Drive Backups

Until an automated Google Drive backup integration is configured, do a daily manual backup:

1. Download the Railway volume backup or copy `/app/data`.
2. Save the SQLite database file.
3. Save the `uploads/` folder.
4. Save the `public/uploads/properties/` folder.
5. Upload the backup archive to Google Drive.
6. Keep at least 14 daily backups.

Before launch, test restoring one backup locally.

## Storage Notes

Tenant documents are stored outside `public/` and served through `/api/documents/[filename]`, which checks the current session before returning a file. Property images still use `public/uploads/properties`; move these to object storage before deploying to a serverless host.

## Verification

- `npm run lint`
- `npm run build`
- `npm audit --audit-level=high`
- Complete `SMOKE_TEST_CHECKLIST.md`
