import { motion } from 'framer-motion'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import { cx } from '../../../lib/utils'
import { buildWhatsAppHref, type WhatsAppQuickAction } from '../lib/whatsapp'

interface SmartWhatsAppButtonsProps {
  readonly title: string
  readonly body: string
  readonly actions: readonly WhatsAppQuickAction[]
  readonly className?: string
}

export function SmartWhatsAppButtons({
  title,
  body,
  actions,
  className
}: SmartWhatsAppButtonsProps) {
  return (
    <div className={className}>
      <div
        className={cx(
          'rounded-[1.75rem] border border-gs-dark/10 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,248,1)_100%)] p-5 shadow-[0_24px_60px_rgba(6,59,42,0.12)] sm:p-6'
        )}
      >
        <div className="flex items-start gap-3">
          <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gs-green text-white shadow-[0_14px_32px_rgba(6,59,42,0.2)]">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="font-ge text-[0.78rem] font-bold uppercase tracking-[0.16em] text-ge-orange">
              Smart WhatsApp prompts
            </p>
            <h3 className="mt-2 font-ge text-[1.45rem] font-extrabold leading-tight text-gs-green sm:text-[1.65rem]">
              {title}
            </h3>
          </div>
        </div>

        <p className="mt-4 font-ge text-[1rem] leading-7 text-ge-gray500">{body}</p>

        <div className="mt-5 grid gap-3">
          {actions.map((action, index) => (
            <motion.a
              key={action.label}
              href={buildWhatsAppHref(action.message)}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.38, ease: 'easeOut', delay: index * 0.06 }}
              className="group rounded-2xl border border-gs-green/14 bg-white/95 p-4 shadow-[0_10px_30px_rgba(6,59,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gs-green/30 hover:shadow-[0_18px_40px_rgba(6,59,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gs-green focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-ge text-[0.8rem] font-bold uppercase tracking-[0.14em] text-ge-orange">
                    {action.label}
                  </p>
                  <p className="mt-2 font-ge text-[1rem] font-semibold leading-6 text-gs-dark">{action.prompt}</p>
                </div>
                <ArrowUpRight
                  className="mt-1 h-4 w-4 shrink-0 text-gs-green transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  )
}
