# PDF Document Samples — Golf Sol Ireland

Generated: Wednesday 27 May 2026 at 15:15

## Folder Structure

### 1-enquiry-pack/
Email attachments sent when a customer submits an enquiry form.
- **enquiry-acknowledgement.pdf** — Summary of what the customer submitted
- **terms-and-conditions.pdf** — Full T&Cs document
- **traveller-contacts.pdf** — Costa del Sol emergency/useful contacts
- **packing-checklist.pdf** — Golf trip packing list

### 2-formal-proposal/
Sent by admin to clients as a detailed pricing proposal.
- **formal-proposal.pdf** — Multi-page proposal with fleet image, pricing, terms

### 3-transfer-portal-paper-trail/
Stored in Supabase Storage; shown on client dashboard under "Your paper trail".
- **original-request-snapshot.pdf** — What the client originally requested
- **transfer-vat-quote.pdf** — Quoted price with full VAT breakdown
- **terms-summary.pdf** — Short terms summary (1 page)
- **deposit-receipt.pdf** — After deposit card payment via Stripe
- **paid-in-full-confirmation.pdf** — After full payment via Stripe

### 4-portal-invoice/
Trip invoice sent to client from admin dashboard.
- **trip-invoice.pdf** — Formal invoice with amount, reference, client details

### 5-transfer-refund/
Generated when admin processes a partial or full refund.
- **refund-confirmation.pdf** — Refund amount, Stripe references, route

### 6-homepage-branded-document/
Branded trip overview document (homepage-style layout).
- **homepage-client-document.pdf** — Visual overview of the client's trip

### 7-unified-template-reference/
Design reference showing the unified PDF shell layout.
- **unified-document-template.pdf** — Logo, headers, key-value tables, gold rules

### 8-branded-layout-reference/
Design reference showing the branded header bar layout.
- **branded-layout-sample.pdf** — Green bar + crest + cream page style

---

## Client-Side (Browser) PDFs (not generated here)

These are created in the browser using jsPDF + html2canvas or pdf-lib:
- **Quote preview** — Rasterised page capture of the quote page
- **Proposal template export** — DOM-to-PDF of the proposal preview
- **Business cards** — Front/back card layouts + proof sheets
- **Transfer quote/invoice** — pdf-lib VAT summary (same design as server version)
- **Generic DOM export** — Any page section saved as PDF

These require a running browser and cannot be generated as static samples.
