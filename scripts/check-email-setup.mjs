import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const loadEnvFile = () => {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      }
      if (process.env[key] === undefined) process.env[key] = val
    }
  } catch {
    /* no local .env */
  }
}

loadEnvFile()

const key = process.env.RESEND_API_KEY?.trim()
const from = process.env.RESEND_FROM_EMAIL?.trim()
const to = process.env.RESEND_NOTIFICATION_TO?.trim()
const site = process.env.SITE_URL?.trim()
const admin = process.env.ADMIN_LOGIN_EMAIL?.trim()
const sb = process.env.SUPABASE_URL?.trim()
const sr = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const viteSb = process.env.VITE_SUPABASE_URL?.trim()
const viteAnon = process.env.VITE_SUPABASE_ANON_KEY?.trim()
const portalInviteDisabled =
  process.env.POST_ENQUIRY_PORTAL_INVITE_DISABLE === '1' ||
  process.env.POST_ENQUIRY_PORTAL_INVITE_DISABLE === 'true'

const checks = []
const ok = (m) => checks.push(['OK', m])
const warn = (m) => checks.push(['WARN', m])
const fail = (m) => checks.push(['FAIL', m])

const parseAddr = (raw) => {
  const s = String(raw ?? '').trim()
  const angle = s.match(/<([^>]+)>/)
  return (angle?.[1] || s).toLowerCase()
}

if (!key) fail('RESEND_API_KEY missing')
else ok('RESEND_API_KEY set')

if (!from) fail('RESEND_FROM_EMAIL missing')
else {
  const addr = parseAddr(from)
  if (addr.endsWith('@resend.dev')) {
    fail('RESEND_FROM_EMAIL still uses @resend.dev (test mode — only your Resend account inbox)')
  } else {
    ok(`RESEND_FROM_EMAIL uses custom domain: ${addr}`)
  }
}

if (!to) warn('RESEND_NOTIFICATION_TO missing (enquiry owner alerts will fail)')
else ok(`RESEND_NOTIFICATION_TO=${parseAddr(to)}`)

if (!sb || !sr) fail('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing (magic links + enquiry DB)')
else ok('Supabase server keys set')

if (!viteSb || !viteAnon) fail('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing (login UI)')
else ok('Supabase client keys set')

if (!site) warn('SITE_URL missing — magic link redirects may fail in production')
else ok(`SITE_URL=${site}`)

if (admin) ok(`ADMIN_LOGIN_EMAIL=${admin}`)
else warn('ADMIN_LOGIN_EMAIL not set (defaults to info@golfsolirl.com)')

if (portalInviteDisabled) warn('POST_ENQUIRY_PORTAL_INVITE_DISABLE is on — no delayed portal invite after forms')
else ok('Post-enquiry portal invite enabled (default ~90s after submit)')

if (key) {
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` }
    })
    const body = await res.json()
    if (!res.ok) {
      fail(`Resend domains API: ${body.message || res.status}`)
    } else {
      const domains = body.data || []
      if (domains.length === 0) warn('No domains in Resend account yet')
      for (const d of domains) {
        const status = d.status || 'unknown'
        const line = `${d.name} → ${status}`
        if (status === 'verified') ok(`Resend domain: ${line}`)
        else warn(`Resend domain: ${line}`)
      }
      const fromDomain = parseAddr(from).split('@')[1]
      if (fromDomain && domains.length) {
        const match = domains.find((d) => d.name === fromDomain)
        if (!match) warn(`FROM domain ${fromDomain} not found in Resend domain list`)
        else if (match.status !== 'verified') fail(`Sending domain ${match.name} is not verified yet`)
      }
    }
  } catch (e) {
    fail(`Could not reach Resend API: ${e.message}`)
  }
}

console.log('\nGolf Sol Ireland — email / auth setup check\n')
for (const [level, msg] of checks) {
  console.log(`${level.padEnd(5)} ${msg}`)
}
console.log('')
