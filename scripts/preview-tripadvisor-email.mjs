/**
 * Write a sample lean transactional email HTML (with Tripadvisor card) for visual QA.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { buildLeanTransactionalEmailHtml } from '../server/lean-email-shell.mjs'
import { finalizeGsolEmailHtml } from '../server/email-layout.mjs'

const html = finalizeGsolEmailHtml(
  buildLeanTransactionalEmailHtml({
    documentTitle: 'Golf Sol Ireland — Tripadvisor email preview',
    preheader: 'Preview of customer email Tripadvisor announcement',
    kicker: 'Trip update · preview',
    title: 'Your Costa del Sol trip update',
    lead: 'Hi Sean, a quick preview of the customer email shell with the Tripadvisor announcement.',
    rows: [
      ['Reference', 'GSOL-PREVIEW'],
      ['Step', 'Trip complete']
    ],
    cta: { href: 'https://www.golfsolirl.com/portal', label: 'Open your trip desk' },
    footerHtml: 'Preview only · All payments handled in Ireland.',
    includePastCustomersGallery: true
  })
)

mkdirSync('/opt/cursor/artifacts', { recursive: true })
const out = '/opt/cursor/artifacts/tripadvisor-customer-email-preview.html'
writeFileSync(out, html, 'utf8')
console.log('wrote', out)
