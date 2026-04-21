const DEFAULT_WHATSAPP_TEXT_LIMIT = 1800

export function compactMessageLines(lines: readonly (string | null | undefined | false)[]) {
  return lines.filter((line): line is string => typeof line === 'string' && line.trim().length > 0).join('\n')
}

export function buildWhatsAppHref(baseHref: string, text: string, limit = DEFAULT_WHATSAPP_TEXT_LIMIT) {
  const trimmed = text.trim()
  const safeText =
    trimmed.length > limit
      ? `${trimmed.slice(0, Math.max(limit - 3, 0)).trimEnd()}...`
      : trimmed

  try {
    const url = new URL(baseHref)
    url.searchParams.set('text', safeText)
    return url.toString()
  } catch {
    const separator = baseHref.includes('?') ? '&' : '?'
    return `${baseHref}${separator}text=${encodeURIComponent(safeText)}`
  }
}

export function buildWhatsAppNumberHref(phoneTel: string, text: string, limit = DEFAULT_WHATSAPP_TEXT_LIMIT) {
  const digitsOnly = phoneTel.replace(/[^0-9]/g, '')
  return buildWhatsAppHref(`https://wa.me/${digitsOnly}`, text, limit)
}

export function formatPeopleLabel(count: number, singular = 'person', plural = 'people') {
  return `${count} ${count === 1 ? singular : plural}`
}
