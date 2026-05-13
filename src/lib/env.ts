export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const required = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`)
  }

  if ((process.env.NEXTAUTH_SECRET?.length ?? 0) < 32) {
    throw new Error('NEXTAUTH_SECRET must be at least 32 characters in production.')
  }
}
