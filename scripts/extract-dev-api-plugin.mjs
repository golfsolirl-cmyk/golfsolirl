import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const viteConfig = readFileSync(join(root, 'vite.config.ts'), 'utf8')
const start = viteConfig.indexOf('const readRequestBody')
const end = viteConfig.indexOf('\n/** DNS + TLS handshake for Supabase')
if (start < 0 || end < 0) {
  throw new Error('Could not find slice markers in vite.config.ts')
}

let block = viteConfig.slice(start, end)
block = block.replace('const devEnquiryApiPlugin', 'export const devEnquiryApiPlugin')
block = block.replaceAll(`import('./server/`, `import('../server/`)

/** @param {string} needle @param {string} insertAfter */
const afterTry = (needle, insertAfter) => {
  const i = block.indexOf(needle)
  if (i < 0) throw new Error('Needle not found:\n' + needle)
  const j = block.indexOf('try {', i)
  if (j < 0 || j > i + 400) throw new Error('try not found after:\n' + needle.slice(0, 60))
  block = block.slice(0, j + 'try {'.length) + '\n        ' + insertAfter + block.slice(j + 'try {'.length)
}

afterTry(
  "server.middlewares.use('/api/enquiry'",
  "const { handleEnquirySubmission } = await import('../server/enquiry-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/terms-email'",
  "const { handleTermsEmailRequest } = await import('../server/enquiry-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/sync-portal-profile'",
  "const { handleSyncPortalProfile } = await import('../server/sync-portal-profile-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/portal-contact-setup'",
  "const { handlePortalContactSetup } = await import('../server/portal-contact-setup-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/auth/magic-link'",
  "const { handleMagicLinkRequest } = await import('../server/magic-link-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/proposal-pdf'",
  "const { createProposalFilename, createProposalPdf } = await import('../server/proposal-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/send-client-document'",
  "const { handleSendClientDocument } = await import('../server/send-client-document-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/send-proposal-to-client'",
  "const { handleSendProposalToClient } = await import('../server/send-proposal-client-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/admin-portal-client'",
  "const { handleAdminPortalClient } = await import('../server/admin-portal-client-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/portal-interest-ticket-reply'",
  "const { handlePortalInterestTicketReply } = await import('../server/portal-interest-ticket-reply-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-notify'",
  "const { handleTransferBookingNotify } = await import('../server/transfer-booking-notify-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-reject-no-driver'",
  "const { handleTransferRejectNoDriver } = await import('../server/transfer-booking-no-driver-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/portal-link-verify'",
  "const { handlePortalLinkVerify } = await import('../server/portal-link-context-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/portal-link-issue'",
  "const { handlePortalLinkIssue } = await import('../server/portal-link-context-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-booking-sweep'",
  "const { handleTransferBookingNoDriverSweep } = await import('../server/transfer-booking-no-driver-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-balance-reminder-sweep'",
  "const { handleTransferBalanceReminderSweep } = await import('../server/transfer-payment-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-payment-admin'",
  "const { handleTransferPaymentAdmin } = await import('../server/transfer-payment-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/package-build-admin-publish'",
  "const { handlePackageBuildAdminPublish } = await import('../server/package-build-admin-publish-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-refund'",
  "const { handleTransferRefund } = await import('../server/transfer-refund-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-checkout'",
  "const { handleTransferStripeCheckout } = await import('../server/transfer-checkout-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/stripe-webhook'",
  "const { readIncomingMessageBodyBuffer } = await import('../server/vercel-read-body.mjs')\n        const { handleStripeWebhook } = await import('../server/stripe-webhook-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/transfer-checkout-sync'",
  "const { handleTransferCheckoutSync } = await import('../server/transfer-checkout-sync-service.mjs')"
)
afterTry(
  "server.middlewares.use('/api/portal-invoice-send'",
  "const { handlePortalInvoiceSend } = await import('../server/portal-invoice-send-service.mjs')"
)

block = block.replace(
  "    workspaceEmailApi('/api/send-workspace-proposal', handleSendWorkspaceProposalToClient)\n    workspaceEmailApi('/api/send-hotel-brief', handleSendHotelReservationBrief)\n\n    workspaceEmailApi('/api/send-client-portal-email', handleSendClientPortalEmail)\n    workspaceEmailApi('/api/send-website-quote-email', handleSendWebsiteQuoteEmail)",
  `    workspaceEmailApi('/api/send-workspace-proposal', async (body, env, meta) => {
      const { handleSendWorkspaceProposalToClient } = await import('../server/admin-workspace-email-service.mjs')
      return handleSendWorkspaceProposalToClient(body, env, meta)
    })
    workspaceEmailApi('/api/send-hotel-brief', async (body, env, meta) => {
      const { handleSendHotelReservationBrief } = await import('../server/admin-workspace-email-service.mjs')
      return handleSendHotelReservationBrief(body, env, meta)
    })

    workspaceEmailApi('/api/send-client-portal-email', async (body, env, meta) => {
      const { handleSendClientPortalEmail } = await import('../server/client-portal-email-service.mjs')
      return handleSendClientPortalEmail(body, env, meta)
    })
    workspaceEmailApi('/api/send-website-quote-email', async (body, env, meta) => {
      const { handleSendWebsiteQuoteEmail } = await import('../server/website-quote-email.mjs')
      return handleSendWebsiteQuoteEmail(body, env, meta)
    })`
)

const header = `import type { ViteDevServer } from 'vite'

`
const blockWithType = block.replace(
  'configureServer(server: import(\'vite\').ViteDevServer)',
  'configureServer(server: ViteDevServer)'
)

writeFileSync(join(root, 'vite/dev-enquiry-api-plugin.ts'), header + blockWithType)
console.log('Wrote vite/dev-enquiry-api-plugin.ts')
