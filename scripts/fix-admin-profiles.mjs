import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const ADMIN_EMAIL = (process.env.ADMIN_LOGIN_EMAIL || 'info@golfsolirl.ie').trim().toLowerCase()
const CLIENT_EMAIL = 'golfsolirl@gmail.com'

const { data: usersData, error: usersErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (usersErr) {
  console.error('listUsers', usersErr.message)
  process.exit(1)
}

const adminUser = usersData.users.find((u) => (u.email || '').toLowerCase() === ADMIN_EMAIL)
const clientUser = usersData.users.find((u) => (u.email || '').toLowerCase() === CLIENT_EMAIL)

if (!adminUser) {
  console.error('Admin auth user missing for', ADMIN_EMAIL)
  process.exit(1)
}

// 1) Demote main inbox login to client-only
if (clientUser) {
  const { error } = await admin.from('profiles').update({ role: 'client' }).eq('id', clientUser.id)
  console.log('demote', CLIENT_EMAIL, error?.message ?? 'ok')
} else {
  console.log('skip demote — no auth user for', CLIENT_EMAIL)
}

// 2) Ensure dedicated admin profile exists and matches auth user id
const { data: adminProfile } = await admin.from('profiles').select('id, email, role').eq('id', adminUser.id).maybeSingle()

if (!adminProfile) {
  const { error: insErr } = await admin.from('profiles').insert({
    id: adminUser.id,
    email: ADMIN_EMAIL,
    full_name: 'Golf Sol Admin Login',
    role: 'admin'
  })
  console.log('insert admin profile', insErr?.message ?? 'ok')
} else {
  const { error: upErr } = await admin
    .from('profiles')
    .update({ role: 'admin', email: ADMIN_EMAIL, full_name: adminProfile.full_name || 'Golf Sol Admin Login' })
    .eq('id', adminUser.id)
  console.log('promote admin profile', upErr?.message ?? 'ok')
}

// 3) Remove stray profile rows keyed by email but wrong id (should not happen)
const { data: stray } = await admin.from('profiles').select('id, email, role').eq('email', ADMIN_EMAIL)
for (const row of stray ?? []) {
  if (row.id !== adminUser.id) {
    const { error } = await admin.from('profiles').delete().eq('id', row.id)
    console.log('delete stray profile', row.id, error?.message ?? 'ok')
  }
}

// 4) Verify final state
for (const email of [ADMIN_EMAIL, CLIENT_EMAIL]) {
  const user = usersData.users.find((u) => (u.email || '').toLowerCase() === email)
  if (!user) {
    console.log(JSON.stringify({ email, status: 'no auth user' }))
    continue
  }
  const { data: prof } = await admin.from('profiles').select('id, email, role').eq('id', user.id).maybeSingle()
  console.log(JSON.stringify({ email, authUserId: user.id, profile: prof }, null, 2))
}
