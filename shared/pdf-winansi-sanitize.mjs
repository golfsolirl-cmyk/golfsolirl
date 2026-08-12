/**
 * pdf-lib StandardFonts (Helvetica) use WinAnsi — many Unicode code points throw at drawText.
 * Use this for any user- or CMS-supplied strings before measuring or drawing.
 */
export const sanitizeStandardFontText = (value) =>
  String(value ?? '')
    .replace(/\u2192/g, '->') // →
    .replace(/\u2190/g, '<-')
    .replace(/\u2194/g, '<->')
    .replace(/\u2014/g, '-') // em dash
    .replace(/\u2013/g, '-') // en dash
    .replace(/\u2019/g, "'") // right single quote
    .replace(/\u2018/g, "'") // left single quote
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2026/g, '...') // ellipsis
    .replace(/\u2022/g, '*') // bullet
    .replace(/\u2605/g, '*')
    .replace(/\u2606/g, '*')
    .replace(/\u00a0/g, ' ') // nbsp
    // Helvetica / WinAnsi has no euro glyph — Intl currency would become "?"
    .replace(/\u20AC/g, 'EUR ')
    .replace(/€/g, 'EUR ')
