import { createContext, useContext, type ReactNode } from 'react'
import {
  HOMEPAGETEST_LOGO,
  HOMEPAGETEST_LOGO_INTRINSIC,
} from '../pages/golf-experience/homepagetest-brand'

export type HomepageTestLogoAssets = {
  readonly webp: string
  readonly png: string
  readonly width: number
  readonly height: number
}

const HomepageTestVariantContext = createContext<HomepageTestLogoAssets | null>(null)

export function HomepageTestVariantProvider({ children }: { readonly children: ReactNode }) {
  return (
    <HomepageTestVariantContext.Provider
      value={{
        webp: HOMEPAGETEST_LOGO.webp,
        png: HOMEPAGETEST_LOGO.png,
        width: HOMEPAGETEST_LOGO_INTRINSIC.width,
        height: HOMEPAGETEST_LOGO_INTRINSIC.height,
      }}
    >
      {children}
    </HomepageTestVariantContext.Provider>
  )
}

/** When inside `/homepagetest`, returns the test crest; otherwise `null` (production logo). */
export function useHomepageTestLogo(): HomepageTestLogoAssets | null {
  return useContext(HomepageTestVariantContext)
}
