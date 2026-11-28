import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

mkdirSync('/opt/cursor/artifacts', { recursive: true })

const base = 'http://127.0.0.1:4173'
const emailFile = 'file:///opt/cursor/artifacts/tripadvisor-customer-email-preview.html'

async function shot(page, name) {
  const path = `/opt/cursor/artifacts/${name}`
  await page.screenshot({ path, fullPage: false })
  console.log('saved', path)
}

const browser = await chromium.launch({ headless: true })

async function dismissCookies(page) {
  const reject = page.getByRole('button', { name: /reject all/i })
  try {
    await reject.waitFor({ state: 'visible', timeout: 4000 })
    await reject.click()
    await page.waitForTimeout(400)
  } catch {
    /* no banner */
  }
}

async function withViewport(size, label) {
  const context = await browser.newContext({
    viewport: size,
    deviceScaleFactor: 1
  })
  const page = await context.newPage()

  // Leave a review — hero + primary CTA
  await page.goto(`${base}/leave-a-review`, { waitUntil: 'networkidle' })
  await dismissCookies(page)
  await page.waitForTimeout(400)
  await shot(page, `tripadvisor-leave-a-review-${label}.png`)

  // Also capture the Tripadvisor card below the hero
  const liveCard = page.getByRole('heading', { name: /Review us on Tripadvisor/i }).first()
  if (await liveCard.count()) {
    await liveCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await shot(page, `tripadvisor-leave-a-review-card-${label}.png`)
  }

  // Homepage — scroll to past-customers / Tripadvisor card
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await dismissCookies(page)
  await page.waitForTimeout(600)
  const homeCard = page.locator('aside[aria-label="Tripadvisor"]').first()
  if (await homeCard.count()) {
    await homeCard.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
  } else {
    await page.locator('#past-customers').scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
  }
  await shot(page, `tripadvisor-homepage-touch-${label}.png`)

  // Footer badge
  await page.locator('footer').scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const badge = page.getByRole('link', { name: 'Find us on Tripadvisor' })
  if (await badge.count()) {
    await badge.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
  }
  await shot(page, `tripadvisor-footer-badge-${label}.png`)

  // Email preview
  await page.goto(emailFile, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  const ta = page.locator('.gsol-ta-announce').first()
  if (await ta.count()) {
    await ta.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
  }
  await shot(page, `tripadvisor-email-${label}.png`)

  await context.close()
}

await withViewport({ width: 1440, height: 900 }, 'desktop-1440x900')
await withViewport({ width: 390, height: 844 }, 'mobile-390x844')

await browser.close()
console.log('done')
