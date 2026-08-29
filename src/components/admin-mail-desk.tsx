import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  FileText,
  Inbox,
  Loader2,
  MailPlus,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  ShieldOff
} from 'lucide-react'
import { LuxuryButton } from './ui/button'
import { adminMailRequest } from '../lib/admin-mail-api'
import { cx } from '../lib/utils'

export type AdminMailSeed = {
  readonly view?: 'inbox' | 'compose' | 'sent' | 'templates'
  readonly to?: string
  readonly customerName?: string
  readonly enquiryId?: string
  readonly enquiryReference?: string
  readonly phone?: string
  readonly interest?: string
  readonly threadId?: string
}

type MailDeskProps = {
  readonly accessToken: string | null
  readonly seed?: AdminMailSeed | null
  readonly onSeedConsumed?: () => void
  readonly onCreateDocument?: (enquiryId: string) => void
}

type GmailStatus = {
  connected: boolean
  emailAddress: string
  sendEnabled: boolean
  googleConfigured: boolean
}

type MailStatus = {
  ok: boolean
  gmail: GmailStatus
  from: string
  replyTo: string
  sendEnabled: boolean
  resendConfigured: boolean
  maxAttachments: number
  maxAttachmentBytes: number
  templates: { id: string; label: string; blurb: string }[]
}

type ThreadListItem = {
  threadId: string
  subject: string
  fromName: string
  fromEmail: string
  initials: string
  snippet: string
  date: string
  internalDate: number
  unread: boolean
  hasAttachments: boolean
  messageCount: number
}

type ThreadMessage = ThreadListItem & {
  id: string
  html: string
  text: string
  to: string
  messageIdHeader: string
  inReplyTo: string
  references: string
  attachments: { filename: string; mimeType: string; attachmentId: string; size: number }[]
}

type LinkedEnquiry = {
  id: string
  reference: string
  name: string
  email: string
  phone: string
  interest: string
  travelDates: string
  numberOfGuests: string
}

type TemplateRow = {
  id: string
  label: string
  blurb: string
  subject: string
  heading: string
  introduction: string
  body: string
  ctaLabel: string
  ctaUrl: string
  closing: string
}

type SentRow = {
  id: string
  provider: string
  to_email: string
  subject: string
  template_id: string | null
  status: string
  attachment_names: string[] | null
  sent_at: string | null
  created_at: string
}

type MailView = 'inbox' | 'compose' | 'sent' | 'templates'

type ComposeState = {
  to: string
  cc: string
  bcc: string
  subject: string
  templateId: string
  customerName: string
  heading: string
  introduction: string
  body: string
  ctaLabel: string
  ctaUrl: string
  closing: string
  enquiryId: string
  reference: string
  phone: string
  interest: string
  threadId: string
  inReplyTo: string
  references: string
}

const emptyCompose = (): ComposeState => ({
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  templateId: 'general_reply',
  customerName: '',
  heading: '',
  introduction: '',
  body: '',
  ctaLabel: '',
  ctaUrl: '',
  closing: '',
  enquiryId: '',
  reference: '',
  phone: '',
  interest: '',
  threadId: '',
  inReplyTo: '',
  references: ''
})

const formatWhen = (value: string | number) => {
  const date = typeof value === 'number' ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

type PdfAttachment = { filename: string; contentBase64: string; size: number }

export function AdminMailDesk({ accessToken, seed, onSeedConsumed, onCreateDocument }: MailDeskProps) {
  const [view, setView] = useState<MailView>('inbox')
  const [status, setStatus] = useState<MailStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [oauthNotice, setOauthNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [threads, setThreads] = useState<ThreadListItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([])
  const [threadSubject, setThreadSubject] = useState('')
  const [linked, setLinked] = useState<LinkedEnquiry | null>(null)
  const [allowImages, setAllowImages] = useState(false)
  const [showCc, setShowCc] = useState(false)
  const [compose, setCompose] = useState<ComposeState>(emptyCompose)
  const [attachments, setAttachments] = useState<PdfAttachment[]>([])
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewSubject, setPreviewSubject] = useState('')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [sentNotice, setSentNotice] = useState<string | null>(null)
  const [sentRows, setSentRows] = useState<SentRow[]>([])
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [templateEdit, setTemplateEdit] = useState<TemplateRow | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const sendLock = useRef(false)
  const idempotencyRef = useRef('')

  const connected = Boolean(status?.gmail.connected)
  const sendEnabled = Boolean(status?.sendEnabled)

  const loadStatus = useCallback(async () => {
    if (!accessToken) return
    setStatusError(null)
    try {
      const data = await adminMailRequest<MailStatus>(accessToken, { action: 'status' })
      setStatus(data)
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to load mail status.'))
    }
  }, [accessToken])

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const mail = params.get('mail')
    if (mail === 'connected') {
      setOauthNotice('Gmail connected.')
      setView('inbox')
      void loadStatus()
    } else if (mail === 'error') {
      const reason = params.get('reason') || 'oauth'
      const map: Record<string, string> = {
        denied: 'Gmail access was not granted.',
        invalid_state: 'The Gmail connection expired. Click Connect Gmail again.',
        missing_code: 'Gmail did not return a login code. Try again.',
        token_failed: 'Gmail could not finish connecting. Try again.',
        config: 'Gmail is not configured on the server yet.',
        setup: 'Run the admin mail SQL in Supabase, then connect Gmail.',
        save_failed: 'Gmail connected at Google but could not be saved. Try again.',
        oauth: 'Gmail connection failed.'
      }
      setOauthNotice(map[reason] || map.oauth)
    }
    if (mail) {
      params.delete('mail')
      params.delete('reason')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
      window.history.replaceState({}, '', next)
    }
  }, [loadStatus])

  const loadInbox = useCallback(async () => {
    if (!accessToken || !connected) return
    setBusy('inbox')
    try {
      const data = await adminMailRequest<{ threads: ThreadListItem[] }>(accessToken, {
        action: 'inbox',
        folder,
        unreadOnly,
        q: query
      })
      setThreads(data.threads ?? [])
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to load the inbox.'))
    } finally {
      setBusy(null)
    }
  }, [accessToken, connected, folder, query, unreadOnly])

  useEffect(() => {
    if (view === 'inbox' && connected) void loadInbox()
  }, [view, connected, loadInbox])

  const openThread = async (threadId: string, images = allowImages) => {
    if (!accessToken) return
    setSelectedId(threadId)
    setBusy('thread')
    setStatusError(null)
    try {
      const data = await adminMailRequest<{
        thread: { threadId: string; subject: string; messages: ThreadMessage[] }
        linkedEnquiry: LinkedEnquiry | null
      }>(accessToken, { action: 'thread', threadId, allowImages: images })
      setThreadMessages(data.thread.messages ?? [])
      setThreadSubject(data.thread.subject)
      setLinked(data.linkedEnquiry)
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to load that conversation.'))
    } finally {
      setBusy(null)
    }
  }

  const applyTemplateToCompose = (t: TemplateRow, next: ComposeState) => {
    const first = next.customerName.trim().split(/\s+/)[0] || ''
    const filled = (value: string) =>
      value
        .replaceAll('{{customerName}}', next.customerName)
        .replaceAll('{{firstName}}', first)
        .replaceAll('{{email}}', next.to)
        .replaceAll('{{phone}}', next.phone)
        .replaceAll('{{reference}}', next.reference)
        .replaceAll('{{interest}}', next.interest)
        .replaceAll('{{companyName}}', 'Golf Sol Ireland')
        .replaceAll('{{website}}', 'www.golfsolirl.com')
        .replaceAll('{{companyPhone}}', '+353 87 446 4766')
        .replace(/\{\{#\w+\}\}[\s\S]*?\{\{\/\w+\}\}/g, '')
        .replace(/\{\{\w+\}\}/g, '')
    return {
      ...next,
      templateId: t.id,
      subject: filled(t.subject),
      heading: t.heading,
      introduction: t.introduction,
      body: t.body,
      ctaLabel: t.ctaLabel,
      ctaUrl: t.ctaUrl,
      closing: t.closing
    }
  }

  const startCompose = (partial: Partial<ComposeState>, template?: TemplateRow) => {
    const base = { ...emptyCompose(), ...partial }
    const t = template || templates.find((row) => row.id === (partial.templateId || 'general_reply'))
    setCompose(t ? applyTemplateToCompose(t, base) : base)
    setAttachments([])
    setPreviewHtml(null)
    setSentNotice(null)
    idempotencyRef.current = crypto.randomUUID()
    setView('compose')
  }

  useEffect(() => {
    if (!seed) return
    if (seed.view) setView(seed.view)
    if (seed.to || seed.view === 'compose') {
      startCompose({
        to: seed.to || '',
        customerName: seed.customerName || '',
        enquiryId: seed.enquiryId || '',
        reference: seed.enquiryReference || '',
        phone: seed.phone || '',
        interest: seed.interest || '',
        threadId: seed.threadId || ''
      })
    }
    onSeedConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  const loadTemplates = useCallback(async () => {
    if (!accessToken) return
    try {
      const data = await adminMailRequest<{ templates: TemplateRow[] }>(accessToken, { action: 'templates' })
      setTemplates(data.templates ?? [])
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to load templates.'))
    }
  }, [accessToken])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  const loadSent = useCallback(async () => {
    if (!accessToken) return
    setBusy('sent')
    try {
      const data = await adminMailRequest<{ rows: SentRow[] }>(accessToken, { action: 'sent' })
      setSentRows(data.rows ?? [])
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to load sent email.'))
    } finally {
      setBusy(null)
    }
  }, [accessToken])

  useEffect(() => {
    if (view === 'sent') void loadSent()
  }, [view, loadSent])

  const connectGmail = async () => {
    if (!accessToken) return
    setBusy('oauth')
    setStatusError(null)
    try {
      const data = await adminMailRequest<{ url: string }>(accessToken, { action: 'oauth-start' })
      window.location.href = data.url
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to start Gmail connection.'))
      setBusy(null)
    }
  }

  const disconnectGmail = async () => {
    if (!accessToken) return
    if (!window.confirm('Disconnect Gmail from this admin desk?')) return
    setBusy('oauth')
    try {
      await adminMailRequest(accessToken, { action: 'disconnect' })
      setThreads([])
      setThreadMessages([])
      await loadStatus()
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to disconnect Gmail.'))
    } finally {
      setBusy(null)
    }
  }

  const vars = useMemo(
    () => ({
      customerName: compose.customerName,
      firstName: compose.customerName.trim().split(/\s+/)[0] || '',
      email: compose.to,
      phone: compose.phone,
      reference: compose.reference,
      interest: compose.interest,
      companyName: 'Golf Sol Ireland',
      companyPhone: '+353 87 446 4766',
      website: 'www.golfsolirl.com'
    }),
    [compose]
  )

  const preview = async () => {
    if (!accessToken) return
    setBusy('preview')
    setStatusError(null)
    try {
      const data = await adminMailRequest<{ html: string; subject: string }>(accessToken, {
        action: 'preview',
        ...compose,
        vars
      })
      setPreviewSubject(data.subject)
      setPreviewHtml(data.html)
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to preview the email.'))
    } finally {
      setBusy(null)
    }
  }

  const addPdfFiles = async (files: FileList | File[]) => {
    const max = status?.maxAttachments ?? 3
    const maxBytes = status?.maxAttachmentBytes ?? 2.5 * 1024 * 1024
    const next = [...attachments]
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setStatusError('Only PDF files can be attached.')
        continue
      }
      if (file.size > maxBytes) {
        setStatusError(`The PDF exceeds the maximum attachment size (${formatBytes(maxBytes)}).`)
        continue
      }
      if (next.length >= max) {
        setStatusError(`At most ${max} PDF attachments are allowed.`)
        break
      }
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf)
      const sig = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0, bytes[4] ?? 0)
      if (sig !== '%PDF-') {
        setStatusError(`"${file.name}" is not a valid PDF.`)
        continue
      }
      const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
      next.push({
        filename: file.name,
        contentBase64: btoa(binary),
        size: file.size
      })
    }
    setAttachments(next)
  }

  const generatePdf = async () => {
    if (!accessToken) return
    setBusy('pdf')
    setStatusError(null)
    try {
      const data = await adminMailRequest<{ filename: string; contentBase64: string; size: number }>(accessToken, {
        action: 'generate-pdf',
        ...compose,
        message: compose.body,
        vars
      })
      setAttachments((current) => {
        const without = current.filter((a) => a.filename !== data.filename)
        return [...without, { filename: data.filename, contentBase64: data.contentBase64, size: data.size }]
      })
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to generate the PDF.'))
    } finally {
      setBusy(null)
    }
  }

  const send = async (mode: 'resend' | 'gmail') => {
    if (!accessToken || sendLock.current) return
    if (!sendEnabled) {
      setStatusError('Email sending is disabled. Preview is available. Set EMAIL_SEND_ENABLED=true to send.')
      return
    }
    sendLock.current = true
    setBusy('send')
    setStatusError(null)
    setSentNotice(null)
    try {
      if (!idempotencyRef.current) idempotencyRef.current = crypto.randomUUID()
      const action = mode === 'gmail' ? 'send-gmail-reply' : 'send-branded'
      const data = await adminMailRequest<{
        to: string
        subject: string
        attachments: string[]
        sentAt: string
        provider: string
        activityId: string | null
      }>(accessToken, {
        action,
        ...compose,
        vars,
        attachments: attachments.map((a) => ({ filename: a.filename, contentBase64: a.contentBase64 })),
        idempotencyKey: idempotencyRef.current
      })
      setSentNotice(
        `Email sent successfully to ${data.to} · ${data.subject} · ${data.provider === 'gmail' ? 'Gmail' : 'Resend'}${
          data.attachments?.length ? ` · ${data.attachments.join(', ')}` : ''
        }`
      )
      setPreviewHtml(null)
      idempotencyRef.current = crypto.randomUUID()
      if (mode === 'gmail' && compose.threadId) {
        await openThread(compose.threadId)
        setView('inbox')
      }
    } catch (error) {
      setStatusError(errorMessage(error, 'The email could not be sent. No message was delivered.'))
    } finally {
      sendLock.current = false
      setBusy(null)
    }
  }

  const saveDraft = async () => {
    if (!accessToken) return
    setBusy('draft')
    try {
      await adminMailRequest(accessToken, {
        action: 'save-draft',
        ...compose,
        attachmentNames: attachments.map((a) => a.filename)
      })
      setSentNotice('Draft saved in Sent / history.')
    } catch (error) {
      setStatusError(errorMessage(error, 'Unable to save the draft.'))
    } finally {
      setBusy(null)
    }
  }

  const replyFromThread = (branded: boolean) => {
    const last = threadMessages[threadMessages.length - 1]
    if (!last) return
    const inbound = threadMessages.filter(
      (m) => m.fromEmail && m.fromEmail !== (status?.gmail.emailAddress || '').toLowerCase()
    )
    const customer = inbound[inbound.length - 1] || last
    startCompose(
      {
        to: customer.fromEmail,
        customerName: customer.fromName || linked?.name || '',
        subject: last.subject.startsWith('Re:') ? last.subject : `Re: ${last.subject}`,
        enquiryId: linked?.id || '',
        reference: linked?.reference || '',
        phone: linked?.phone || '',
        interest: linked?.interest || '',
        threadId: selectedId || last.threadId,
        inReplyTo: last.messageIdHeader,
        references: [last.references, last.messageIdHeader].filter(Boolean).join(' '),
        templateId: branded ? 'enquiry_followup' : 'general_reply'
      },
      templates.find((t) => t.id === (branded ? 'enquiry_followup' : 'general_reply'))
    )
  }

  const copyEmail = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setSentNotice(`Copied ${value}`)
    } catch {
      setStatusError('Unable to copy that address.')
    }
  }

  const navBtn = (id: MailView, label: string, icon: typeof Inbox) => {
    const Icon = icon
    return (
      <button
        className={cx(
          'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition',
          view === id ? 'bg-fairway-50 text-forest-950 ring-1 ring-fairway-200' : 'text-forest-800 hover:bg-forest-50'
        )}
        onClick={() => setView(id)}
        type="button"
      >
        <Icon aria-hidden className="h-4 w-4" />
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-5" id="admin-hub-mail">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-forest-100 bg-white px-5 py-4 shadow-soft">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Gmail connection</p>
          <p className="mt-1 text-sm font-semibold text-forest-950">
            {connected ? `Connected · ${status?.gmail.emailAddress}` : 'Not connected'}
          </p>
          <p className="mt-0.5 text-xs text-forest-600">
            Inbox uses Gmail. Branded quotations and documents send through Resend from {status?.from || 'the configured from address'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!sendEnabled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-950">
              <ShieldOff aria-hidden className="h-3.5 w-3.5" />
              Email sending disabled
            </span>
          ) : null}
          {connected ? (
            <>
              <LuxuryButton className="!px-4 !py-2 !text-xs" onClick={() => void connectGmail()} type="button" variant="outlineOnLight">
                Reconnect
              </LuxuryButton>
              <LuxuryButton className="!px-4 !py-2 !text-xs" onClick={() => void disconnectGmail()} type="button" variant="outline">
                Disconnect
              </LuxuryButton>
            </>
          ) : (
            <>
              <LuxuryButton
                className="!px-5 !py-2.5"
                disabled={busy === 'oauth' || !status || !status.gmail.googleConfigured}
                onClick={() => void connectGmail()}
                type="button"
              >
                {busy === 'oauth' ? 'Connecting…' : 'Connect Gmail'}
              </LuxuryButton>
              {status && !status.gmail.googleConfigured ? (
                <p className="basis-full text-xs text-forest-600">
                  Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, and OAUTH_TOKEN_ENCRYPTION_KEY first. See
                  docs/GMAIL_SETUP.md.
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>

      {oauthNotice ? (
        <p className="rounded-2xl border border-fairway-200 bg-fairway-50 px-4 py-3 text-sm text-forest-900">{oauthNotice}</p>
      ) : null}
      {statusError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {statusError}
        </p>
      ) : null}
      {sentNotice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          {sentNotice}
          <button className="ml-3 font-semibold underline" onClick={() => setView('sent')} type="button">
            View sent email
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Email folders" className="flex gap-2 overflow-x-auto rounded-[1.5rem] border border-forest-100 bg-white p-3 shadow-soft lg:block lg:space-y-1">
          {navBtn('inbox', 'Inbox', Inbox)}
          {navBtn('compose', 'Compose', MailPlus)}
          {navBtn('sent', 'Sent', Send)}
          {navBtn('templates', 'Templates', FileText)}
        </nav>

        <div className="min-w-0">
          {view === 'inbox' ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)]">
              <section className={cx('rounded-[1.75rem] border border-forest-100 bg-white shadow-soft', selectedId ? 'hidden lg:block' : '')}>
                <div className="border-b border-forest-100 p-4">
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor="mail-search">
                      Search Gmail
                    </label>
                    <div className="relative flex-1">
                      <Search aria-hidden className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-forest-400" />
                      <input
                        className="w-full rounded-xl border border-forest-200 bg-offwhite py-2 pl-9 pr-3 text-sm text-forest-950"
                        id="mail-search"
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void loadInbox()
                        }}
                        placeholder="Search Gmail"
                        value={query}
                      />
                    </div>
                    <button
                      aria-label="Refresh inbox"
                      className="rounded-xl border border-forest-200 p-2 text-forest-800 hover:bg-forest-50"
                      onClick={() => void loadInbox()}
                      type="button"
                    >
                      <RefreshCw className={cx('h-4 w-4', busy === 'inbox' && 'animate-spin')} />
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className={cx('rounded-full px-3 py-1 text-xs font-semibold', folder === 'inbox' ? 'bg-forest-900 text-white' : 'bg-forest-100 text-forest-800')}
                      onClick={() => setFolder('inbox')}
                      type="button"
                    >
                      Inbox
                    </button>
                    <button
                      className={cx('rounded-full px-3 py-1 text-xs font-semibold', folder === 'sent' ? 'bg-forest-900 text-white' : 'bg-forest-100 text-forest-800')}
                      onClick={() => setFolder('sent')}
                      type="button"
                    >
                      Gmail sent
                    </button>
                    <button
                      className={cx('rounded-full px-3 py-1 text-xs font-semibold', unreadOnly ? 'bg-amber-200 text-amber-950' : 'bg-forest-100 text-forest-800')}
                      onClick={() => setUnreadOnly((v) => !v)}
                      type="button"
                    >
                      Unread
                    </button>
                  </div>
                </div>
                {!connected ? (
                  <p className="p-5 text-sm text-forest-600">Connect Gmail to load the inbox.</p>
                ) : busy === 'inbox' && threads.length === 0 ? (
                  <p className="p-5 text-sm text-forest-600">Loading inbox…</p>
                ) : threads.length === 0 ? (
                  <p className="p-5 text-sm text-forest-600">No messages match this search.</p>
                ) : (
                  <ul className="max-h-[70vh] divide-y divide-forest-100 overflow-y-auto">
                    {threads.map((row) => (
                      <li key={row.threadId}>
                        <button
                          className={cx(
                            'flex w-full gap-3 px-4 py-3 text-left hover:bg-fairway-50/70',
                            selectedId === row.threadId && 'bg-fairway-50'
                          )}
                          onClick={() => void openThread(row.threadId)}
                          type="button"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-900 text-xs font-bold text-white">
                            {row.initials}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className={cx('truncate text-sm', row.unread ? 'font-bold text-forest-950' : 'font-medium text-forest-800')}>
                                {row.fromName || row.fromEmail || 'Unknown'}
                              </span>
                              <span className="shrink-0 text-[11px] text-forest-500">{formatWhen(row.internalDate || row.date)}</span>
                            </span>
                            <span className={cx('block truncate text-sm', row.unread ? 'font-semibold text-forest-900' : 'text-forest-700')}>
                              {row.subject}
                            </span>
                            <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-forest-500">
                              {row.hasAttachments ? <Paperclip aria-hidden className="h-3 w-3" /> : null}
                              {row.snippet}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={cx('rounded-[1.75rem] border border-forest-100 bg-white shadow-soft', !selectedId ? 'hidden lg:block' : '')}>
                {!selectedId ? (
                  <p className="p-8 text-sm text-forest-600">Select a conversation.</p>
                ) : busy === 'thread' && threadMessages.length === 0 ? (
                  <p className="p-8 text-sm text-forest-600">Loading conversation…</p>
                ) : (
                  <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="min-w-0">
                      <div className="flex items-start gap-3 border-b border-forest-100 px-4 py-4">
                        <button
                          className="rounded-lg p-2 text-forest-800 hover:bg-forest-50 lg:hidden"
                          onClick={() => setSelectedId(null)}
                          type="button"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span className="sr-only">Back to inbox</span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-semibold text-forest-950">{threadSubject}</h3>
                          <p className="text-xs text-forest-500">{threadMessages.length} messages</p>
                        </div>
                      </div>
                      <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
                        {threadMessages.map((message) => (
                          <article className="rounded-2xl border border-forest-100 bg-offwhite/80 p-4" key={message.id}>
                            <header className="flex items-start justify-between gap-3">
                              <div className="flex gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-xs font-bold text-white">
                                  {message.initials}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold text-forest-950">{message.fromName || message.fromEmail}</p>
                                  <p className="text-xs text-forest-500">{message.fromEmail}</p>
                                </div>
                              </div>
                              <time className="text-xs text-forest-500">{formatWhen(message.internalDate || message.date)}</time>
                            </header>
                            {message.html ? (
                              <iframe
                                className="mt-3 min-h-[180px] w-full rounded-xl bg-white"
                                sandbox=""
                                srcDoc={message.html}
                                title={`Message from ${message.fromEmail}`}
                              />
                            ) : (
                              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-forest-800">{message.text}</pre>
                            )}
                            {message.attachments.length > 0 ? (
                              <ul className="mt-3 space-y-1 text-xs text-forest-700">
                                {message.attachments.map((file) => (
                                  <li key={file.attachmentId}>
                                    <Paperclip aria-hidden className="mr-1 inline h-3 w-3" />
                                    {file.filename} ({formatBytes(file.size)})
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </article>
                        ))}
                        <div className="flex flex-wrap gap-2">
                          <LuxuryButton className="!px-4 !py-2 !text-xs" disabled={!connected} onClick={() => replyFromThread(false)} type="button">
                            Reply via Gmail
                          </LuxuryButton>
                          <LuxuryButton className="!px-4 !py-2 !text-xs" onClick={() => replyFromThread(true)} type="button" variant="outlineOnLight">
                            Create branded response
                          </LuxuryButton>
                          {linked ? (
                            <LuxuryButton
                              className="!px-4 !py-2 !text-xs"
                              onClick={() => onCreateDocument?.(linked.id)}
                              type="button"
                              variant="outline"
                            >
                              Create quote
                            </LuxuryButton>
                          ) : null}
                        </div>
                        {!allowImages ? (
                          <button className="text-xs font-semibold text-forest-700 underline" onClick={() => {
                            setAllowImages(true)
                            if (selectedId) void openThread(selectedId, true)
                          }} type="button">
                            Load external images
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <aside className="border-t border-forest-100 p-4 xl:border-l xl:border-t-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Customer</p>
                      {linked ? (
                        <div className="mt-2 space-y-1 text-sm text-forest-800">
                          <p className="font-semibold text-forest-950">{linked.name}</p>
                          <p>{linked.email}</p>
                          {linked.phone ? <p>{linked.phone}</p> : null}
                          <p>Ref {linked.reference}</p>
                          {linked.interest ? <p>{linked.interest}</p> : null}
                          {linked.travelDates ? <p>{linked.travelDates}</p> : null}
                          {linked.numberOfGuests ? <p>{linked.numberOfGuests} guests</p> : null}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-forest-600">No matching website form for this sender.</p>
                      )}
                      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-700">Actions</p>
                      <div className="mt-2 flex flex-col gap-2">
                        <LuxuryButton className="!px-3 !py-2 !text-xs" onClick={() => replyFromThread(false)} type="button">
                          Reply
                        </LuxuryButton>
                        <LuxuryButton className="!px-3 !py-2 !text-xs" onClick={() => replyFromThread(true)} type="button" variant="outlineOnLight">
                          Branded email
                        </LuxuryButton>
                        {linked ? (
                          <LuxuryButton className="!px-3 !py-2 !text-xs" onClick={() => onCreateDocument?.(linked.id)} type="button" variant="outline">
                            Generate document
                          </LuxuryButton>
                        ) : null}
                        <LuxuryButton
                          className="!px-3 !py-2 !text-xs"
                          onClick={() => void copyEmail(linked?.email || threadMessages[0]?.fromEmail || '')}
                          type="button"
                          variant="outline"
                        >
                          Copy email
                        </LuxuryButton>
                      </div>
                    </aside>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {view === 'compose' ? (
            <section className="rounded-[1.75rem] border border-forest-100 bg-white p-5 shadow-soft sm:p-7">
              <h3 className="font-display text-xl font-semibold text-forest-950">Compose</h3>
              <p className="mt-1 text-sm text-forest-600">
                Reply via Gmail keeps the Gmail thread. Send branded email uses Resend and Golf Sol stationery.
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  From
                  <input className="mt-1 w-full rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-800" readOnly value={status?.from || ''} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  To
                  <input
                    className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm"
                    onChange={(e) => setCompose((c) => ({ ...c, to: e.target.value }))}
                    type="email"
                    value={compose.to}
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  Template
                  <select
                    className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm"
                    onChange={(e) => {
                      const t = templates.find((row) => row.id === e.target.value)
                      if (t) setCompose((c) => applyTemplateToCompose(t, { ...c, templateId: t.id }))
                    }}
                    value={compose.templateId}
                  >
                    {(templates.length ? templates : status?.templates || []).map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  Customer name
                  <input
                    className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm"
                    onChange={(e) => setCompose((c) => ({ ...c, customerName: e.target.value }))}
                    value={compose.customerName}
                  />
                </label>
              </div>
              <button className="mt-3 text-xs font-semibold text-forest-700 underline" onClick={() => setShowCc((v) => !v)} type="button">
                {showCc ? 'Hide CC / BCC' : 'Show CC / BCC'}
              </button>
              {showCc ? (
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                    CC
                    <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, cc: e.target.value }))} value={compose.cc} />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                    BCC
                    <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, bcc: e.target.value }))} value={compose.bcc} />
                  </label>
                </div>
              ) : null}
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-forest-700">
                Subject
                <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))} value={compose.subject} />
              </label>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-forest-700">
                Heading
                <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, heading: e.target.value }))} value={compose.heading} />
              </label>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-forest-700">
                Introduction
                <textarea className="mt-1 min-h-[70px] w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, introduction: e.target.value }))} value={compose.introduction} />
              </label>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-forest-700">
                Email body
                <textarea className="mt-1 min-h-[160px] w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, body: e.target.value }))} value={compose.body} />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  CTA label
                  <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, ctaLabel: e.target.value }))} value={compose.ctaLabel} />
                </label>
                <label className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  CTA URL
                  <input className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, ctaUrl: e.target.value }))} value={compose.ctaUrl} />
                </label>
              </div>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-forest-700">
                Closing
                <textarea className="mt-1 min-h-[70px] w-full rounded-xl border border-forest-200 px-3 py-2 text-sm" onChange={(e) => setCompose((c) => ({ ...c, closing: e.target.value }))} value={compose.closing} />
              </label>

              <div
                className="mt-5 rounded-2xl border border-dashed border-forest-300 bg-offwhite/70 p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  void addPdfFiles(e.dataTransfer.files)
                }}
              >
                <p className="text-sm font-semibold text-forest-950">PDF attachments</p>
                <p className="text-xs text-forest-600">PDF only · max {status?.maxAttachments ?? 3} files · {formatBytes(status?.maxAttachmentBytes ?? 2.5 * 1024 * 1024)} each</p>
                <input
                  accept="application/pdf,.pdf"
                  className="mt-3 text-sm"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) void addPdfFiles(e.target.files)
                    e.target.value = ''
                  }}
                  ref={fileRef}
                  type="file"
                />
                <ul className="mt-3 space-y-2">
                  {attachments.map((file) => (
                    <li className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm" key={file.filename}>
                      <span>
                        {file.filename} <span className="text-forest-500">({formatBytes(file.size)})</span>
                      </span>
                      <button className="text-xs font-semibold text-red-800" onClick={() => setAttachments((a) => a.filter((x) => x.filename !== file.filename))} type="button">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={busy === 'draft'} onClick={() => void saveDraft()} type="button" variant="outline">
                  Save draft
                </LuxuryButton>
                <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={busy === 'preview'} onClick={() => void preview()} type="button" variant="outlineOnLight">
                  {busy === 'preview' ? 'Preparing preview…' : 'Preview'}
                </LuxuryButton>
                <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={busy === 'pdf'} onClick={() => void generatePdf()} type="button" variant="outlineOnLight">
                  {busy === 'pdf' ? 'Generating PDF…' : 'Generate PDF'}
                </LuxuryButton>
                <LuxuryButton
                  className="!px-4 !py-2 !text-sm"
                  disabled={busy === 'send' || !sendEnabled || !compose.threadId}
                  onClick={() => void send('gmail')}
                  type="button"
                >
                  {busy === 'send' ? 'Sending…' : 'Reply via Gmail'}
                </LuxuryButton>
                <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={busy === 'send' || !sendEnabled} onClick={() => void send('resend')} type="button">
                  {busy === 'send' ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending email…
                    </span>
                  ) : (
                    'Send branded email'
                  )}
                </LuxuryButton>
              </div>
              {!compose.threadId ? (
                <p className="mt-2 text-xs text-forest-500">Reply via Gmail is available when you open a Gmail conversation first.</p>
              ) : null}
              {!sendEnabled ? (
                <p className="mt-2 text-xs font-semibold text-amber-900">Sending is locked. Preview and generate PDF still work.</p>
              ) : null}
            </section>
          ) : null}

          {view === 'sent' ? (
            <section className="overflow-hidden rounded-[1.75rem] border border-forest-100 bg-white shadow-soft">
              {busy === 'sent' ? (
                <p className="p-6 text-sm text-forest-600">Loading sent email…</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-forest-950 text-xs font-semibold uppercase tracking-wide text-white">
                      <tr>
                        <th className="px-4 py-3">Recipient</th>
                        <th className="px-4 py-3">Subject</th>
                        <th className="px-4 py-3">Provider</th>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Attachments</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sentRows.map((row) => (
                        <tr className="border-t border-forest-100" key={row.id}>
                          <td className="px-4 py-3">{row.to_email || '—'}</td>
                          <td className="px-4 py-3">{row.subject || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={cx('rounded-full px-2 py-0.5 text-xs font-bold', row.provider === 'gmail' ? 'bg-sky-100 text-sky-950' : 'bg-fairway-100 text-forest-900')}>
                              {row.provider === 'gmail' ? 'Gmail' : 'Resend'}
                            </span>
                          </td>
                          <td className="px-4 py-3">{row.template_id || '—'}</td>
                          <td className="px-4 py-3">{(row.attachment_names || []).join(', ') || '—'}</td>
                          <td className="px-4 py-3">{formatWhen(row.sent_at || row.created_at)}</td>
                          <td className="px-4 py-3 capitalize">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sentRows.length === 0 ? <p className="p-6 text-sm text-forest-600">No sent mail recorded yet.</p> : null}
                </div>
              )}
            </section>
          ) : null}

          {view === 'templates' ? (
            <section className="space-y-4">
              {templates.map((t) => (
                <article className="rounded-[1.5rem] border border-forest-100 bg-white p-5 shadow-soft" key={t.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-forest-950">{t.label}</h3>
                      <p className="text-sm text-forest-600">{t.blurb}</p>
                    </div>
                    <LuxuryButton
                      className="!px-4 !py-2 !text-xs"
                      onClick={() => setTemplateEdit(t)}
                      type="button"
                      variant="outlineOnLight"
                    >
                      Edit content
                    </LuxuryButton>
                  </div>
                  {templateEdit?.id === t.id ? (
                    <form
                      className="mt-4 space-y-3"
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (!accessToken || !templateEdit) return
                        setBusy('template')
                        void adminMailRequest(accessToken, {
                          action: 'save-template',
                          templateId: templateEdit.id,
                          heading: templateEdit.heading,
                          introduction: templateEdit.introduction,
                          body: templateEdit.body,
                          ctaLabel: templateEdit.ctaLabel,
                          ctaUrl: templateEdit.ctaUrl,
                          closing: templateEdit.closing
                        })
                          .then(() => {
                            setSentNotice('Template content saved. Branding stays in code.')
                            setTemplateEdit(null)
                            return loadTemplates()
                          })
                          .catch((error) => setStatusError(errorMessage(error, 'Unable to save the template.')))
                          .finally(() => setBusy(null))
                      }}
                    >
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        Heading
                        <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, heading: e.target.value })} value={templateEdit.heading} />
                      </label>
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        Introduction
                        <textarea className="mt-1 min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, introduction: e.target.value })} value={templateEdit.introduction} />
                      </label>
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        Body
                        <textarea className="mt-1 min-h-[140px] w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, body: e.target.value })} value={templateEdit.body} />
                      </label>
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        CTA label
                        <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, ctaLabel: e.target.value })} value={templateEdit.ctaLabel} />
                      </label>
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        CTA URL
                        <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, ctaUrl: e.target.value })} value={templateEdit.ctaUrl} />
                      </label>
                      <label className="block text-xs font-semibold uppercase text-forest-700">
                        Closing
                        <textarea className="mt-1 min-h-[70px] w-full rounded-xl border px-3 py-2 text-sm" onChange={(e) => setTemplateEdit({ ...templateEdit, closing: e.target.value })} value={templateEdit.closing} />
                      </label>
                      <div className="flex gap-2">
                        <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={busy === 'template'} type="submit">
                          Save content
                        </LuxuryButton>
                        <LuxuryButton className="!px-4 !py-2 !text-sm" onClick={() => setTemplateEdit(null)} type="button" variant="outline">
                          Cancel
                        </LuxuryButton>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-forest-700">{t.body}</p>
                  )}
                </article>
              ))}
            </section>
          ) : null}
        </div>
      </div>

      {previewHtml ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-forest-950/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="mail-preview-title">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Preview — not sent</p>
                <h3 className="font-display text-lg font-semibold text-forest-950" id="mail-preview-title">
                  {previewSubject}
                </h3>
              </div>
              <div className="flex gap-2">
                <button className={cx('rounded-full px-3 py-1 text-xs font-semibold', previewMode === 'desktop' ? 'bg-forest-900 text-white' : 'bg-forest-100')} onClick={() => setPreviewMode('desktop')} type="button">
                  Desktop
                </button>
                <button className={cx('rounded-full px-3 py-1 text-xs font-semibold', previewMode === 'mobile' ? 'bg-forest-900 text-white' : 'bg-forest-100')} onClick={() => setPreviewMode('mobile')} type="button">
                  Mobile
                </button>
                <button className="rounded-full px-3 py-1 text-xs font-semibold text-forest-800" onClick={() => setPreviewHtml(null)} type="button">
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto bg-forest-50 p-4">
              <iframe
                className={cx('mx-auto min-h-[520px] bg-white shadow', previewMode === 'mobile' ? 'w-[390px]' : 'w-full')}
                srcDoc={previewHtml}
                title="Email preview"
              />
              {attachments.length > 0 ? (
                <p className="mt-3 text-xs text-forest-700">Attachments: {attachments.map((a) => a.filename).join(', ')}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t px-5 py-4">
              <LuxuryButton className="!px-4 !py-2 !text-sm" onClick={() => setPreviewHtml(null)} type="button" variant="outline">
                Back to edit
              </LuxuryButton>
              <LuxuryButton className="!px-4 !py-2 !text-sm" disabled={!sendEnabled || busy === 'send'} onClick={() => void send('resend')} type="button">
                Send branded email
              </LuxuryButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
