import { AdminLoginForm } from '@/app/admin-login/admin-login-form'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}

  return <AdminLoginForm authError={params.error} />
}
