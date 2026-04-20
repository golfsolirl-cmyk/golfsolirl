import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const saveElementAsPdf = async (root: HTMLElement, filenameBase: string) => {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = await html2canvas(root, {
    backgroundColor: '#ffffff',
    scale: Math.max(3, Math.min((window.devicePixelRatio || 1) * 2, 4)),
    useCORS: true,
    logging: false,
    width: root.scrollWidth,
    height: root.scrollHeight,
    ignoreElements: (element) => element.hasAttribute('data-html2canvas-ignore')
  })

  const imageData = canvas.toDataURL('image/png', 1)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const pageMargin = 10
  const renderWidth = pageWidth - pageMargin * 2
  const scaledPageHeightPx = (canvas.width * (pageHeight - pageMargin * 2)) / renderWidth
  const pageCanvas = document.createElement('canvas')
  const pageContext = pageCanvas.getContext('2d')

  if (!pageContext) {
    throw new Error('Unable to prepare the PDF canvas.')
  }

  pageCanvas.width = canvas.width

  let currentY = 0
  let pageIndex = 0

  while (currentY < canvas.height) {
    const remainingHeight = canvas.height - currentY
    const sliceHeight = Math.min(Math.floor(scaledPageHeightPx), remainingHeight)

    pageCanvas.height = sliceHeight
    pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.fillStyle = '#ffffff'
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
    pageContext.drawImage(canvas, 0, currentY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight)

    const pageImageData = pageCanvas.toDataURL('image/png', 1)
    const renderHeight = (sliceHeight * renderWidth) / canvas.width

    if (pageIndex > 0) {
      pdf.addPage()
    }

    pdf.addImage(pageImageData, 'PNG', pageMargin, pageMargin, renderWidth, renderHeight, undefined, 'FAST')

    currentY += sliceHeight
    pageIndex += 1
  }

  const safeName = filenameBase.replace(/[^\w.-]+/g, '-').slice(0, 120) || 'document'
  pdf.save(`${safeName}.pdf`)
}
