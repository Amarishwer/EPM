const APR = 0.36
const MONTHLY_RATE = APR / 12
const GRACE_DAYS = 10

export function calculateLateFee(principal: number, dueDate: Date, asOf = new Date()) {
  const graceEnd = new Date(dueDate)
  graceEnd.setDate(graceEnd.getDate() + GRACE_DAYS)

  if (asOf <= graceEnd) {
    return 0
  }

  const msLate = asOf.getTime() - graceEnd.getTime()
  const daysLate = Math.floor(msLate / (1000 * 60 * 60 * 24))
  const compoundingPeriods = Math.floor(daysLate / 30) + 1
  const totalWithLateFee = principal * Math.pow(1 + MONTHLY_RATE, compoundingPeriods)

  return Number((totalWithLateFee - principal).toFixed(2))
}

export function calculateAmountDueWithLateFee(principal: number, dueDate: Date, asOf = new Date()) {
  const lateFee = calculateLateFee(principal, dueDate, asOf)
  return {
    lateFee,
    totalDue: Number((principal + lateFee).toFixed(2)),
  }
}
