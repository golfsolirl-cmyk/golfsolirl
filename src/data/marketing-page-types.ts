export type MarketingEnquiryType = 'booking' | 'legal' | 'newsletter' | 'testimonial' | 'support'
export type MarketingFormVariant =
  | 'quote'
  | 'club-rental'
  | 'courses'
  | 'accommodation'
  | 'transport'
  | 'itinerary'
  | 'guide'
  | 'legal'
  | 'newsletter'
  | 'testimonial'
  | 'support'

export interface MarketingPageSection {
  readonly title: string
  readonly body: string
  readonly bullets?: readonly string[]
}

export interface MarketingPageQuote {
  readonly text: string
  readonly attribution: string
}

export interface MarketingPageData {
  readonly metaTitle: string
  readonly metaDescription?: string
  readonly canonicalPath?: string
  readonly noIndex?: boolean
  readonly eyebrow: string
  readonly title: string
  readonly subtitle: string
  readonly heroImage: string
  readonly heroAlt: string
  readonly highlights: readonly string[]
  readonly sections: readonly MarketingPageSection[]
  readonly formTitle: string
  readonly formLead: string
  readonly interestPreset: string
  readonly enquiryType?: MarketingEnquiryType
  readonly formVariant?: MarketingFormVariant
  readonly asideQuote?: MarketingPageQuote
}
