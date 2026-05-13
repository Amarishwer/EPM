type EmailPayload = {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(payload: EmailPayload) {
  const { default: nodemailer } = await import('nodemailer')
  const isConfigured =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_PORT) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASSWORD) &&
    Boolean(process.env.EMAIL_FROM)

  if (!isConfigured) {
    return { sent: false, reason: 'disabled' as const }
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })

  return { sent: true as const }
}
