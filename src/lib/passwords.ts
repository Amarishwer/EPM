import crypto from 'node:crypto'

export function generateTemporaryPassword(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%'
  const bytes = crypto.randomBytes(length)

  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('')
}
