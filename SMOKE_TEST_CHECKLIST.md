# Smoke Test Checklist

Run this before production launch and after every meaningful deployment.

## Setup

- [ ] Production env vars are set in Railway.
- [ ] `NEXTAUTH_URL` matches the live domain.
- [ ] `NEXTAUTH_SECRET` is strong and not reused from local development.
- [ ] Railway volume is mounted and `DATABASE_URL` points to it.
- [ ] `npm run db:deploy` completed successfully.
- [ ] Initial admin seed completed successfully.
- [ ] A backup of the database and uploads exists in Google Drive.

## Public Pages

- [ ] Home page loads at `http://edamproperty.com/`.
- [ ] Logo and images load.
- [ ] Vacant properties appear on the home page.
- [ ] Properties with lease end dates in the next three months appear on the home page.
- [ ] Residential and commercial properties are separated.
- [ ] Properties are grouped by locality.
- [ ] GPS-enabled properties show in map view.
- [ ] Help page loads.
- [ ] Tenant registration page loads.
- [ ] Tenant login page loads.
- [ ] Admin login page loads.

## Authentication

- [ ] Admin can log in with the seeded admin account.
- [ ] Admin can sign out.
- [ ] Tenant cannot access `/tenant` before login.
- [ ] Non-admin user cannot access `/admin`.
- [ ] Invalid login credentials are rejected.
- [ ] Admin forgot-password email is delivered.
- [ ] Tenant forgot-password email is delivered.
- [ ] Reset link changes the password successfully.
- [ ] Expired or reused reset link is rejected.
- [ ] Password change works for admin.
- [ ] Password change works for tenant.

## Admin Workflows

- [ ] Admin dashboard loads counts and recent activity.
- [ ] Admin can create a property.
- [ ] Admin can edit a property.
- [ ] Admin can upload a property photo.
- [ ] Admin can create a tenant.
- [ ] Tenant temporary password email is delivered.
- [ ] Admin can approve a pending tenant registration.
- [ ] Admin can reject a pending tenant registration.
- [ ] Admin can archive and unarchive a tenant.
- [ ] Admin can create a payment.
- [ ] Admin can mark payment as paid.
- [ ] Admin can create and update a maintenance request.
- [ ] Admin can create and publish an announcement.
- [ ] Admin can upload a tenant document.
- [ ] Admin can toggle tenant document visibility.

## Tenant Workflows

- [ ] Tenant registration succeeds with a strong password.
- [ ] Weak registration password is rejected.
- [ ] Approved tenant can log in.
- [ ] Pending tenant cannot log in.
- [ ] Tenant sees assigned property.
- [ ] Tenant sees payment history.
- [ ] Tenant can upload an allowed document type.
- [ ] Tenant cannot upload a disallowed document type.
- [ ] Tenant can open a visible document.
- [ ] Tenant cannot open another tenant document.
- [ ] Tenant can submit or view maintenance information expected for the current release.
- [ ] Tenant can sign out.

## Email

- [ ] Gmail SMTP sends admin-created tenant password email.
- [ ] Gmail SMTP sends admin-created admin password email.
- [ ] Tenant approval/rejection notification email sends.
- [ ] Registration alert email sends to admins.

## Security Checks

- [ ] Private document URL returns `401` or `403` when signed out.
- [ ] Admin pages redirect when signed out.
- [ ] Tenant pages redirect when signed out.
- [ ] Uploaded tenant documents are not present under `public/uploads/documents`.
- [ ] `.env` is not committed.
- [ ] `npm audit --audit-level=high` passes.

## Backup And Restore

- [ ] Google Drive backup contains the SQLite database.
- [ ] Google Drive backup contains private documents.
- [ ] Google Drive backup contains property images.
- [ ] A local restore from backup was tested.
