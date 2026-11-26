export type SiteBankPaymentSettings = {
  readonly accountName: string
  readonly bankName: string
  readonly iban: string
  readonly ibanDisplay: string
  readonly bic: string
}

export type SitePaymentSettingsResponse = {
  ok?: boolean
  configured?: boolean
  settings?: SiteBankPaymentSettings | null
  message?: string
}

export async function fetchSitePaymentSettings(accessToken: string | null): Promise<SiteBankPaymentSettings | null> {
  if (!accessToken) {
    return null
  }
  const res = await fetch('/api/site-payment-settings', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  const data = (await res.json().catch(() => ({}))) as SitePaymentSettingsResponse
  if (!res.ok) {
    return null
  }
  const settings = data.settings
  if (!settings?.iban?.trim() || !settings.accountName?.trim()) {
    return null
  }
  return settings
}