import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { GeSection } from '../components/ge-section'
import type { GeContentPageSection } from '../data/content-pages'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.6, ease: 'easeOut' }
} as const

export type GeContentStoryCard = {
  readonly section: GeContentPageSection
  readonly badge: string
  readonly image: string
  readonly imageAlt: string
}

export type GeContentStoryGridProps = {
  readonly eyebrow: string
  readonly title: string
  readonly lead: string
  readonly cards: readonly GeContentStoryCard[]
}

/**
 * Dark editorial grid — same visual language as {@link TransportRouteStory}.
 */
export function GeContentStoryGrid({ eyebrow, title, lead, cards }: GeContentStoryGridProps) {
  if (cards.length === 0) return null

  return (
    <GeSection
      id="ge-content-journey"
      background="teal"
      innerClassName="!pt-20 pb-20 sm:!pt-24 sm:pb-24 scroll-mt-28"
      className="relative"
    >
      <motion.div className="mx-auto max-w-3xl text-center" {...fadeUp}>
        <p className="font-ge text-[0.95rem] font-bold uppercase tracking-[0.18em] text-gs-gold sm:text-[1rem]">{eyebrow}</p>
        <h2 className="mt-3 font-ge text-[2.12rem] font-extrabold leading-[1.06] tracking-[0.01em] text-white sm:text-[2.45rem] lg:text-[2.7rem]">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl font-ge text-[1.06rem] leading-8 text-white/85 sm:text-[1.12rem]">{lead}</p>
      </motion.div>

      <div
        className={`mt-14 grid gap-7 ${cards.length === 1 ? 'md:max-w-lg md:mx-auto' : ''} ${cards.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
      >
        {cards.map((card, i) => (
          <motion.article
            key={card.section.title}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-gs-dark/40 ring-1 ring-white/10 shadow-[0_22px_60px_rgba(0,0,0,0.45)] transition-all duration-500 hover:-translate-y-1 hover:ring-gs-gold/40"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.08 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={card.image}
                alt={card.imageAlt}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={1200}
                height={1500}
                className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gs-dark via-gs-dark/40 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, #B88900 15%, #FFC72C 35%, #FFE27A 50%, #FFC72C 65%, #B88900 85%, transparent 100%)'
                }}
              />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-gs-dark/60 px-3 py-1.5 font-ge text-[0.82rem] font-extrabold uppercase tracking-[0.16em] text-gs-gold backdrop-blur-md sm:text-[0.86rem]">
                <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-gs-gold" />
                {card.badge}
              </span>
            </div>

            <div className="flex flex-1 flex-col px-6 pb-7 pt-6">
              <h3 className="font-ge text-[1.48rem] font-extrabold leading-tight text-white sm:text-[1.58rem]">{card.section.title}</h3>
              <p className="mt-3 flex-1 font-ge text-[1.04rem] leading-8 text-white/85 sm:text-[1.08rem]">{card.section.body}</p>
              {card.section.bullets?.[0] ? (
                <p className="mt-5 inline-flex items-center gap-2 border-t border-white/15 pt-4 font-ge text-[0.92rem] font-bold uppercase tracking-[0.12em] text-gs-gold sm:text-[0.86rem]">
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  {card.section.bullets[0]}
                </p>
              ) : null}
            </div>
          </motion.article>
        ))}
      </div>
    </GeSection>
  )
}
