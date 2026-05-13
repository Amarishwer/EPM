import { redirect } from 'next/navigation'

export default function ResidentsRouteRedirect() {
  redirect('/admin/tenants')
}
