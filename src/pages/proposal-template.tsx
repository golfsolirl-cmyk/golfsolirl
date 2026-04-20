import { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, CheckCircle2, MapPinned, CalendarRange, BedDouble, Bus, Users, Printer, Share2, LoaderCircle, Send } from 'lucide-react'
import { LuxuryButton } from '../components/ui/button'
import { Logo } from '../components/ui/logo'
import { integrationRegistry } from '../config/integrations'
import { buildProposalDocument, createProposalId, formatDocumentDate, parseNumberParam } from '../lib/document-templates'
import { useAuth } from '../providers/auth-provider'

function ProposalTemplatePage() {
  const { session } = useAuth()
  const [isSavingPdf, setIsSavingPdf] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [clientEmail, setClientEmail] = useState('')
  const [sendTitle, setSendTitle] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [sendMessage, setSendMessage] = useState<string | null>(null)
  const proposalCardRef = useRef<HTMLDivElement | null>(null)

  const isAdminProposal = useMemo(() => {
    const path = window.location.pathname.replace(/\/+$/, '')
    const params = new URLSearchParams(window.location.search)
    const variant = params.get('variant')

    if (path === '/proposal-template/admin' || path === '/package-proposal/admin') {
      return true
    }

    if (variant === 'admin' || variant === 'internal') {
      return true
    }

    return false
  }, [])

  const proposalPayload = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search)

    const hotelStarsRaw = searchParams.get('hotelStars')
    let hotelStars: number | null = null
    if (hotelStarsRaw != null && hotelStarsRaw !== '') {
      const n = Number(hotelStarsRaw)
      if (!Number.isNaN(n)) {
        hotelStars = n
      }
    }

    return {
      packageName: searchParams.get('package') ?? '________________________',
      stayName: searchParams.get('stayName') ?? '________________________',
      transferName: searchParams.get('transferName') ?? '________________________',
      proposalDate: searchParams.get('preparedDate') ?? formatDocumentDate(),
      proposalId: searchParams.get('proposalId') ?? createProposalId(),
      perPersonPrice: searchParams.get('perPersonPrice') ?? '________________',
      groupTotal: searchParams.get('groupTotal') ?? '________________',
      depositAmount: searchParams.get('depositAmount') ?? '________________',
      remainingBalance: searchParams.get('remainingBalance') ?? '________________',
      groupSize: parseNumberParam(searchParams.get('groupSize'), 4),
      nights: parseNumberParam(searchParams.get('nights'), 4),
      rounds: parseNumberParam(searchParams.get('rounds'), 3),
      courseName: searchParams.get('courseName') ?? '',
      hotelName: searchParams.get('hotelName') ?? '',
      hotelStars,
      hotelDist: searchParams.get('hotelDist') ?? '',
      variant: isAdminProposal ? 'admin' : 'public'
    }
  }, [isAdminProposal])

  const documentTemplate = useMemo(
    () =>
      buildProposalDocument({
        packageName: proposalPayload.packageName,
        stayName: proposalPayload.stayName,
        transferName: proposalPayload.transferName,
        proposalDate: proposalPayload.proposalDate,
        proposalId: proposalPayload.proposalId,
        perPersonPrice: proposalPayload.perPersonPrice,
        groupTotal: proposalPayload.groupTotal,
        depositAmount: proposalPayload.depositAmount,
        remainingBalance: proposalPayload.remainingBalance,
        groupSize: proposalPayload.groupSize,
        nights: proposalPayload.nights,
        rounds: proposalPayload.rounds,
        courseName: proposalPayload.courseName,
        hotelName: proposalPayload.hotelName,
        hotelStars: proposalPayload.hotelStars,
        hotelDist: proposalPayload.hotelDist,
        variant: proposalPayload.variant
      }),
    [proposalPayload]
  )

  const persistProposalPayload = useMemo(
    () => ({
      packageName: proposalPayload.packageName,
      stayName: proposalPayload.stayName,
      transferName: proposalPayload.transferName,
      proposalDate: proposalPayload.proposalDate,
      proposalId: proposalPayload.proposalId,
      perPersonPrice: proposalPayload.perPersonPrice,
      groupTotal: proposalPayload.groupTotal,
      depositAmount: proposalPayload.depositAmount,
      remainingBalance: proposalPayload.remainingBalance,
      groupSize: proposalPayload.groupSize,
      nights: proposalPayload.nights,
      rounds: proposalPayload.rounds,
      courseName: proposalPayload.courseName,
      hotelName: proposalPayload.hotelName,
      hotelStars: proposalPayload.hotelStars,
      hotelDist: proposalPayload.hotelDist
    }),
    [proposalPayload]
  )

  const handleSendToClient = async () => {
    if (!integrationRegistry.supabase.enabled) {
      setSendMessage('Sign-in is not configured.')
      setSendStatus('error')
      return
    }

    if (!session?.access_token) {
      setSendMessage('Sign in as admin to send this proposal.')
      setSendStatus('error')
      return
    }

    const trimmed = clientEmail.trim().toLowerCase()
    if (!trimmed.includes('@')) {
      setSendMessage('Enter the client account email (same as their login).')
      setSendStatus('error')
      return
    }

    try {
      setSendStatus('sending')
      setSendMessage(null)

      const res = await fetch('/api/send-proposal-to-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          clientEmail: trimmed,
          title: sendTitle.trim() || undefined,
          proposalPayload: persistProposalPayload
        })
      })

      const data = (await res.json().catch(() => ({}))) as { message?: string; proposalId?: string }

      if (!res.ok) {
        throw new Error(data.message || 'Send failed.')
      }

      setSendStatus('ok')
      setSendMessage(`Sent to ${trimmed}. Proposal ${data.proposalId ?? ''} is on their dashboard.`.trim())
    } catch (e) {
      setSendStatus('error')
      setSendMessage(e instanceof Error ? e.message : 'Unable to send.')
    }
  }

  const handleSavePdf = async () => {
    try {
      setIsSavingPdf(true)
      setActionMessage(null)

      const proposalNode = proposalCardRef.current

      if (!proposalNode) {
        throw new Error('Unable to find the proposal content to save.')
      }

      if (document.fonts?.ready) {
        await document.fonts.ready
      }

      const canvas = await html2canvas(proposalNode, {
        backgroundColor: '#ffffff',
        scale: Math.max(3, Math.min((window.devicePixelRatio || 1) * 2, 4)),
        useCORS: true,
        logging: false,
        width: proposalNode.scrollWidth,
        height: proposalNode.scrollHeight,
        ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore')
      })

      const imageData = canvas.toDataURL('image/png', 1)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageMargin = 10
      const renderWidth = pageWidth - pageMargin * 2
      const scaledPageHeightPx = (canvas.width * (pageHeight - pageMargin * 2)) / renderWidth
      const pageCanvas = document.createElement('canvas')
      const pageContext = pageCanvas.getContext('2d')

      if (!pageContext) {
        throw new Error('Unable to prepare the PDF canvas.')
      }

      pageCanvas.width = canvas.width

      let currentY = 0
      let pageIndex = 0

      while (currentY < canvas.height) {
        const remainingHeight = canvas.height - currentY
        const sliceHeight = Math.min(Math.floor(scaledPageHeightPx), remainingHeight)

        pageCanvas.height = sliceHeight
        pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
        pageContext.fillStyle = '#ffffff'
        pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        pageContext.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

        const pageImageData = pageCanvas.toDataURL('image/png', 1)
        const renderHeight = (sliceHeight * renderWidth) / canvas.width

        if (pageIndex > 0) {
          pdf.addPage()
        }

        pdf.addImage(pageImageData, 'PNG', pageMargin, pageMargin, renderWidth, renderHeight, undefined, 'FAST')

        currentY += sliceHeight
        pageIndex += 1
      }

      pdf.save(`${documentTemplate.meta.proposalId}.pdf`)

      setActionMessage('A4 PDF saved at readable scale.')
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to save the PDF right now.')
    } finally {
      setIsSavingPdf(false)
    }
  }

  const handlePrint = () => {
    setActionMessage(null)
    window.print()
  }

  const handleShare = async () => {
    try {
      setIsSharing(true)
      setActionMessage(null)

      const shareUrl = window.location.href
      const shareData = {
        title: `${documentTemplate.summary.title} | Golf Sol Ireland`,
        text: `View the ${documentTemplate.summary.title} package proposal.`,
        url: shareUrl
      }

      if (navigator.share) {
        await navigator.share(shareData)
        setActionMessage('Proposal shared.')
        return
      }

      if (!navigator.clipboard?.writeText) {
        throw new Error('Sharing is not supported in this browser.')
      }

      await navigator.clipboard.writeText(shareUrl)
      setActionMessage('Share link copied to clipboard.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setActionMessage(null)
        return
      }

      setActionMessage(error instanceof Error ? error.message : 'Unable to share this proposal right now.')
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#eef2eb] px-4 py-8 text-forest-900 md:px-8 pdf-page-shell">
      <div className="mx-auto mb-6 max-w-[1100px] pdf-screen-only" data-html2canvas-ignore="true">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              aria-label="Save proposal as PDF"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSavingPdf}
              onClick={handleSavePdf}
              type="button"
            >
              {isSavingPdf ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
              {isSavingPdf ? 'Saving PDF...' : 'Save PDF'}
            </button>

            <button
              aria-label="Print proposal"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-3 text-sm font-semibold text-forest-900 transition-colors hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef2eb]"
              onClick={handlePrint}
              type="button"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
            </button>

            <button
              aria-label="Share proposal"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-forest-200 bg-white px-5 py-3 text-sm font-semibold text-forest-900 transition-colors hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#eef2eb] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSharing}
              onClick={handleShare}
              type="button"
            >
              {isSharing ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            {isAdminProposal ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-forest-900/45">Internal worksheet</p>
            ) : null}
            {actionMessage ? (
              <p aria-live="polite" className="text-sm text-forest-900/68">
                {actionMessage}
              </p>
            ) : null}
          </div>
        </div>

        {isAdminProposal ? (
          <div
            className="mt-6 rounded-[1.75rem] border border-forest-200 bg-white p-5 shadow-sm md:p-6"
            data-html2canvas-ignore="true"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Send to client</p>
            <p className="mt-2 text-sm text-forest-600">
              Emails the PDF, saves a <strong className="font-semibold text-forest-800">sent</strong> proposal row linked to
              the client&apos;s account (they need an existing login). Uses the same PDF as{' '}
              <span className="font-medium text-forest-800">/api/proposal-pdf</span>.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-500" htmlFor="send-client-email">
                  Client account email
                </label>
                <input
                  autoComplete="email"
                  className="w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                  id="send-client-email"
                  onChange={(e) => {
                    setClientEmail(e.target.value)
                    setSendStatus('idle')
                    setSendMessage(null)
                  }}
                  placeholder="client@example.com"
                  type="email"
                  value={clientEmail}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-forest-500" htmlFor="send-proposal-title">
                  Dashboard title (optional)
                </label>
                <input
                  className="w-full rounded-2xl border border-forest-200 bg-white px-4 py-3 text-sm text-forest-900 outline-none focus:border-fairway-500 focus:ring-2 focus:ring-fairway-200/60"
                  id="send-proposal-title"
                  onChange={(e) => {
                    setSendTitle(e.target.value)
                    setSendStatus('idle')
                    setSendMessage(null)
                  }}
                  placeholder="e.g. Costa del Sol — April 2026"
                  type="text"
                  value={sendTitle}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                aria-label="Send proposal PDF to client email"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#dc5801] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c24f01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:cursor-not-allowed disabled:opacity-65"
                disabled={sendStatus === 'sending'}
                onClick={handleSendToClient}
                type="button"
              >
                {sendStatus === 'sending' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                {sendStatus === 'sending' ? 'Sending…' : 'Email PDF & add to client dashboard'}
              </button>
              {sendMessage ? (
                <p
                  className={`text-sm font-medium ${sendStatus === 'error' ? 'text-red-700' : 'text-forest-800'}`}
                  role={sendStatus === 'error' ? 'alert' : 'status'}
                >
                  {sendMessage}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div ref={proposalCardRef} className="mx-auto max-w-[1100px] overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-[0_22px_70px_rgba(10,32,8,0.12)] print:shadow-none">
        <div className="relative overflow-hidden bg-forest-950 px-8 py-8 text-white md:px-10">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(80,163,45,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(220,88,1,0.14),transparent_20%)]" />
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <Logo tone="scrolled" />
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">{documentTemplate.hero.kicker}</p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                {documentTemplate.hero.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72">
                {documentTemplate.hero.description}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white/8 px-5 py-4 text-sm text-white/74">
              <p>{documentTemplate.hero.metaCard[0]}</p>
              <p className="mt-2">{documentTemplate.hero.metaCard[1]}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-8 py-8 md:px-10 md:py-10">
          <section className="grid gap-6 md:grid-cols-2">
            {documentTemplate.infoCards.slice(0, 2).map((card) => (
              <InfoCard key={card.title} icon={iconMap[card.icon]} title={card.title} items={card.items} />
            ))}
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            {documentTemplate.infoCards.slice(2).map((card) => (
              <InfoCard key={card.title} icon={iconMap[card.icon]} title={card.title} items={card.items} />
            ))}
          </section>

          <section className="rounded-[1.8rem] border border-forest-100 bg-[linear-gradient(135deg,#f7f9f5,#ffffff)] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-500">{documentTemplate.summary.kicker}</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-forest-900">{documentTemplate.summary.title}</h2>
              </div>
              <p className="text-sm text-forest-900/54">{documentTemplate.summary.aside}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {documentTemplate.summary.topTiles.map((tile) => (
                <PriceTile key={tile.label} label={tile.label} value={tile.value} />
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {documentTemplate.summary.bottomTiles.map((tile) => (
                <PriceTile key={tile.label} label={tile.label} value={tile.value} />
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-forest-100 bg-white p-5">
              <p className="text-sm font-semibold text-forest-900">{documentTemplate.summary.notesTitle}</p>
              <div className="mt-4 grid gap-3 text-sm text-forest-900/68 md:grid-cols-2">
                {documentTemplate.summary.noteLines.map((line) => (
                  <BlankLine key={line} label={line} />
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.8rem] border border-forest-100 bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-500">{documentTemplate.lower.left.kicker}</p>
              <div className="mt-5 space-y-4">
                {documentTemplate.lower.left.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-forest-900/72">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 text-sm text-forest-900/68">
                {documentTemplate.lower.left.noteLines.map((line) => (
                  <BlankLine key={line} label={line} />
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-forest-100 bg-forest-950 p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-300">{documentTemplate.lower.right.kicker}</p>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/76">
                {documentTemplate.lower.right.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-white/6 p-5">
                <p className="text-sm font-semibold text-white">{documentTemplate.lower.right.signoffTitle}</p>
                <div className="mt-4 space-y-3 text-sm text-white/74">
                  {documentTemplate.lower.right.signoffLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {documentTemplate.messageBlock ? (
            <section className="rounded-[1.8rem] border border-dashed border-gold-300/70 bg-gold-50/40 p-6">
              <div className="flex items-start gap-3">
                <BedDouble className="mt-1 h-5 w-5 shrink-0 text-gold-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-forest-900">{documentTemplate.messageBlock.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-900/68">{documentTemplate.messageBlock.body}</p>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-[1.8rem] border border-[#dc5801]/25 bg-[linear-gradient(135deg,rgba(220,88,1,0.08),rgba(255,255,255,0.94))] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#dc5801]">{documentTemplate.disclaimer.title}</p>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-forest-900/72">
              {documentTemplate.disclaimer.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-[1100px] justify-center gap-3 pdf-screen-only" data-html2canvas-ignore="true">
        <LuxuryButton href="/packages" variant="white">
          Back to packages
        </LuxuryButton>
      </div>
    </div>
  )
}

const iconMap = {
  users: Users,
  calendar: CalendarRange,
  map: MapPinned,
  bus: Bus
} as const

function InfoCard({
  icon: Icon,
  title,
  items
}: {
  readonly icon: typeof Users
  readonly title: string
  readonly items: readonly string[]
}) {
  return (
    <div className="rounded-[1.8rem] border border-forest-100 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-forest-900 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-forest-900">{title}</p>
      </div>
      <div className="mt-5 space-y-3 text-sm text-forest-900/68">
        {items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  )
}

function PriceTile({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-forest-100 bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500">{label}</p>
      <p className="mt-3 font-display text-3xl font-bold text-forest-900">{value}</p>
    </div>
  )
}

function BlankLine({
  label,
  dark = false
}: {
  readonly label: string
  readonly dark?: boolean
}) {
  return (
    <div>
      <p className={dark ? 'text-white/55' : 'text-forest-900/52'}>{label}</p>
      <div className={dark ? 'mt-2 h-px w-full bg-white/28' : 'mt-2 h-px w-full bg-forest-900/18'} />
    </div>
  )
}

export { ProposalTemplatePage }
