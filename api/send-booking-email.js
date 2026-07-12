/**
 * Vercel Serverless — إرسال إيميلات الحجز عبر Resend
 * Environment Variables على Vercel:
 *   RESEND_API_KEY
 *   RESEND_FROM_EMAIL (بعد تحقق الدومين: Alkhedr Cars <noreply@alkhodercar.com>)
 *   RESEND_USE_PRODUCTION=true (بعد تحقق alkhodercar.com على Resend)
 */
import { safeFromEmail } from './email-from.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  try {
    const { to, subject, html } = req.body ?? {}

    if (!to || !subject || !html) {
      return res.status(400).json({ ok: false, error: 'to, subject, html required' })
    }

    const apiKey = process.env.RESEND_API_KEY
    const from = safeFromEmail(process.env.RESEND_FROM_EMAIL)

    if (!apiKey) {
      return res.status(200).json({ ok: false, fallback: true, error: 'resend_not_configured' })
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [String(to).trim().toLowerCase()],
        subject: String(subject),
        html: String(html),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Resend error:', data)
      return res.status(200).json({ ok: false, fallback: true, error: data, from_used: from })
    }

    return res.status(200).json({ ok: true, id: data.id, from_used: from })
  } catch (err) {
    console.error(err)
    return res.status(200).json({ ok: false, fallback: true, error: String(err) })
  }
}