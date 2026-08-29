/**
 * AES-256-GCM encryption for Gmail OAuth tokens at rest.
 * Key material comes from OAUTH_TOKEN_ENCRYPTION_KEY (never sent to the browser).
 */
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const throwStatus = (message, statusCode) => {
  const err = new Error(message)
  err.statusCode = statusCode
  throw err
}

const keyBytes = (env) => {
  const raw = env.OAUTH_TOKEN_ENCRYPTION_KEY?.trim() ?? ''
  if (raw.length < 32) {
    throwStatus(
      'Gmail token encryption is not configured. Set OAUTH_TOKEN_ENCRYPTION_KEY to a 32+ character secret.',
      500
    )
  }
  return createHash('sha256').update(raw).digest()
}

export const hasOauthEncryptionKey = (env) => (env.OAUTH_TOKEN_ENCRYPTION_KEY?.trim() ?? '').length >= 32

/** @param {string} plain @param {NodeJS.ProcessEnv} env */
export const encryptSecret = (plain, env) => {
  const key = keyBytes(env)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(String(plain ?? ''), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`
}

/** @param {string} packed @param {NodeJS.ProcessEnv} env */
export const decryptSecret = (packed, env) => {
  const key = keyBytes(env)
  const parts = String(packed ?? '').split('.')
  if (parts.length !== 4 || parts[0] !== 'v1') {
    throwStatus('Stored Gmail credentials are unreadable. Reconnect Gmail.', 500)
  }
  try {
    const iv = Buffer.from(parts[1], 'base64url')
    const tag = Buffer.from(parts[2], 'base64url')
    const data = Buffer.from(parts[3], 'base64url')
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    throwStatus('Stored Gmail credentials are unreadable. Reconnect Gmail.', 500)
  }
}

export const randomNonce = () => randomBytes(16).toString('hex')

/**
 * Signed OAuth state: uid, nonce, expiry. HMAC with the encryption key.
 * @param {{ uid: string, nonce: string, exp: number }} payload
 * @param {NodeJS.ProcessEnv} env
 */
export const signOauthState = (payload, env) => {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const sig = createHmac('sha256', keyBytes(env)).update(body).digest('base64url')
  return `${body}.${sig}`
}

/** @param {string} state @param {NodeJS.ProcessEnv} env */
export const verifyOauthState = (state, env) => {
  const raw = String(state ?? '')
  const dot = raw.lastIndexOf('.')
  if (dot < 1) {
    throwStatus('Invalid Gmail connection state. Start Connect Gmail again.', 400)
  }
  const body = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = createHmac('sha256', keyBytes(env)).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throwStatus('Invalid Gmail connection state. Start Connect Gmail again.', 400)
  }
  let parsed
  try {
    parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    throwStatus('Invalid Gmail connection state. Start Connect Gmail again.', 400)
  }
  if (!parsed || typeof parsed.uid !== 'string' || typeof parsed.nonce !== 'string') {
    throwStatus('Invalid Gmail connection state. Start Connect Gmail again.', 400)
  }
  if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) {
    throwStatus('Gmail connection timed out. Start Connect Gmail again.', 400)
  }
  return { uid: parsed.uid, nonce: parsed.nonce, exp: parsed.exp }
}
