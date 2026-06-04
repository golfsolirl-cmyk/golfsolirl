/**
 * Landscape business card — split "concierge desk" layout.
 * Left forest panel + right fleet photo; cream back with contact grid.
 */
import { CarFront, Flag, Mail, Phone, PlaneLanding } from 'lucide-react'
import { BusinessCardQr } from '../business-card-qr'
import type { BusinessCardRenderMode } from '../../lib/business-cards-catalog-types'
import { businessCardContact } from '../../lib/business-cards-config'
import { brandLogoAssetUrl } from '../../lib/brand-logo-assets'
import {
  BrandCrest,
  CARD_BADGES,
  CARD_BRAND,
  CardFrame,
  CardGrain,
  CelticCorner,
  ChromeRule,
  FleetPhotoLayer,
  GoldGradientText,
  GoldInsetBorder,
  cardInset
} from './brand-card-shared'

function MalagaRibbon({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const isPdf = mode === 'pdf'
  return (
    <div
      className="mt-[5%] w-full bg-gradient-to-r from-[#136047] via-[#1e7558] to-[#136047] px-[6%] py-[2.5%] text-center font-ge font-black uppercase tracking-[0.22em] text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
      style={{ fontSize: isPdf ? '0.26rem' : 'clamp(5px,1.6cqw,0.3rem)' }}
    >
      Málaga → Costa del Sol
    </div>
  )
}

export function LandscapeBrandCardFront({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const inset = cardInset(mode)
  const isPdf = mode === 'pdf'
  const qrSize = isPdf ? 96 : 88

  return (
    <CardFrame mode={mode} orientation="landscape">
      <div className="absolute inset-0 flex">
        {/* Left brand panel */}
        <div
          className="relative flex w-[40%] flex-col"
          style={{
            background: `linear-gradient(165deg, ${CARD_BRAND.forest950} 0%, ${CARD_BRAND.forest800} 55%, ${CARD_BRAND.forest900} 100%)`
          }}
        >
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-[3px] bg-gradient-to-b from-[#fff5cf] via-[#d9be7a] to-[#fff5cf] opacity-90"
            aria-hidden
          />
          <CardGrain opacity={0.06} />
          <div className="relative flex h-full flex-col items-center justify-center px-[8%] py-[6%] text-center">
            <BrandCrest mode={mode} sizePdf={72} sizePreview="38%" />
            <h2
              className="mt-[6%] font-ge font-black uppercase leading-[0.95] tracking-[0.04em] text-white"
              style={{ fontSize: isPdf ? '0.62rem' : 'clamp(10px,3.8cqw,0.72rem)' }}
            >
              Golf Sol
              <br />
              <GoldGradientText>Ireland</GoldGradientText>
            </h2>
            <p
              className="mt-[5%] font-ge font-bold uppercase tracking-[0.16em] text-[#d9be7a]"
              style={{ fontSize: isPdf ? '0.28rem' : 'clamp(5px,1.7cqw,0.32rem)' }}
            >
              From plane to fairway
            </p>
            <MalagaRibbon mode={mode} />
          </div>
        </div>

        {/* Right photo panel */}
        <div className="relative w-[60%] overflow-hidden">
          <FleetPhotoLayer mode={mode} blur={4} />
          <div className="relative flex h-full flex-col justify-end pb-[14%] p-[5%]">
            <div className="ml-auto max-w-[58%]">
              <BusinessCardQr
                mode={mode}
                value={businessCardContact.websiteUrl}
                size={qrSize}
                label="Scan to book your transfer"
                labelStyle="foil-button"
                centerLogoSrc={brandLogoAssetUrl()}
                centerLogoSize={Math.round(qrSize * 0.22)}
              />
            </div>
          </div>
        </div>
      </div>

      <GoldInsetBorder inset={inset} />
      {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
        <CelticCorner key={p} position={p} />
      ))}

      {/* Trust strip — homepage pattern */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-around border-t border-[#d9be7a]/25 bg-[#04140c]/88 px-[4%] py-[1.8%] backdrop-blur-sm"
        style={{ fontSize: isPdf ? '0.24rem' : 'clamp(5px,1.5cqw,0.28rem)' }}
      >
        {[
          { Icon: PlaneLanding, label: 'Malaga AGP' },
          { Icon: CarFront, label: 'Mercedes Fleet' },
          { Icon: Flag, label: 'Golf & Hotels' }
        ].map(({ Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-[0.35em] font-ge font-bold uppercase tracking-[0.1em] text-[#eef2ef]"
          >
            <Icon className="h-[1.2em] w-[1.2em] text-[#d9be7a]" strokeWidth={2.2} aria-hidden />
            {label}
          </span>
        ))}
      </div>
    </CardFrame>
  )
}

export function LandscapeBrandCardBack({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const inset = cardInset(mode)
  const isPdf = mode === 'pdf'
  const qrSize = isPdf ? 92 : 84

  return (
    <CardFrame mode={mode} orientation="landscape">
      <div className="absolute inset-0 bg-[#f7f4ec]" aria-hidden />
      <CardGrain opacity={0.05} />
      <GoldInsetBorder inset={inset} />

      <div className="relative flex h-full flex-col" style={{ padding: inset }}>
        {/* Header band */}
        <div
          className="-mx-[calc(var(--card-inset,0))] rounded-t-[12px] bg-gradient-to-r from-[#062016] via-[#0b4d3b] to-[#136047] px-[5%] py-[2.8%] text-center"
          style={{ marginLeft: `calc(-1 * ${inset})`, marginRight: `calc(-1 * ${inset})`, marginTop: `calc(-1 * ${inset})` }}
        >
          <p
            className="font-ge font-black uppercase tracking-[0.2em]"
            style={{ fontSize: isPdf ? '0.34rem' : 'clamp(7px,2.2cqw,0.4rem)' }}
          >
            <GoldGradientText>Premium golf travel · Costa del Sol</GoldGradientText>
          </p>
        </div>

        <div className="mt-[4%] grid flex-1 grid-cols-[1.15fr_0.85fr] gap-[4%]">
          {/* Contact */}
          <div className="flex flex-col justify-center gap-[3.5%]">
            <ContactLine
              mode={mode}
              icon={<Mail className="h-[1.15em] w-[1.15em]" aria-hidden />}
              label="Email"
              value={businessCardContact.email}
              href={`mailto:${businessCardContact.email}`}
            />
            <ContactLine
              mode={mode}
              icon={<Phone className="h-[1.15em] w-[1.15em]" aria-hidden />}
              label="Ireland"
              value={businessCardContact.phoneIe}
              href={`tel:${businessCardContact.phoneIe.replace(/\s/g, '')}`}
            />
            <ContactLine
              mode={mode}
              icon={<Phone className="h-[1.15em] w-[1.15em]" aria-hidden />}
              label="Spain"
              value={businessCardContact.phoneEs}
              href={`tel:${businessCardContact.phoneEs.replace(/\s/g, '')}`}
            />
            <p
              className="font-ge font-extrabold uppercase tracking-[0.14em] text-[#0b4d3b]"
              style={{ fontSize: isPdf ? '0.36rem' : 'clamp(7px,2.4cqw,0.44rem)' }}
            >
              {businessCardContact.websiteDisplay}
            </p>
          </div>

          {/* QR + crest */}
          <div className="flex flex-col items-center justify-center gap-[4%]">
            <BrandCrest mode={mode} sizePdf={56} sizePreview="42%" />
            <BusinessCardQr
              mode={mode}
              value={businessCardContact.websiteUrl}
              size={qrSize}
              label="Scan to book"
              labelStyle="below"
              centerLogoSrc={brandLogoAssetUrl()}
              centerLogoSize={Math.round(qrSize * 0.22)}
            />
          </div>
        </div>

        <ChromeRule className="my-[3%]" />

        {/* Footer badges */}
        <div
          className="flex flex-wrap justify-center gap-x-[5%] gap-y-[1%] rounded-[10px] bg-[#062016] px-[4%] py-[2.5%]"
          style={{ fontSize: isPdf ? '0.26rem' : 'clamp(5px,1.6cqw,0.3rem)' }}
        >
          {CARD_BADGES.map((badge) => (
            <span
              key={badge}
              className="font-ge font-bold uppercase tracking-[0.12em] text-[#f7f4ec]"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </CardFrame>
  )
}

function ContactLine({
  mode,
  icon,
  label,
  value,
  href
}: {
  readonly mode: BusinessCardRenderMode
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string
  readonly href: string
}) {
  const isPdf = mode === 'pdf'
  return (
    <a href={href} className="group flex items-start gap-[0.6em] no-underline">
      <span className="mt-[0.1em] shrink-0 text-[#136047]">{icon}</span>
      <span>
        <span
          className="block font-ge font-bold uppercase tracking-[0.16em] text-[#66726b]"
          style={{ fontSize: isPdf ? '0.24rem' : 'clamp(5px,1.5cqw,0.28rem)' }}
        >
          {label}
        </span>
        <span
          className="block font-ge font-extrabold text-[#08120d] group-hover:text-[#0b4d3b]"
          style={{ fontSize: isPdf ? '0.38rem' : 'clamp(7px,2.5cqw,0.46rem)' }}
        >
          {value}
        </span>
      </span>
    </a>
  )
}

export function LandscapeBrandCardFace({
  mode,
  side
}: {
  readonly mode: BusinessCardRenderMode
  readonly side: 'back' | 'front'
}) {
  return side === 'front' ? <LandscapeBrandCardFront mode={mode} /> : <LandscapeBrandCardBack mode={mode} />
}
