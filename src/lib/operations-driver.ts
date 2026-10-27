/** Default Costa del Sol driver — assigned from admin; notified by email (no driver portal required). */
export const MARTIN_KELLY_DRIVER = {
  id: 'c0ffee00-0000-4000-8000-000000000001',
  displayName: 'Martin Kelly',
  email: 'info@golfsolirl.com',
  phone: '+353 86 851 5000',
  phoneTel: '+353868515000'
} as const

export const isMartinKellyDriverId = (id: string | null | undefined) =>
  (id ?? '').trim() === MARTIN_KELLY_DRIVER.id

export const isMartinKellyDriverRow = (d: { id?: string; display_name?: string; email?: string }) =>
  isMartinKellyDriverId(d.id) ||
  (d.display_name ?? '').trim().toLowerCase() === MARTIN_KELLY_DRIVER.displayName.toLowerCase() ||
  (d.email ?? '').trim().toLowerCase() === MARTIN_KELLY_DRIVER.email.toLowerCase()
