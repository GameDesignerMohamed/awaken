// Supabase Edge Function — runs every 1 minute via pg_cron
// Deno runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@awaken.app'

const PROMPTS: Record<number, string> = {
  1: "What am I avoiding by doing what I'm doing?",
  2: 'If someone filmed the last two hours, what would they conclude I want?',
  3: 'Am I moving toward the life I hate or the life I want?',
  4: "What's the most important thing I'm pretending isn't important?",
  5: 'What did I do today from identity protection rather than genuine desire?',
  6: 'When did I feel most alive today? Most dead?',
}

// Convert VAPID keys and sign JWT for Web Push auth
async function generateVapidAuth(endpoint: string): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin

  // Create JWT header and payload
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    sub: VAPID_SUBJECT,
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(header))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  const payloadB64 = btoa(String.fromCharCode(...encoder.encode(JSON.stringify(payload))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const unsignedToken = `${headerB64}.${payloadB64}`

  // Import VAPID private key
  const rawKey = Uint8Array.from(atob(VAPID_PRIVATE_KEY.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'pkcs8',
    rawKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  ).catch(() => {
    // Try JWK import if pkcs8 fails (raw 32-byte key)
    return crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign'],
    )
  })

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(unsignedToken),
  )

  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  return {
    authorization: `vapid t=${unsignedToken}.${sigB64}, k=${VAPID_PUBLIC_KEY}`,
    cryptoKey: `p256ecdsa=${VAPID_PUBLIC_KEY}`,
  }
}

async function sendPushNotification(subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: object) {
  try {
    const { authorization, cryptoKey } = await generateVapidAuth(subscription.endpoint)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Crypto-Key': cryptoKey,
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error(`Push failed: ${response.status} ${response.statusText}`)
    }
  } catch (err) {
    console.error('Push send error:', err)
  }
}

function getCurrentTimeInTimezone(timezone: string): { hhmm: string; localDate: string } {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return {
    hhmm: formatter.format(now),
    localDate: dateFormatter.format(now),
  }
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Fetch all profiles with push subscriptions
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, timezone, interrupt_schedule, push_subscription')
    .not('push_subscription', 'is', null)

  if (error || !profiles) {
    return new Response(JSON.stringify({ error: error?.message || 'No profiles' }), { status: 500 })
  }

  let sent = 0

  for (const profile of profiles) {
    const { hhmm, localDate } = getCurrentTimeInTimezone(profile.timezone)
    const schedule = profile.interrupt_schedule as { slot: number; time: string }[]

    for (const { slot, time } of schedule) {
      if (time !== hhmm) continue

      // Try to insert — UNIQUE constraint provides idempotency
      const { error: insertError } = await supabase
        .from('notifications_sent')
        .insert({
          user_id: profile.id,
          slot,
          sent_date: localDate,
        })

      if (insertError) {
        // Unique violation = already sent, skip
        continue
      }

      // Send push notification
      const prompt = PROMPTS[slot] || `Interrupt ${slot}`
      await sendPushNotification(profile.push_subscription, {
        title: 'AWAKEN',
        body: `\u00A7 INTERRUPT ${slot}\n${prompt}`,
        slot,
        prompt,
      })

      sent++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
