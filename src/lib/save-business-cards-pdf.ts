import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

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

/**
 * One slide per PDF page (cover + each card). Avoids slicing one tall canvas across page breaks.
 */
export async function saveBusinessCardsCatalogPdf(root: HTMLElement, filenameBase: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  await waitForImages(root)

  const slides = root.querySelectorAll<HTMLElement>('[data-pdf-page]')
  if (slides.length === 0) {
    throw new Error('No [data-pdf-page] sections found for PDF export.')
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  })

  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const margin = 12
  const maxW = pageW - 2 * margin
  const maxH = pageH - 2 * margin

  for (let i = 0; i < slides.length; i++) {
    const el = slides[i]
    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale: Math.max(2, Math.min((window.devicePixelRatio || 1) * 2, 3)),
      useCORS: true,
      logging: false,
      width: el.scrollWidth,
      height: el.scrollHeight,
      ignoreElements: (node) => node.hasAttribute('data-html2canvas-ignore'),
      /**
       * Export DOM lives off-screen (`fixed -left-[9999px]`) so it does not cover the UI.
       * html2canvas often paints blank for deep off-screen subtrees; normalize position in the clone only.
       */
      onclone: (clonedDoc) => {
        const clonedRoot = clonedDoc.getElementById('business-cards-pdf-export-root')
        if (clonedRoot) {
          clonedRoot.style.setProperty('left', '0', 'important')
          clonedRoot.style.setProperty('top', '0', 'important')
          clonedRoot.style.setProperty('position', 'fixed', 'important')
        }
      }
    })

    const imgData = canvas.toDataURL('image/png', 0.92)
    const ratio = canvas.width / canvas.height
    let wMm = maxW
    let hMm = wMm / ratio
    if (hMm > maxH) {
      hMm = maxH
      wMm = hMm * ratio
    }
    const x = margin + (maxW - wMm) / 2
    const y = margin + (maxH - hMm) / 2

    if (i > 0) {
      pdf.addPage()
    }
    pdf.addImage(imgData, 'PNG', x, y, wMm, hMm, undefined, 'FAST')
  }

  const safeName = filenameBase.replace(/[^\w.-]+/g, '-').slice(0, 120) || 'business-cards'
  pdf.save(`${safeName}.pdf`)
}
