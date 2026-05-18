import { MapPin } from 'lucide-react'
import { GeButton } from '../pages/golf-experience/components/ge-button'

const lab = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_ENABLE_TRANSFER_LAB === '1'

export function PortalCostaTransfersStub({ variant = 'client' }: { readonly variant?: 'client' | 'admin' }) {
  const isAdmin = variant === 'admin'
  return (
    <section
      className="mt-10 rounded-3xl border-2 border-dashed border-gs-green/35 bg-gs-green/[0.04] p-8 shadow-inner sm:p-10"
      aria-labelledby="portal-costa-transfers-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 font-ge text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-gs-green">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {isAdmin ? 'Transfer operations' : 'Costa del Sol transfers'}
          </p>
          <h2 id="portal-costa-transfers-heading" className="mt-3 font-ge text-2xl font-extrabold text-gs-dark">
            {isAdmin ? 'Driver allocation & live jobs' : 'Request a transfer on the Sol'}
          </h2>
          <p className="mt-3 max-w-2xl font-ge text-sm leading-relaxed text-ge-gray500">
            {isAdmin
              ? 'Assign drivers, watch pickup and drop-off checkpoints, publish guest reviews to the homepage, and trigger branded emails — controls appear in this panel as the pipeline goes live.'
              : 'Pick-up anywhere on the Costa del Sol to any destination on the coast — live driver tracking, job updates, and trip ratings are rolling out here next.'}
          </p>
        </div>
        <GeButton className="shrink-0" href="/contact" size="md" variant="gs-green">
          {isAdmin ? 'Contact ops' : 'Get a transfer quote'}
        </GeButton>
      </div>
      {lab ? (
        <p className="mt-6 font-mono text-xs text-brand-800">Transfer lab enabled (VITE_ENABLE_TRANSFER_LAB=1)</p>
      ) : (
        <p className="mt-6 font-ge text-xs font-semibold text-ge-gray500">Booking tools unlock after your next deploy.</p>
      )}
    </section>
  )
}
