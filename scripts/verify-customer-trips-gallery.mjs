import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = '/opt/cursor/artifacts'
mkdirSync(OUT, { recursive: true })

const EXPECTED = [
  '/images/customer-trips/bags-at-the-kerb.jpg',
  '/images/customer-trips/sol-don-pablo.jpg',
  '/images/customer-trips/la-reserva-group.jpg',
  '/images/customer-trips/van-to-buggy.jpg',
  '/images/customer-trips/van-doors-open.jpg',
  '/images/customer-trips/van-at-la-reserva.jpg',
  '/images/customer-trips/sunset-bag-drop.jpg',
  '/images/customer-trips/evening-range.jpg',
  '/images/customer-trips/la-reserva-gates.jpg',
  '/images/customer-trips/sotogrande.jpg',
  '/images/customer-trips/hotel-terrace.jpg',
  '/images/customer-trips/resort-gardens.jpg'
]

async function capture(viewport, filename) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport })
  const failed = []
  page.on('response', (response) => {
    const url = response.url()
    if (url.includes('/images/customer-trips/') && response.status() >= 400) {
      failed.push(`${response.status()} ${url}`)
    }
  })

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle', timeout: 60000 })

  // Dismiss cookie banner if present so it does not cover the gallery.
  const cookieBtn = page.getByRole('button', { name: /accept|agree|allow all|got it/i }).first()
  if (await cookieBtn.isVisible().catch(() => false)) {
    await cookieBtn.click().catch(() => {})
  }

  const section = page.locator('#past-customers')
  await section.waitFor({ state: 'visible', timeout: 30000 })
  await section.scrollIntoViewIfNeeded()

  // Force-load every trip photo (eager + decode) before asserting.
  await page.waitForFunction(() => {
    const root = document.querySelector('#past-customers')
    if (!root) return false
    const imgs = [...root.querySelectorAll('img')]
    if (imgs.length < 12) return false
    return imgs.every((img) => img.complete && img.naturalWidth > 0)
  }, null, { timeout: 30000 })

  // Nudge so sticky crest nav does not cover the section heading in the shot.
  await page.evaluate(() => {
    const root = document.querySelector('#past-customers')
    if (!root) return
    const top = root.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: Math.max(0, top - 88), behavior: 'instant' })
  })
  await page.waitForTimeout(300)

  const imgs = section.locator('img')
  const count = await imgs.count()
  const natural = []
  for (let i = 0; i < count; i += 1) {
    const info = await imgs.nth(i).evaluate((el) => ({
      src: el.getAttribute('src'),
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight
    }))
    natural.push(info)
  }

  const uniqueSrcs = [...new Set(natural.map((item) => item.src))]
  for (const src of EXPECTED) {
    if (!uniqueSrcs.includes(src)) {
      failed.push(`missing in DOM: ${src}`)
    }
  }

  const headingVisible = await section.getByRole('heading', { name: /real irish groups/i }).isVisible()
  if (!headingVisible) failed.push('section heading not visible')

  await section.screenshot({ path: join(OUT, filename), animations: 'disabled' })
  await page.screenshot({
    path: join(OUT, filename.replace('.png', '-viewport.png')),
    fullPage: false
  })

  await browser.close()
  return { failed, natural, count }
}

const desktop = await capture({ width: 1440, height: 900 }, 'past-customers-gallery-desktop.png')
const mobile = await capture({ width: 390, height: 844 }, 'past-customers-gallery-mobile.png')

const report = {
  expectedAssets: EXPECTED,
  desktop,
  mobile,
  brokenDesktop: desktop.natural.filter((img) => !img.naturalWidth),
  brokenMobile: mobile.natural.filter((img) => !img.naturalWidth)
}

writeFileSync(join(OUT, 'past-customers-gallery-verify.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))

if (report.brokenDesktop.length || report.brokenMobile.length || desktop.failed.length || mobile.failed.length) {
  process.exit(1)
}
