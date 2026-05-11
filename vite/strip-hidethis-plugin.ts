import type { Plugin } from 'vite'

/**
 * Removes `[hidethis]…` markers from source during production builds only.
 * Dev server leaves sources untouched so drafts stay visible locally.
 */
export function stripHidethisPlugin(): Plugin {
  let strip = false

  return {
    name: 'strip-hidethis',
    enforce: 'pre',
    apply: 'build',
    configResolved(config) {
      strip = config.isProduction
    },
    transform(code, id) {
      if (!strip) {
        return null
      }
      if (!/\.[cm]?[tj]sx?$/.test(id)) {
        return null
      }
      if (!code.includes('[hidethis]')) {
        return null
      }
      let out = code
      // JSX comment wrappers (markers alone would leave `{/* ` behind): `{/* [hidethis] */}` … `{/* [endhidethis] */}`
      out = out.replace(/\{\/\*\s*\[hidethis\]\s*\*\/\}[\s\S]*?\{\/\*\s*\[endhidethis\]\s*\*\/\}/g, '')
      // Block form: [hidethis] … [endhidethis] (multiline)
      out = out.replace(/\[hidethis\][\s\S]*?\[endhidethis\]/g, '')
      // Inline / rest-of-line: [hidethis] then everything until newline
      out = out.replace(/\[hidethis\][^\r\n]*/g, '')
      if (out === code) {
        return null
      }
      return { code: out, map: null }
    }
  }
}
