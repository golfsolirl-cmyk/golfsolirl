import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const BUSINESS_CARD_SHORT_MM = 55
const BUSINESS_CARD_LONG_MM = 85

async function waitForImages(container: HTMLElement) {
  const imgs = [...container.querySelectorAll('img')]
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve()
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true })
        img.addEventListener('error', () => resolve(), { once: true })
      })
    })
  )
}

function triggerPdfDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  requestAnimationFrame(() => {
    URL.revokeObjectURL(url)
    a.remove()
  })
}

/**
 * html2canvas maps viewport coordinates + scrollX into canvas space (see Bounds.fromClientRect).
 * Export DOM uses `fixed -left-[9999px]`, so getBoundingClientRect().left is hugely negative; default
 * scrollX (0) keeps content off-canvas → blank PDF. Pad scrollX/scrollY and window size so the subtree fits.
 */
/** html2canvas often ignores container queries / clamp — freeze layout from live DOM. */
const LAYOUT_INLINE_PROPS = [
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'fontWeight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'gap',
  'rowGap',
  'columnGap',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'flex',
  'flexBasis',
  'flexGrow',
  'flexShrink',
  'top',
  'left',
  'right',
  'bottom',
  'transform',
  'transformOrigin'
] as const

function inlineResolvedLayoutStyles(liveRoot: HTMLElement, cloneRoot: HTMLElement) {
  const liveNodes: Element[] = [liveRoot, ...liveRoot.querySelectorAll('*')]
  const cloneNodes: Element[] = [cloneRoot, ...cloneRoot.querySelectorAll('*')]
  if (liveNodes.length !== cloneNodes.length) return

  for (let i = 0; i < liveNodes.length; i++) {
    const live = liveNodes[i]
    const clone = cloneNodes[i]
    if (!(live instanceof HTMLElement) || !(clone instanceof HTMLElement)) continue
    const cs = getComputedStyle(live)
    for (const prop of LAYOUT_INLINE_PROPS) {
      const val = cs[prop]
      if (!val || val === 'auto' || val === 'normal' || val === '0px') continue
      clone.style.setProperty(prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), val)
    }
  }
}

function html2canvasViewportPadding(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  const pad = 32
  const scrollX = Math.max(0, Math.ceil(-r.left + pad))
  const scrollY = Math.max(0, Math.ceil(-r.top + pad))
  const windowWidth = Math.ceil(Math.max(window.innerWidth, r.width + scrollX + pad * 2))
  const windowHeight = Math.ceil(Math.max(window.innerHeight, r.height + scrollY + pad * 2))
  return { scrollX, scrollY, windowWidth, windowHeight }
}

export function sanitizePdfFilenameBase(base: string) {
  return base.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 120) || 'business-card'
}

async function captureSlideToCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  el.getBoundingClientRect()
  void el.offsetHeight

  const { scrollX, scrollY, windowWidth, windowHeight } = html2canvasViewportPadding(el)
  /** Slightly higher floor keeps fine type + crest edges sharp after downscale to mm-sized PDF. */
  const scale = Math.max(2.5, Math.min((window.devicePixelRatio || 1) * 2, 3))

  return html2canvas(el, {
    backgroundColor: '#ffffff',
    scale,
    useCORS: false,
    logging: false,
    scrollX,
    scrollY,
    windowWidth,
    windowHeight,
    ignoreElements: (node) =>
      node instanceof HTMLElement && node.hasAttribute('data-html2canvas-ignore'),
    onclone: (clonedDoc, clonedSlide) => {
      const clonedRoot = clonedDoc.getElementById('business-cards-pdf-export-root')
      if (clonedRoot) {
        clonedRoot.style.setProperty('left', '0', 'important')
        clonedRoot.style.setProperty('top', '0', 'important')
        clonedRoot.style.setProperty('position', 'fixed', 'important')
      }
      clonedSlide.style.setProperty('opacity', '1', 'important')
      inlineResolvedLayoutStyles(el, clonedSlide)
    }
  })
}

function addCanvasToPdfPage(pdf: jsPDF, canvas: HTMLCanvasElement, isFirstPage: boolean) {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const maxW = pageW
  const maxH = pageH

  let imgData: string
  try {
    imgData = canvas.toDataURL('image/png', 0.92)
  } catch {
    throw new Error(
      'Could not read the rendered page (often a cross-origin image). Try again after refreshing.'
    )
  }

  const ratio = canvas.width / canvas.height
  let wMm = maxW
  let hMm = wMm / ratio
  if (hMm > maxH) {
    hMm = maxH
    wMm = hMm * ratio
  }
  const x = (maxW - wMm) / 2
  const y = (maxH - hMm) / 2

  if (!isFirstPage) {
    pdf.addPage()
  }
  pdf.addImage(imgData, 'PNG', x, y, wMm, hMm, undefined, 'FAST')
}

/**
 * Single card-sized PDF (55×85mm) — for direct-to-printer use.
 */
export async function saveSingleBusinessCardPdf(slideEl: HTMLElement, filenameBase: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForImages(slideEl)

  const isLandscape = slideEl.getBoundingClientRect().width >= slideEl.getBoundingClientRect().height
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [BUSINESS_CARD_SHORT_MM, BUSINESS_CARD_LONG_MM],
    compress: true
  })

  const canvas = await captureSlideToCanvas(slideEl)
  addCanvasToPdfPage(pdf, canvas, true)

  const safeName = sanitizePdfFilenameBase(filenameBase)
  triggerPdfDownload(pdf.output('blob'), `${safeName}.pdf`)
}

/**
 * Single card on an A4 page, scaled up to fill — for on-screen proofing.
 */
export async function saveSingleBusinessCardProofPdf(slideEl: HTMLElement, filenameBase: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForImages(slideEl)

  const isLandscape = slideEl.getBoundingClientRect().width >= slideEl.getBoundingClientRect().height
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const canvas = await captureSlideToCanvas(slideEl)

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 15
  const maxW = pageW - margin * 2
  const maxH = pageH - margin * 2

  let imgData: string
  try {
    imgData = canvas.toDataURL('image/png', 0.92)
  } catch {
    throw new Error('Could not read the rendered page. Try again after refreshing.')
  }

  const ratio = canvas.width / canvas.height
  let wMm = maxW
  let hMm = wMm / ratio
  if (hMm > maxH) {
    hMm = maxH
    wMm = hMm * ratio
  }
  const x = (pageW - wMm) / 2
  const y = (pageH - hMm) / 2

  pdf.addImage(imgData, 'PNG', x, y, wMm, hMm, undefined, 'FAST')

  const safeName = sanitizePdfFilenameBase(filenameBase)
  triggerPdfDownload(pdf.output('blob'), `${safeName}-proof.pdf`)
}

/**
 * All cards on A4 pages (one per page) — full proof book.
 */
export async function saveAllBusinessCardProofsPdf(
  slides: { el: HTMLElement; title: string }[]
) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  for (const s of slides) {
    await waitForImages(s.el)
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 15

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]
    const canvas = await captureSlideToCanvas(slide.el)

    let imgData: string
    try {
      imgData = canvas.toDataURL('image/png', 0.92)
    } catch {
      continue
    }

    const isLandscape = canvas.width > canvas.height
    if (i > 0) {
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait')
    } else if (isLandscape) {
      pdf.deletePage(1)
      pdf.addPage('a4', 'landscape')
    }

    const pw = pdf.internal.pageSize.getWidth()
    const ph = pdf.internal.pageSize.getHeight()
    const maxW = pw - margin * 2
    const maxH = ph - margin * 2

    const ratio = canvas.width / canvas.height
    let wMm = maxW
    let hMm = wMm / ratio
    if (hMm > maxH) {
      hMm = maxH
      wMm = hMm * ratio
    }
    const x = (pw - wMm) / 2
    const y = (ph - hMm) / 2

    pdf.addImage(imgData, 'PNG', x, y, wMm, hMm, undefined, 'FAST')

    pdf.setFontSize(8)
    pdf.setTextColor(100)
    pdf.text(slide.title, pw / 2, ph - 6, { align: 'center' })
  }

  triggerPdfDownload(pdf.output('blob'), 'Golf-Sol-Ireland-Business-Cards-Proof.pdf')
}

/** Transparent PNG export at ~300 DPI equivalent (850×550 card pixels, scale 3). */
export async function saveSingleBusinessCardPng(slideEl: HTMLElement, filenameBase: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForImages(slideEl)
  await new Promise((r) => setTimeout(r, 120))

  const canvas = await captureSlideToCanvas(slideEl)
  let blob: Blob | null = null
  try {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png', 1)
    })
  } catch {
    throw new Error('Could not read the rendered card. Try again after refreshing.')
  }

  if (!blob) {
    throw new Error('Could not build PNG.')
  }

  const safeName = sanitizePdfFilenameBase(filenameBase)
  triggerPdfDownload(blob, `${safeName}.png`)
}
