import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const emails = ['golfsolirl@gmail.com', 'golfsolirl+logingolfsol@gmail.com']

const { data: usersData, error: usersErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (usersErr) {
  console.error('listUsers', usersErr.message)
  process.exit(1)
}

for (const email of emails) {
  const authUser = usersData.users.find((u) => (u.email || '').toLowerCase() === email)
  const { data: byEmail, error: emailErr } = await admin.from('profiles').select('id, email, role, full_name').eq('email', email).maybeSingle()
  const { data: byId, error: idErr } = authUser
    ? await admin.from('profiles').select('id, email, role, full_name').eq('id', authUser.id).maybeSingle()
    : { data: null, error: null }

  console.log(JSON.stringify({ email, authUserId: authUser?.id ?? null, profileByEmail: byEmail, profileById: byId, emailErr: emailErr?.message, idErr: idErr?.message }, null, 2))
}
