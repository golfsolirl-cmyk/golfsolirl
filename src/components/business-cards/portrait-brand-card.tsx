/**
 * Portrait business card — vertical "private club membership" layout.
 * Homepage brand: forest overlay, cream/gold type, fleet photography, large QR.
 */
import { Check } from 'lucide-react'
import { BusinessCardQr } from '../business-card-qr'
import type { BusinessCardRenderMode } from '../../lib/business-cards-catalog-types'
import { businessCardContact } from '../../lib/business-cards-config'
import { brandLogoAssetUrl } from '../../lib/brand-logo-assets'
import {
  BrandCrest,
  CARD_BADGES,
  CARD_BRAND,
  CARD_SERVICES,
  CardFrame,
  CardGrain,
  CelticCorner,
  ChromeRule,
  FleetPhotoLayer,
  GoldGradientText,
  GoldInsetBorder,
  ShamrockWatermark,
  cardInset
} from './brand-card-shared'

export function PortraitBrandCardFront({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const inset = cardInset(mode)
  const isPdf = mode === 'pdf'
  const qrSize = isPdf ? 108 : 96

  return (
    <CardFrame mode={mode} orientation="portrait">
      <FleetPhotoLayer mode={mode} blur={5} />
      <CardGrain />
      <GoldInsetBorder inset={inset} />
      {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
        <CelticCorner key={p} position={p} />
      ))}
      <ShamrockWatermark mode={mode} />

      <div className="relative flex h-full flex-col" style={{ padding: inset }}>
        <BrandCrest mode={mode} className="mx-auto" sizePdf={96} sizePreview="24%" />

        <p
          className="mt-[3%] text-center font-ge font-extrabold uppercase tracking-[0.32em] text-[#eef2ef]/90"
          style={{ fontSize: isPdf ? '0.38rem' : 'clamp(7px,2.2cqw,0.42rem)' }}
        >
          Ireland · Costa del Sol
        </p>

        <h2
          className="mt-[2%] text-center font-ge-display font-semibold leading-[0.92] text-white"
          style={{ fontSize: isPdf ? '1.05rem' : 'clamp(18px,9.5cqw,2.4rem)' }}
        >
          GOLF SOL
          <br />
          <GoldGradientText>IRELAND</GoldGradientText>
        </h2>

        <div
          className="mx-auto mt-[4%] max-w-[92%] rounded-full border border-[#d9be7a]/30 bg-[#f7f4ec]/92 px-[6%] py-[2.2%] text-center shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
        >
          <p
            className="font-ge font-bold uppercase tracking-[0.14em] text-[#08120d]"
            style={{ fontSize: isPdf ? '0.36rem' : 'clamp(7px,2.4cqw,0.44rem)' }}
          >
            Luxury Golf Transfers &amp; Experiences
          </p>
        </div>

        <div className="mt-auto flex flex-col items-center gap-[3%] pt-[4%]">
          <ChromeRule className="mb-[2%] w-[70%]" />
          <a
            href={`mailto:${businessCardContact.email}`}
            className="font-ge font-extrabold tracking-wide text-[#f7f4ec] no-underline"
            style={{ fontSize: isPdf ? '0.42rem' : 'clamp(8px,2.8cqw,0.52rem)' }}
          >
            {businessCardContact.email}
          </a>
          <BusinessCardQr
            mode={mode}
            value={businessCardContact.websiteUrl}
            size={qrSize}
            label="Scan to book your golf transfer"
            labelStyle="foil-button"
            centerLogoSrc={brandLogoAssetUrl()}
            centerLogoSize={Math.round(qrSize * 0.22)}
          />
        </div>

        <div
          className="mt-[3%] flex flex-wrap justify-center gap-x-[4%] gap-y-[1.5%]"
          style={{ fontSize: isPdf ? '0.28rem' : 'clamp(5px,1.8cqw,0.32rem)' }}
        >
          {CARD_BADGES.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-[0.4em] font-ge font-bold uppercase tracking-[0.12em] text-[#d9be7a]"
            >
              <Check className="inline h-[1.1em] w-[1.1em] shrink-0" strokeWidth={3} aria-hidden />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </CardFrame>
  )
}

export function PortraitBrandCardBack({ mode }: { readonly mode: BusinessCardRenderMode }) {
  const inset = cardInset(mode)
  const isPdf = mode === 'pdf'
  const qrSize = isPdf ? 118 : 104

  return (
    <CardFrame mode={mode} orientation="portrait">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(168deg, ${CARD_BRAND.forest900} 0%, ${CARD_BRAND.forest800} 38%, ${CARD_BRAND.forest950} 100%)`
        }}
        aria-hidden
      />
      <CardGrain opacity={0.1} />
      <GoldInsetBorder inset={inset} />
      {(['tl', 'tr', 'bl', 'br'] as const).map((p) => (
        <CelticCorner key={p} position={p} />
      ))}

      <div className="relative flex h-full flex-col" style={{ padding: inset }}>
        <ChromeRule className="mb-[3%]" />
        <BrandCrest mode={mode} className="mx-auto" sizePdf={92} sizePreview="22%" />

        <h2
          className="mt-[3%] text-center font-ge font-black uppercase leading-[1.05] tracking-[0.06em]"
          style={{ fontSize: isPdf ? '0.52rem' : 'clamp(9px,3.2cqw,0.58rem)' }}
        >
          <GoldGradientText>Your golf journey starts here</GoldGradientText>
        </h2>

        <ul
          className="mt-[4%] flex flex-1 flex-col justify-center gap-[2.2%] pl-[4%]"
          style={{ fontSize: isPdf ? '0.38rem' : 'clamp(7px,2.5cqw,0.46rem)' }}
        >
          {CARD_SERVICES.slice(0, 5).map((service) => (
            <li key={service} className="flex items-start gap-[0.5em] font-ge font-bold text-[#f7f4ec]">
              <span className="mt-[0.15em] h-[0.45em] w-[0.45em] shrink-0 rounded-full bg-gradient-to-br from-[#fff5cf] to-[#d9be7a]" aria-hidden />
              {service}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col items-center gap-[2.5%]">
          <BusinessCardQr
            mode={mode}
            value={businessCardContact.websiteUrl}
            size={qrSize}
            variant="dark"
            label="Scan to book"
            labelStyle="below"
            centerLogoSrc={brandLogoAssetUrl()}
            centerLogoSize={Math.round(qrSize * 0.22)}
          />
          <div className="w-full text-center">
            <p
              className="font-ge font-extrabold text-[#f7f4ec]"
              style={{ fontSize: isPdf ? '0.4rem' : 'clamp(8px,2.6cqw,0.5rem)' }}
            >
              {businessCardContact.email}
            </p>
            <p
              className="mt-[1%] font-ge font-bold uppercase tracking-[0.18em] text-[#d9be7a]"
              style={{ fontSize: isPdf ? '0.34rem' : 'clamp(7px,2.2cqw,0.4rem)' }}
            >
              {businessCardContact.websiteDisplay}
            </p>
          </div>
        </div>
      </div>
    </CardFrame>
  )
}

export function PortraitBrandCardFace({
  mode,
  side
}: {
  readonly mode: BusinessCardRenderMode
  readonly side: 'back' | 'front'
}) {
  return side === 'front' ? <PortraitBrandCardFront mode={mode} /> : <PortraitBrandCardBack mode={mode} />
}
