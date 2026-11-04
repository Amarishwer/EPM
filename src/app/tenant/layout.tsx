import { TenantShell } from '@/app/tenant/tenant-shell'

import { requireTenantUser } from '@/lib/auth'

export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const tenant = await requireTenantUser()
  const tenantName = [tenant.firstName, tenant.lastName].filter(Boolean).join(' ') || tenant.email

  return (
    <TenantShell tenantName={tenantName}>{children}</TenantShell>
  )
}
