import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toE164(phone: string): string {
  const digits = String(phone).replace(/\D/g, '')
  if (!digits) return ''

  if (digits.startsWith('966')) return `+${digits}`
  if (digits.startsWith('20')) return `+${digits}`
  if (digits.startsWith('0')) return `+966${digits.slice(1)}`
  return `+966${digits}`
}

function smsFrom(): string | null {
  const raw = Deno.env.get('TWILIO_SMS_FROM')
  if (!raw?.trim()) return null
  const value = raw.trim()
  return value.startsWith('+') ? value : `+${value}`
}

async function sendTwilioSms(params: { to: string; body: string }) {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = smsFrom()

  if (!accountSid || !authToken || !from) {
    return { ok: false as const, fallback: true, error: 'twilio_sms_not_configured' }
  }

  const form = new URLSearchParams({
    From: from,
    To: toE164(params.to),
    Body: params.body.normalize('NFC'),
  })

  const apiRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    },
  )

  const apiData = await apiRes.json()

  if (!apiRes.ok) {
    console.error('Twilio SMS error:', apiData)
    return { ok: false as const, fallback: true, error: apiData }
  }

  return { ok: true as const, sid: apiData.sid as string | undefined, channel: 'sms' as const }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, message } = await req.json()

    if (!phone || !message) {
      return new Response(JSON.stringify({ ok: false, error: 'phone and message required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await sendTwilioSms({
      to: String(phone),
      body: String(message),
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ ok: false, fallback: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})