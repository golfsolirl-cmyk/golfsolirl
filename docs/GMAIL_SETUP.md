# Gmail setup for Golf Sol Ireland admin mail

This app reads Gmail through Google OAuth and sends branded mail through Resend. Do **not** put Client IDs, Client Secrets, or API keys in source code. Use environment variables only.

The application requests these scopes only:

- `https://www.googleapis.com/auth/gmail.readonly` — list, search, and read inbox/threads
- `https://www.googleapis.com/auth/gmail.send` — send a reply on an existing Gmail thread

It does **not** request `https://mail.google.com/` or `gmail.modify`.

## 1. Open Google Cloud Console

1. Go to [https://console.cloud.google.com/](https://console.cloud.google.com/).
2. Create a project or select the existing Golf Sol project.

## 2. Enable the Gmail API

1. Open **APIs & Services → Library**.
2. Search for **Gmail API**.
3. Click **Enable**.

## 3. Configure the OAuth consent screen

1. Open **APIs & Services → OAuth consent screen**.
2. User type: **External** (unless you have a Google Workspace org for this project).
3. App name: `Golf Sol Ireland`.
4. User support email and developer contact: your admin address (for example `info@golfsolirl.com`).
5. Add the two scopes listed above.
6. While the app is in **Testing**, add yourself as a **Test user** (the Google account you will connect).
7. Publishing the app for production requires Google verification if you keep it External and use Gmail scopes. Until then, only test users can connect.

## 4. Create OAuth Web client credentials

1. Open **APIs & Services → Credentials**.
2. **Create credentials → OAuth client ID**.
3. Application type: **Web application**.
4. Name: `Golf Sol admin Gmail`.

### Authorised redirect URIs

Add both of these (adjust the production host if yours differs):

- Local: `http://localhost:5173/api/gmail-oauth-callback`
- Production: `https://www.golfsolirl.com/api/gmail-oauth-callback`

If the live site is `https://golfsolirl.com` without `www`, add that host as well. The value must match `GOOGLE_REDIRECT_URI` exactly.

## 5. Copy the Client ID and Client Secret

Copy them into your host’s environment — never into Git.

## 6. Environment variables

Set these on the machine or Vercel project (empty examples live in `.env.example`):

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
OAUTH_TOKEN_ENCRYPTION_KEY=
EMAIL_SEND_ENABLED=false
```

Reuse the existing Resend variables:

```
RESEND_API_KEY=
RESEND_FROM_EMAIL=
EMAIL_REPLY_TO=
```

`OAUTH_TOKEN_ENCRYPTION_KEY` must be at least 32 characters. Generate one with a password manager or:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`GOOGLE_REDIRECT_URI` local example: `http://localhost:5173/api/gmail-oauth-callback`  
Production example: `https://www.golfsolirl.com/api/gmail-oauth-callback`

Keep `EMAIL_SEND_ENABLED=false` until you are ready to send real customer email. Preview and PDF generation still work.

## 7. Database

Run `supabase/run-in-sql-editor-admin-mail.sql` in the Supabase SQL editor (or apply the migration `supabase/migrations/20260829120000_admin_mail.sql`).

This creates `email_accounts` (encrypted tokens, service role only), `email_activity`, and `email_template_overrides`.

## 8. Redeploy / restart

Restart `npm run dev` locally, or redeploy on Vercel so the new environment variables are available.

## 9. Connect Gmail from admin

1. Sign in at `/dashboard/admin`.
2. Open **Inbox** in the sidebar.
3. Click **Connect Gmail**.
4. Sign in with the Google account that receives customer mail.
5. Grant readonly + send.
6. You should return to the admin desk with **Connected** and the Gmail address shown.

Reconnect or Disconnect from the same panel. Tokens are never shown in the browser.

## Safety

- Do not paste secrets into chat, tickets, or the repo.
- Do not set `EMAIL_SEND_ENABLED=true` in local `.env` while testing against real customer addresses.
- If Google shows “app not verified”, add your Google account as a test user on the consent screen.
