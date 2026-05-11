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
  const { scrollX, scrollY, windowWidth, windowHeight } = html2canvasViewportPadding(el)
  const scale = Math.max(2, Math.min((window.devicePixelRatio || 1) * 2, 3))

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
 * Single A4 PDF with one card slide (hidden print markup under `#business-cards-pdf-export-root`).
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
