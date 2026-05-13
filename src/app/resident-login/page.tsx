import { redirect } from 'next/navigation'

export default function ResidentLoginRedirect() {
  redirect('/tenant-login')
}
