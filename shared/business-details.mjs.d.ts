export declare const GSOL_BUSINESS: {
  readonly brandName: string
  readonly alternateName: string
  readonly legalName: string
  readonly tagline: string
  readonly email: string
  readonly websiteDisplay: string
  readonly websiteUrl: string
  readonly siteUrlBare: string
  readonly companyRegistrationNumber: string
  readonly registeredInLabel: string
  readonly address: {
    readonly streetAddress: string
    readonly addressLocality: string
    readonly addressRegion: string
    readonly postalCode: string
    readonly addressCountry: string
    readonly addressCountryName: string
  }
  readonly addressLines: readonly string[]
  readonly addressOneLine: string
  readonly mapsQuery: string
  readonly irishPhoneDisplay: string
  readonly irishPhoneTel: string
  readonly irishPhoneLabel: string
  readonly spanishPhoneDisplay: string
  readonly spanishPhoneTel: string
  readonly spanishPhoneLabel: string
  readonly whatsappDisplay: string
  readonly whatsappTel: string
  readonly whatsappHref: string
  readonly whatsappNumberDigits: string
}

export declare function gsolBusinessFooterPlain(): string
export declare function gsolPostalAddressJsonLd(): {
  readonly '@type': string
  readonly streetAddress: string
  readonly addressLocality: string
  readonly addressRegion: string
  readonly postalCode: string
  readonly addressCountry: string
}
