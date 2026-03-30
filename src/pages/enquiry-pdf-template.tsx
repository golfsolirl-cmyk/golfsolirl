import { Download, CheckCircle2, MapPinned, CalendarRange, BedDouble, Bus, Users } from 'lucide-react'
import { LuxuryButton } from '../components/ui/button'
import { Logo } from '../components/ui/logo'
import { buildEnquiryDocument, createEnquiryReferenceId, formatDocumentDate } from '../lib/document-templates'

function EnquiryPdfTemplatePage() {
  const searchParams = new URLSearchParams(window.location.search)
  const fullName = searchParams.get('fullName') ?? '________________________'
  const email = searchParams.get('email') ?? '________________________'
  const tripInterest = searchParams.get('interest') ?? '________________________'
  const phoneWhatsApp = searchParams.get('phoneWhatsApp') ?? '________________________'
  const bestTimeToCall = searchParams.get('bestTimeToCall') ?? '________________________'
  const enquiryDate = searchParams.get('enquiryDate') ?? formatDocumentDate()
  const enquiryId = searchParams.get('enquiryId') ?? createEnquiryReferenceId()
  const documentTemplate = buildEnquiryDocument({
    fullName,
    email,
    interest: tripInterest,
    phoneWhatsApp,
    bestTimeToCall,
    enquiryDate,
    enquiryId
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#eef2eb] px-4 py-8 text-forest-900 md:px-8 pdf-page-shell">
      <div className="mx-auto mb-6 flex max-w-[1100px] justify-end pdf-screen-only">
        <button
          className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800"
          onClick={handlePrint}
          type="button"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Print / Save PDF
        </button>
      </div>

      <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[2rem] border border-forest-100 bg-white shadow-[0_22px_70px_rgba(10,32,8,0.12)] print:shadow-none">
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
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fairway-600" aria-hidden="true" />
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

            <div className="rounded-[1.8rem] bg-forest-950 p-6 text-white">
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

      <div className="mx-auto mt-6 flex max-w-[1100px] justify-center gap-3 pdf-screen-only">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-fairway-50 text-fairway-700">
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

export { EnquiryPdfTemplatePage }
