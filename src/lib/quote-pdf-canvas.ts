import type { jsPDF } from 'jspdf'

/**
 * Rasterise a tall HTML canvas across multiple A4 pages at full width (no downscaling of text).
 */
export function addCanvasPagedToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, marginMm: number): void {
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const usableW = Math.max(24, pageW - marginMm * 2)
  const usableH = Math.max(24, pageH - marginMm * 2)

  const fullImgHeightMm = (canvas.height * usableW) / canvas.width
  if (fullImgHeightMm <= usableH + 0.5) {
    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', marginMm, marginMm, usableW, fullImgHeightMm)
    return
  }

  const slicePx = Math.ceil((usableH * canvas.width) / usableW)
  let srcY = 0
  let page = 0

  while (srcY < canvas.height) {
    const hPx = Math.min(slicePx, canvas.height - srcY)
    const slice = document.createElement('canvas')
    slice.width = canvas.width
    slice.height = hPx
    const ctx = slice.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.drawImage(canvas, 0, srcY, canvas.width, hPx, 0, 0, canvas.width, hPx)
    const dataUrl = slice.toDataURL('image/png', 1.0)
    const sliceHeightMm = (hPx * usableW) / canvas.width
    if (page > 0) {
      pdf.addPage()
    }
    pdf.addImage(dataUrl, 'PNG', marginMm, marginMm, usableW, sliceHeightMm)
    srcY += hPx
    page += 1
    if (page > 40) {
      return
    }
  }
}
