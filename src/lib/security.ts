const MIN_PASSWORD_LENGTH = 12

export function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include uppercase, lowercase, and number characters.'
  }

  return null
}

const rateLimits = new Map<string, { count: number; resetAt: number }>()

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const attempt = rateLimits.get(key)

  if (!attempt || attempt.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  attempt.count += 1
  return attempt.count > limit
}
