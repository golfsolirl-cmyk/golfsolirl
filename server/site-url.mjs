/** Site origin for emails, PDFs, and absolute asset URLs. */
export const getGsolSiteUrl = () => {
  const explicit = process.env.SITE_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/+$/, '')
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    return vercel.startsWith('http') ? vercel.replace(/\/+$/, '') : `https://${vercel.replace(/\/+$/, '')}`
  }

  return 'https://golfsolirl.com'
}
