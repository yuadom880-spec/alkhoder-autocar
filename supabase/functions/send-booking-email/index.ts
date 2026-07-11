import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ ok: false, error: 'to, subject, html required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('RESEND_API_KEY')
    const useProduction = Deno.env.get('RESEND_USE_PRODUCTION') === 'true'
    const PRODUCTION_FROM = 'Alkhedr Cars <Alkhedr.qa@alkhedrcars.com>'
    const TEST_FROM = 'onboarding@resend.dev'

    let from = (Deno.env.get('RESEND_FROM_EMAIL') ?? (useProduction ? PRODUCTION_FROM : TEST_FROM)).trim()
    if (from.startsWith('"') && from.endsWith('"')) from = from.slice(1, -1).trim()
    const addr = from.includes('<') ? from.match(/<([^>]+)>/)?.[1]?.trim() ?? from : from
    if (/@alkhedrcars\.com$/i.test(addr)) {
      /* verified domain sender */
    } else if (useProduction) {
      from = PRODUCTION_FROM
    } else if (/@gmail\.com/i.test(addr)) {
      from = TEST_FROM
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, fallback: true, error: 'resend_not_configured' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [String(to)],
        subject: String(subject),
        html: String(html),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ ok: false, fallback: true, error: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
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