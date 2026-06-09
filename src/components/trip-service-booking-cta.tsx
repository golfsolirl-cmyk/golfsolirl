import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Building2, PlaneLanding, Trophy, X } from 'lucide-react'
import { COURSES } from '../data/coastal-golf-data'
import { WEBSITE_ENQUIRY_FORM } from '../lib/enquiry-form-registry'
import { AUTH_NEXT_STORAGE_KEY } from '../lib/internal-redirect'
import { persistPortalTripWorkspace, persistPortalTripWorkspaceViaApi } from '../lib/persist-portal-trip-workspace'
import { ENQUIRY_CONFLICT_EXISTING_PHONE, postWebsiteEnquiry } from '../lib/post-enquiry-client'
import {
  PORTAL_ADD_ON_ICON_STROKE,
  portalAddOnPremiumIcon,
  portalAddOnPremiumTileClass
} from '../lib/portal-add-on-premium-icons'
import {
  buildServiceCtaEnquiryFields,
  emptyServiceCtaDraft,
  loadServiceCtaDraft,
  persistServiceCtaAsTripDraft,
  saveServiceCtaDraft,
  serviceCtaInterestSummary,
  serviceCtaToTripWorkspace,
  SERVICE_CTA_PRIMARY_LABELS,
  type ServiceCtaDraft,
  type ServiceCtaPrimary,
  type ServiceCtaStages
} from '../lib/service-cta-draft'
import { TERMS_ACCEPTANCE_ERROR, termsAcceptanceFormFields } from '../lib/terms-acceptance'
import { plannedTravelDatesErrorMessage, travelEndMinIso, travelStartMinIso } from '../lib/travel-date-bounds'
import { cx } from '../lib/utils'
import { useAuth } from '../providers/auth-provider'
import { GeButton } from '../pages/golf-experience/components/ge-button'
import { GeTermsAcceptanceField } from '../pages/golf-experience/components/ge-terms-acceptance-field'

const labelClass =
  'mb-2 block font-ge text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ge-gray500 sm:text-[0.72rem] sm:tracking-[0.14em]'
const inputClass =
  'min-h-[48px] w-full rounded-xl border border-ge-gray200 bg-white px-3.5 font-ge text-base text-gs-dark outline-none transition-shadow placeholder:text-ge-gray300 focus:border-brand-700 focus:ring-2 focus:ring-brand-700/25 sm:text-sm'

const STAGE_OPTIONS: readonly { key: keyof ServiceCtaStages; label: string; hint: string }[] = [
  { key: 'transfer', label: 'Transfers', hint: 'Málaga AGP · hotels · courses' },
  { key: 'golf', label: 'Golf courses', hint: 'Tee times & rounds' },
  { key: 'accommodation', label: 'Accommodation', hint: 'Hotels & villas' }
]

export type TripServiceBookingCtaVariant = 'band' | 'inline' | 'dark'

export type TripServiceBookingCtaProps = {
  readonly pageLabel: string
  readonly variant?: TripServiceBookingCtaVariant
  readonly className?: string
  readonly id?: string
  readonly sectionTitle?: string
  readonly sectionLead?: string
}

function stageIcon(key: keyof ServiceCtaStages) {
  if (key === 'transfer') {
    return PlaneLanding
  }
  if (key === 'golf') {
    return Trophy
  }
  return Building2
}

export function TripServiceBookingCta({
  pageLabel,
  variant = 'band',
  className,
  id = 'trip-service-cta',
  sectionTitle = 'Transfers · Golf · Hotels',
  sectionLead = 'Book what you need — add transfers, golf, or accommodation in one request. Everything is saved to your profile when you sign in.'
}: TripServiceBookingCtaProps) {
  const formId = useId()
  const { session, profile, isLoading: authLoading } = useAuth()
  const [draft, setDraft] = useState<ServiceCtaDraft>(() => loadServiceCtaDraft() ?? emptyServiceCtaDraft('transfer', pageLabel))
  const [modalOpen, setModalOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [savedReferenceId, setSavedReferenceId] = useState<string | null>(null)
  const confirmationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = loadServiceCtaDraft()
    if (stored) {
      setDraft(stored)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && session?.user) {
      const mail = (profile?.email ?? session.user.email ?? '').trim()
      const phone = (profile?.phone ?? '').trim()
      const name = (profile?.full_name ?? '').trim()
      setDraft((prev) => {
        let next = prev
        if (!prev.email.trim() && mail) {
          next = { ...next, email: mail }
        }
        if (!prev.phoneWhatsApp.trim() && phone) {
          next = { ...next, phoneWhatsApp: phone }
        }
        if (!prev.fullName.trim() && name) {
          next = { ...next, fullName: name }
        }
        return next
      })
    }
  }, [authLoading, profile?.email, profile?.full_name, profile?.phone, session?.user, session?.user?.email])

  useEffect(() => {
    if (status === 'success') {
      confirmationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [status])

  useEffect(() => {
    if (!modalOpen) {
      return
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [modalOpen])

  const persistDraft = useCallback(
    (next: ServiceCtaDraft) => {
      const withMeta = { ...next, pageLabel, updatedAt: new Date().toISOString() }
      setDraft(withMeta)
      saveServiceCtaDraft(withMeta)
    },
    [pageLabel]
  )

  const openForPrimary = (primary: ServiceCtaPrimary) => {
    const stored = loadServiceCtaDraft()
    const base = stored ?? draft
    persistDraft({
      ...base,
      primary,
      stages: {
        transfer: primary === 'transfer' || base.stages.transfer,
        golf: primary === 'golf' || base.stages.golf,
        accommodation: primary === 'accommodation' || base.stages.accommodation
      }
    })
    setStatus('idle')
    setErrorMessage(null)
    setErrorCode(null)
    setTermsAccepted(false)
    setSavedReferenceId(null)
    setModalOpen(true)
  }

  const handleStageToggle = (key: keyof ServiceCtaStages) => {
    persistDraft({
      ...draft,
      stages: { ...draft.stages, [key]: !draft.stages[key] }
    })
  }

  const buildLoginHref = (referenceId?: string) => {
    const next = referenceId
      ? `/dashboard?enquiry_ref=${encodeURIComponent(referenceId)}`
      : '/dashboard'
    return `/dashboard/login?next=${encodeURIComponent(next)}`
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('idle')
    setErrorMessage(null)
    setErrorCode(null)

    const name = draft.fullName.trim()
    const mail = draft.email.trim().toLowerCase()
    const phone = draft.phoneWhatsApp.trim()

    if (!name || !mail || !phone) {
      setErrorMessage('Please add your name, email, and phone/WhatsApp.')
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      setErrorMessage('Please enter a valid email address.')
      setStatus('error')
      return
    }
    if (!draft.stages.transfer && !draft.stages.golf && !draft.stages.accommodation) {
      setErrorMessage('Select at least one service — transfer, golf, or accommodation.')
      setStatus('error')
      return
    }

    const df = draft.travelDateFrom.trim().slice(0, 10)
    const dt = draft.travelDateTo.trim().slice(0, 10)
    if (df && dt) {
      const plannedErr = plannedTravelDatesErrorMessage(df, dt)
      if (plannedErr) {
        setErrorMessage(plannedErr)
        setStatus('error')
        return
      }
    } else if (df || dt) {
      setErrorMessage('Add both travel start and end dates, or leave both blank for now.')
      setStatus('error')
      return
    }

    if (!termsAccepted) {
      setErrorMessage(TERMS_ACCEPTANCE_ERROR)
      setStatus('error')
      return
    }

    setStatus('submitting')

    const workspace = serviceCtaToTripWorkspace(draft, 'GSI-PENDING')
    const fields = buildServiceCtaEnquiryFields(draft, workspace)

    const result = await postWebsiteEnquiry({
      fullName: name,
      email: mail,
      phoneWhatsApp: phone,
      interest: serviceCtaInterestSummary(draft),
      bestTimeToCall: draft.bestTimeToCall.trim() || 'Any time',
      formPayload: {
        form: WEBSITE_ENQUIRY_FORM.tripServiceCta,
        fields
      },
      ...termsAcceptanceFormFields()
    })

    if (!result.ok) {
      setErrorMessage(result.message)
      setErrorCode(result.code ?? null)
      setStatus('error')
      return
    }

    const referenceId = result.referenceId ?? null
    if (referenceId) {
      setSavedReferenceId(referenceId)
      persistServiceCtaAsTripDraft(draft, referenceId)
      try {
        sessionStorage.setItem(AUTH_NEXT_STORAGE_KEY, `/dashboard?enquiry_ref=${encodeURIComponent(referenceId)}`)
      } catch {
        /* private mode */
      }
    }

    if (session?.user && session.access_token) {
      const tripDraft = referenceId ? persistServiceCtaAsTripDraft(draft, referenceId) : workspace
      const direct = await persistPortalTripWorkspace(session, tripDraft)
      if (!direct.ok) {
        await persistPortalTripWorkspaceViaApi(session.access_token, tripDraft)
      }
    }

    setStatus('success')
    setModalOpen(false)
  }

  const isDark = variant === 'dark'
  const shellClass = cx(
    'relative overflow-hidden rounded-2xl border sm:rounded-[1.75rem]',
    isDark
      ? 'border-white/12 bg-gs-dark text-white shadow-[0_24px_60px_rgba(6,32,22,0.28)]'
      : 'border-forest-800/12 bg-gradient-to-b from-[#f3efe6] via-[#faf8f3] to-cream shadow-[0_16px_48px_rgba(6,32,22,0.1)]',
    className
  )

  const ctaGridClass =
    variant === 'inline'
      ? 'mt-5 flex flex-col gap-3 sm:mt-6 sm:grid sm:grid-cols-2 lg:grid-cols-3'
      : 'mt-5 flex flex-col gap-3 sm:mt-6 sm:grid sm:grid-cols-2 lg:grid-cols-3'

  return (
    <>
      <section id={id} aria-labelledby={`${id}-title`} className={shellClass}>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-300/15 blur-3xl"
        />
        <div className="relative px-4 py-6 sm:px-8 sm:py-8">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-5">
            <span
              aria-hidden
              className="h-px w-8 shrink-0 bg-gradient-to-r from-[#d4a843] to-forest-800/50 sm:w-12"
            />
            <h2
              id={`${id}-title`}
              className={cx(
                'min-w-0 font-ge text-[0.78rem] font-extrabold uppercase leading-snug tracking-[0.14em] sm:text-[0.72rem] sm:tracking-[0.2em]',
                isDark ? 'text-[#d4a843]' : 'text-forest-950'
              )}
            >
              {sectionTitle}
            </h2>
          </div>

          <p
            className={cx(
              'max-w-2xl font-ge text-[1.05rem] leading-[1.65] sm:text-base sm:leading-8',
              isDark ? 'text-white/88' : 'text-forest-800'
            )}
          >
            {sectionLead}
          </p>

          <div className={ctaGridClass}>
            <CtaTile
              primary="transfer"
              title="Book a transfer"
              subtitle="Málaga AGP · executive cars"
              onClick={() => openForPrimary('transfer')}
              isDark={isDark}
            />
            <CtaTile
              primary="golf"
              title="Book a golf course"
              subtitle="Tee times · Irish groups"
              onClick={() => openForPrimary('golf')}
              isDark={isDark}
            />
            <CtaTile
              primary="accommodation"
              title="Add accommodation"
              subtitle="Hotels · optional with golf or transfers"
              onClick={() => openForPrimary('accommodation')}
              isDark={isDark}
              className={variant === 'inline' ? 'sm:col-span-2 lg:col-span-1' : undefined}
            />
          </div>

          {status === 'success' ? (
            <div
              ref={confirmationRef}
              className={cx(
                'mt-5 rounded-xl border px-4 py-4 font-ge text-[0.98rem] leading-7 sm:mt-6 sm:text-sm',
                isDark ? 'border-[#d4a843]/35 bg-forest-950 text-white/90' : 'border-brand-700/25 bg-white text-forest-900'
              )}
              role="status"
            >
              <p className="font-semibold text-brand-700">Request saved.</p>
              <p className="mt-1">
                {session
                  ? 'Your trip preferences are on your dashboard — we will follow up by email.'
                  : 'Check your inbox for confirmation. Sign in with the same email to see everything on your dashboard.'}
              </p>
              {!session ? (
                <p className="mt-3">
                  <a className="font-semibold text-brand-700 underline underline-offset-4" href={buildLoginHref(savedReferenceId ?? undefined)}>
                    Sign in to view your saved trip
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {modalOpen && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-forest-950/65 p-3 sm:p-5"
              role="presentation"
              onClick={() => setModalOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${formId}-title`}
                className="flex h-[min(92dvh,42rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-ge-gray200 bg-white shadow-[0_28px_80px_rgba(6,32,22,0.4)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-ge-gray200/80 bg-white px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
                  <div className="min-w-0 flex-1 pr-1">
                    <p className="font-ge text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-brand-600 sm:tracking-[0.16em]">
                      {SERVICE_CTA_PRIMARY_LABELS[draft.primary]} request
                    </p>
                    <h3
                      id={`${formId}-title`}
                      className="mt-1.5 font-ge text-[1.25rem] font-extrabold leading-snug text-gs-dark sm:text-xl"
                    >
                      Tell us what you need
                    </h3>
                    <p className="mt-1.5 font-ge text-[0.92rem] leading-relaxed text-ge-gray500 sm:text-sm">
                      Tick any extras — golf or accommodation with a transfer, and vice versa.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ge-gray200 text-ge-gray500 transition-colors hover:bg-ge-gray50 active:bg-ge-gray100"
                    aria-label="Close"
                    onClick={() => setModalOpen(false)}
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
                  <form id={`${formId}-form`} className="space-y-5" noValidate onSubmit={(e) => void handleSubmit(e)}>
              <fieldset>
                <legend className="mb-3 font-ge text-[0.95rem] font-bold text-gs-dark sm:text-sm">Also include</legend>
                <div className="flex flex-col gap-2.5 sm:grid sm:grid-cols-3 sm:gap-2">
                  {STAGE_OPTIONS.map(({ key, label, hint }) => {
                    const Icon = stageIcon(key)
                    const active = draft.stages[key]
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => handleStageToggle(key)}
                        className={cx(
                          'flex min-h-[52px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all sm:block sm:min-h-0',
                          active
                            ? 'border-brand-700 bg-brand-700/8 shadow-sm'
                            : 'border-ge-gray200 bg-white hover:border-brand-700/30 active:bg-ge-gray50'
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-brand-700 sm:h-4 sm:w-4" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
                        <span className="min-w-0 flex-1 sm:mt-2 sm:block">
                          <span className="block font-ge text-[0.98rem] font-bold text-gs-dark sm:text-sm">{label}</span>
                          <span className="mt-0.5 block font-ge text-xs leading-snug text-ge-gray500 sm:text-[0.68rem]">{hint}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor={`${formId}-name`}>
                    Full name
                  </label>
                  <input
                    id={`${formId}-name`}
                    className={inputClass}
                    value={draft.fullName}
                    onChange={(e) => persistDraft({ ...draft, fullName: e.target.value })}
                    autoComplete="name"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-email`}>
                    Email
                  </label>
                  <input
                    id={`${formId}-email`}
                    type="email"
                    className={inputClass}
                    value={draft.email}
                    onChange={(e) => persistDraft({ ...draft, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-phone`}>
                    Phone / WhatsApp
                  </label>
                  <input
                    id={`${formId}-phone`}
                    type="tel"
                    className={inputClass}
                    value={draft.phoneWhatsApp}
                    onChange={(e) => persistDraft({ ...draft, phoneWhatsApp: e.target.value })}
                    autoComplete="tel"
                    required
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-party`}>
                    Group size
                  </label>
                  <select
                    id={`${formId}-party`}
                    className={inputClass}
                    value={draft.partySize}
                    onChange={(e) => persistDraft({ ...draft, partySize: Number(e.target.value) })}
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} golfer{n > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-best-time`}>
                    Best time to call
                  </label>
                  <input
                    id={`${formId}-best-time`}
                    className={inputClass}
                    value={draft.bestTimeToCall}
                    onChange={(e) => persistDraft({ ...draft, bestTimeToCall: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-from`}>
                    Travel from (optional)
                  </label>
                  <input
                    id={`${formId}-from`}
                    type="date"
                    className={inputClass}
                    min={travelStartMinIso()}
                    value={draft.travelDateFrom.slice(0, 10)}
                    onChange={(e) => persistDraft({ ...draft, travelDateFrom: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`${formId}-to`}>
                    Travel to (optional)
                  </label>
                  <input
                    id={`${formId}-to`}
                    type="date"
                    className={inputClass}
                    min={draft.travelDateFrom.trim() ? travelEndMinIso(draft.travelDateFrom.slice(0, 10)) : travelStartMinIso()}
                    value={draft.travelDateTo.slice(0, 10)}
                    onChange={(e) => persistDraft({ ...draft, travelDateTo: e.target.value })}
                  />
                </div>
              </div>

              {draft.stages.transfer ? (
                <div>
                  <label className={labelClass} htmlFor={`${formId}-transfer-notes`}>
                    Transfer details (optional)
                  </label>
                  <textarea
                    id={`${formId}-transfer-notes`}
                    rows={3}
                    className={cx(inputClass, 'h-auto min-h-[5.5rem] resize-y py-2.5')}
                    placeholder="Flight arrival time, hotel, golf bag count, preferred vehicle…"
                    value={draft.transferNotes}
                    onChange={(e) => persistDraft({ ...draft, transferNotes: e.target.value })}
                  />
                </div>
              ) : null}

              {draft.stages.golf ? (
                <fieldset>
                  <legend className={labelClass}>Preferred courses (optional)</legend>
                  <ul className="max-h-52 space-y-2 overflow-y-auto overscroll-contain rounded-xl border border-ge-gray200 bg-ge-gray50/50 p-2 sm:max-h-60">
                    {COURSES.map((course) => {
                      const checked = draft.golfCourseIds.includes(course.id)
                      const courseInputId = `${formId}-course-${course.id}`
                      return (
                        <li key={course.id}>
                          <label
                            htmlFor={courseInputId}
                            className={cx(
                              'flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                              checked
                                ? 'border-brand-700/40 bg-white shadow-sm'
                                : 'border-transparent bg-white/80 active:bg-white'
                            )}
                          >
                            <input
                              id={courseInputId}
                              type="checkbox"
                              checked={checked}
                              className="h-5 w-5 shrink-0 rounded border-ge-gray300 text-brand-700 focus:ring-brand-700/30"
                              onChange={() => {
                                const next = checked
                                  ? draft.golfCourseIds.filter((id) => id !== course.id)
                                  : [...draft.golfCourseIds, course.id]
                                persistDraft({ ...draft, golfCourseIds: next })
                              }}
                            />
                            <span className="min-w-0 font-ge text-[0.95rem] leading-snug text-gs-dark sm:text-sm">
                              <span className="font-semibold">{course.name}</span>
                              <span className="text-ge-gray500"> · {course.region}</span>
                            </span>
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                </fieldset>
              ) : null}

              {draft.stages.accommodation ? (
                <div>
                  <label className={labelClass} htmlFor={`${formId}-hotel-notes`}>
                    Accommodation notes (optional)
                  </label>
                  <textarea
                    id={`${formId}-hotel-notes`}
                    rows={3}
                    className={cx(inputClass, 'h-auto min-h-[5.5rem] resize-y py-2.5')}
                    placeholder="Area, star rating, twin rooms, pool, walking distance to course…"
                    value={draft.accommodationNotes}
                    onChange={(e) => persistDraft({ ...draft, accommodationNotes: e.target.value })}
                  />
                </div>
              ) : null}

              <GeTermsAcceptanceField checked={termsAccepted} onChange={setTermsAccepted} id={`${formId}-terms`} />

              {errorMessage ? (
                <p className="font-ge text-[0.95rem] font-semibold leading-relaxed text-red-700 sm:text-sm" role="alert">
                  {errorMessage}
                  {errorCode === ENQUIRY_CONFLICT_EXISTING_PHONE ? (
                    <>
                      {' '}
                      <a className="underline underline-offset-2" href={buildLoginHref()}>
                        Sign in to continue
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
                  </form>
                </div>

                <div className="shrink-0 border-t border-ge-gray200/80 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <GeButton
                      className="w-full sm:w-auto"
                      disabled={status === 'submitting'}
                      form={`${formId}-form`}
                      size="md"
                      type="submit"
                      variant="gs-green"
                    >
                      {status === 'submitting' ? 'Saving…' : session ? 'Save to my profile' : 'Send & save for sign-in'}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </GeButton>
                    {session ? (
                      <GeButton className="w-full sm:w-auto" href="/dashboard" size="md" variant="outline-gs-green">
                        My dashboard
                      </GeButton>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

function CtaTile({
  primary,
  title,
  subtitle,
  onClick,
  isDark,
  className
}: {
  readonly primary: ServiceCtaPrimary
  readonly title: string
  readonly subtitle: string
  readonly onClick: () => void
  readonly isDark: boolean
  readonly className?: string
}) {
  const category = primary === 'transfer' ? 'transfers' : primary === 'golf' ? 'golf_courses' : 'hotels'
  const Icon = portalAddOnPremiumIcon(category)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'group relative flex w-full min-h-[4.75rem] items-center gap-3.5 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300',
        'active:scale-[0.99] sm:min-h-[5.75rem] sm:flex-col sm:items-start sm:justify-between sm:gap-0',
        'sm:hover:-translate-y-0.5 sm:hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2',
        isDark
          ? 'ge-on-dark border-white/12 bg-gradient-to-br from-forest-900 via-gs-green to-forest-950 text-white'
          : 'border-forest-800/15 bg-gradient-to-b from-white to-[#f5f1e8] text-gs-dark shadow-[0_10px_28px_rgba(6,32,22,0.09)]',
        className
      )}
    >
      <span
        className={cx(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11',
          isDark ? portalAddOnPremiumTileClass(category) : 'bg-gradient-to-br from-forest-800 to-brand-700 text-white shadow-md'
        )}
      >
        <Icon className="h-5 w-5 text-white" strokeWidth={PORTAL_ADD_ON_ICON_STROKE} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 sm:mt-3 sm:w-full">
        <span className="block font-ge text-[1.02rem] font-extrabold leading-snug tracking-tight sm:text-lg">{title}</span>
        <span
          className={cx(
            'mt-1 block font-ge text-[0.72rem] font-medium leading-snug sm:mt-0.5 sm:text-xs sm:uppercase sm:tracking-[0.12em]',
            isDark ? 'text-white/78 sm:text-white/75' : 'text-ge-gray500'
          )}
        >
          {subtitle}
        </span>
      </span>
      <ArrowRight
        className={cx(
          'h-5 w-5 shrink-0 transition-transform group-active:translate-x-0.5 sm:mt-1 sm:h-4 sm:w-4 sm:self-start sm:group-hover:translate-x-0.5',
          isDark ? 'text-white/70' : 'text-brand-700'
        )}
        aria-hidden
      />
    </button>
  )
}
