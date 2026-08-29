/**
 * Gmail REST helpers — list, search, thread, MIME parse, attachments, threaded send.
 * Google credentials stay on the server.
 */
import { sanitizeEmailHtml } from './gmail-html-sanitize.mjs'

const throwStatus = (message, statusCode, code) => {
  const err = new Error(message)
  err.statusCode = statusCode
  if (code) err.code = code
  throw err
}

const gmailFetch = async (accessToken, path, opts = {}) => {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    method: opts.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(opts.body ? { 'Content-Type': 'application/json' } : {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  })
  const json = await res.json().catch(() => ({}))
  if (res.status === 401 || res.status === 403) {
    const err = new Error('Your Gmail connection has expired. Reconnect Gmail.')
    err.statusCode = 401
    err.code = 'GMAIL_RECONNECT'
    throw err
  }
  if (!res.ok) {
    const reason = typeof json.error?.message === 'string' ? json.error.message : ''
    if (/rate|quota/i.test(reason)) {
      throwStatus('Gmail temporarily rejected the request. Wait a moment and refresh.', 429)
    }
    throwStatus('Gmail could not complete that request. Try again.', 502)
  }
  return json
}

export const decodeGmailBody = (data) => {
  if (!data) return ''
  const padded = String(data).replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(padded, 'base64').toString('utf8')
}

export const headerValue = (headers, name) => {
  const list = Array.isArray(headers) ? headers : []
  const want = name.toLowerCase()
  const found = list.find((h) => String(h?.name ?? '').toLowerCase() === want)
  return typeof found?.value === 'string' ? found.value : ''
}

export const parseFromHeader = (raw) => {
  const s = String(raw ?? '').trim()
  const angle = s.match(/^(.*)<([^>]+)>\s*$/)
  if (angle) {
    return {
      name: angle[1].replaceAll('"', '').trim(),
      email: angle[2].trim().toLowerCase()
    }
  }
  if (s.includes('@')) {
    return { name: '', email: s.toLowerCase() }
  }
  return { name: s, email: '' }
}

const walkMime = (part, acc) => {
  if (!part || typeof part !== 'object') return
  const mime = String(part.mimeType ?? '')
  const filename = typeof part.filename === 'string' ? part.filename.trim() : ''
  const body = part.body && typeof part.body === 'object' ? part.body : {}
  if (filename && body.attachmentId) {
    acc.attachments.push({
      filename,
      mimeType: mime || 'application/octet-stream',
      attachmentId: body.attachmentId,
      size: Number(body.size) || 0
    })
  }
  if (mime === 'text/plain' && body.data && !acc.text) {
    acc.text = decodeGmailBody(body.data)
  }
  if (mime === 'text/html' && body.data && !acc.html) {
    acc.html = decodeGmailBody(body.data)
  }
  if (Array.isArray(part.parts)) {
    for (const child of part.parts) walkMime(child, acc)
  }
}

export const parseGmailPayload = (payload) => {
  const acc = { text: '', html: '', attachments: [] }
  walkMime(payload, acc)
  return acc
}

export const initialsFromName = (name, email) => {
  const source = String(name || email || '?').trim()
  const parts = source.replace(/@.*$/, '').split(/[\s._-]+/).filter(Boolean)
  const letters = (parts[0]?.[0] || '?') + (parts[1]?.[0] || '')
  return letters.toUpperCase()
}

const summarizeMessage = (message, allowImages) => {
  const headers = message.payload?.headers ?? []
  const from = parseFromHeader(headerValue(headers, 'From'))
  const parsed = parseGmailPayload(message.payload)
  const labelIds = Array.isArray(message.labelIds) ? message.labelIds : []
  return {
    id: message.id,
    threadId: message.threadId,
    fromName: from.name,
    fromEmail: from.email,
    initials: initialsFromName(from.name, from.email),
    to: headerValue(headers, 'To'),
    cc: headerValue(headers, 'Cc'),
    subject: headerValue(headers, 'Subject') || '(no subject)',
    date: headerValue(headers, 'Date'),
    internalDate: message.internalDate ? Number(message.internalDate) : 0,
    snippet: typeof message.snippet === 'string' ? message.snippet : '',
    unread: labelIds.includes('UNREAD'),
    labels: labelIds.filter((id) => !['INBOX', 'UNREAD', 'IMPORTANT', 'CATEGORY_PERSONAL'].includes(id)).slice(0, 6),
    hasAttachments: parsed.attachments.length > 0,
    attachmentCount: parsed.attachments.length
  }
}

const fullMessage = (message, allowImages) => {
  const headers = message.payload?.headers ?? []
  const from = parseFromHeader(headerValue(headers, 'From'))
  const parsed = parseGmailPayload(message.payload)
  const html = parsed.html ? sanitizeEmailHtml(parsed.html, { allowImages }) : ''
  const text = parsed.text || ''
  const labelIds = Array.isArray(message.labelIds) ? message.labelIds : []
  return {
    ...summarizeMessage(message, allowImages),
    messageIdHeader: headerValue(headers, 'Message-ID') || headerValue(headers, 'Message-Id'),
    inReplyTo: headerValue(headers, 'In-Reply-To'),
    references: headerValue(headers, 'References'),
    html,
    text,
    attachments: parsed.attachments.map((a) => ({
      filename: a.filename,
      mimeType: a.mimeType,
      attachmentId: a.attachmentId,
      size: a.size
    })),
    unread: labelIds.includes('UNREAD')
  }
}

export const listGmailThreads = async (accessToken, { query, max = 25 } = {}) => {
  const params = new URLSearchParams({
    maxResults: String(Math.min(Math.max(Number(max) || 25, 1), 40))
  })
  if (query) params.set('q', query)
  const listed = await gmailFetch(accessToken, `/threads?${params.toString()}`)
  const threads = Array.isArray(listed.threads) ? listed.threads : []
  const details = await Promise.all(
    threads.map(async (row) => {
      try {
        const thread = await gmailFetch(
          accessToken,
          `/threads/${encodeURIComponent(row.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
        )
        const messages = Array.isArray(thread.messages) ? thread.messages : []
        const last = messages[messages.length - 1] || messages[0]
        if (!last) {
          return {
            threadId: row.id,
            subject: '(no subject)',
            fromName: '',
            fromEmail: '',
            initials: '?',
            snippet: '',
            date: '',
            internalDate: 0,
            unread: false,
            hasAttachments: false,
            messageCount: 0
          }
        }
        const summary = summarizeMessage(last)
        return {
          threadId: row.id,
          subject: summary.subject,
          fromName: summary.fromName,
          fromEmail: summary.fromEmail,
          initials: summary.initials,
          snippet: last.snippet || summary.snippet,
          date: summary.date,
          internalDate: summary.internalDate,
          unread: messages.some((m) => Array.isArray(m.labelIds) && m.labelIds.includes('UNREAD')),
          hasAttachments: messages.some((m) => parseGmailPayload(m.payload).attachments.length > 0),
          messageCount: messages.length,
          labels: summary.labels
        }
      } catch {
        return {
          threadId: row.id,
          subject: '(unavailable)',
          fromName: '',
          fromEmail: '',
          initials: '?',
          snippet: '',
          date: '',
          internalDate: 0,
          unread: false,
          hasAttachments: false,
          messageCount: 0
        }
      }
    })
  )
  return { threads: details, nextPageToken: listed.nextPageToken || null }
}

export const getGmailThread = async (accessToken, threadId, { allowImages = false } = {}) => {
  const id = String(threadId ?? '').trim()
  if (!id) {
    throwStatus('Missing Gmail thread.', 400)
  }
  const thread = await gmailFetch(accessToken, `/threads/${encodeURIComponent(id)}?format=full`)
  const messages = Array.isArray(thread.messages) ? thread.messages.map((m) => fullMessage(m, allowImages)) : []
  const last = messages[messages.length - 1]
  return {
    threadId: thread.id,
    subject: last?.subject || '(no subject)',
    messages
  }
}

export const downloadGmailAttachment = async (accessToken, messageId, attachmentId) => {
  const mid = String(messageId ?? '').trim()
  const aid = String(attachmentId ?? '').trim()
  if (!mid || !aid) {
    throwStatus('Missing Gmail attachment.', 400)
  }
  const json = await gmailFetch(
    accessToken,
    `/messages/${encodeURIComponent(mid)}/attachments/${encodeURIComponent(aid)}`
  )
  const raw = String(json.data ?? '').replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Buffer.from(raw, 'base64')
  if (bytes.length > 8 * 1024 * 1024) {
    throwStatus('That Gmail attachment is too large to open here.', 400)
  }
  return bytes
}

const encodeRfc2047 = (value) => {
  const s = String(value ?? '')
  if (/^[\x20-\x7E]*$/.test(s)) return s
  return `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`
}

const encodeAddressList = (raw) =>
  String(raw ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')

const base64Url = (buf) =>
  Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

/**
 * Build a MIME message and send it on an existing Gmail thread.
 * @param {string} accessToken
 * @param {{
 *   from: string
 *   to: string
 *   cc?: string
 *   bcc?: string
 *   subject: string
 *   html: string
 *   text: string
 *   threadId: string
 *   inReplyTo?: string
 *   references?: string
 *   attachments?: { filename: string, bytes: Buffer, contentType?: string }[]
 * }} opts
 */
export const sendGmailThreadedReply = async (accessToken, opts) => {
  const boundaryMixed = `mix_${randomBoundary()}`
  const boundaryAlt = `alt_${randomBoundary()}`
  const lines = []
  lines.push(`From: ${opts.from}`)
  lines.push(`To: ${encodeAddressList(opts.to)}`)
  if (opts.cc) lines.push(`Cc: ${encodeAddressList(opts.cc)}`)
  if (opts.bcc) lines.push(`Bcc: ${encodeAddressList(opts.bcc)}`)
  lines.push(`Subject: ${encodeRfc2047(opts.subject)}`)
  lines.push('MIME-Version: 1.0')
  if (opts.inReplyTo) lines.push(`In-Reply-To: ${opts.inReplyTo}`)
  if (opts.references) lines.push(`References: ${opts.references}`)
  const attachments = Array.isArray(opts.attachments) ? opts.attachments : []
  if (attachments.length > 0) {
    lines.push(`Content-Type: multipart/mixed; boundary="${boundaryMixed}"`)
    lines.push('')
    lines.push(`--${boundaryMixed}`)
    lines.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`)
    lines.push('')
    pushAlternative(lines, boundaryAlt, opts.text, opts.html)
    for (const file of attachments) {
      lines.push(`--${boundaryMixed}`)
      const safeName = String(file.filename || 'attachment.pdf').replace(/["\r\n]/g, '')
      lines.push(`Content-Type: ${file.contentType || 'application/pdf'}; name="${safeName}"`)
      lines.push('Content-Transfer-Encoding: base64')
      lines.push(`Content-Disposition: attachment; filename="${safeName}"`)
      lines.push('')
      lines.push(file.bytes.toString('base64').replace(/(.{76})/g, '$1\n'))
    }
    lines.push(`--${boundaryMixed}--`)
  } else {
    lines.push(`Content-Type: multipart/alternative; boundary="${boundaryAlt}"`)
    lines.push('')
    pushAlternative(lines, boundaryAlt, opts.text, opts.html)
  }

  const raw = base64Url(lines.join('\r\n'))
  const sent = await gmailFetch(accessToken, '/messages/send', {
    method: 'POST',
    body: {
      raw,
      threadId: opts.threadId
    }
  })
  return { id: sent.id, threadId: sent.threadId }
}

const randomBoundary = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

const pushAlternative = (lines, boundary, text, html) => {
  lines.push(`--${boundary}`)
  lines.push('Content-Type: text/plain; charset="UTF-8"')
  lines.push('Content-Transfer-Encoding: base64')
  lines.push('')
  lines.push(Buffer.from(text || '', 'utf8').toString('base64').replace(/(.{76})/g, '$1\n'))
  lines.push(`--${boundary}`)
  lines.push('Content-Type: text/html; charset="UTF-8"')
  lines.push('Content-Transfer-Encoding: base64')
  lines.push('')
  lines.push(Buffer.from(html || '', 'utf8').toString('base64').replace(/(.{76})/g, '$1\n'))
  lines.push(`--${boundary}--`)
}
