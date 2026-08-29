import { GOLFSOL_BRAND_LOGO_SOURCE } from '../../lib/brand-logo-assets'
import {
  buildClientDocumentView,
  formatClientDocumentEuro,
  type ClientDocumentDraft
} from '../../lib/client-enquiry-document'
import { cx } from '../../lib/utils'

type ClientDocumentA4Props = {
  readonly draft: ClientDocumentDraft
  readonly className?: string
}

export function ClientDocumentA4({ draft, className }: ClientDocumentA4Props) {
  const view = buildClientDocumentView(draft)

  return (
    <article
      className={cx('client-document-a4', className)}
      id="client-document-print-root"
    >
      <header className="client-document-a4__letterhead">
        <img
          alt="Golf Sol Ireland"
          className="client-document-a4__logo"
          height={88}
          src={GOLFSOL_BRAND_LOGO_SOURCE}
          width={88}
        />
        <div className="client-document-a4__company">
          <p className="client-document-a4__company-name">{view.company.name}</p>
          <p className="client-document-a4__tagline">{view.company.tagline}</p>
          {view.company.addressLines.map((line: string) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            Ireland {view.company.irishPhone}
            {' · '}
            Spain {view.company.spanishPhone}
          </p>
          <p>
            {view.company.email}
            {' · '}
            {view.company.websiteDisplay}
          </p>
          {view.company.companyReg ? <p>Registered in Ireland · Co. {view.company.companyReg}</p> : null}
        </div>
      </header>

      <h1 className="client-document-a4__title">{view.title}</h1>
      <p className="client-document-a4__meta">Reference: {view.reference}</p>
      <p className="client-document-a4__meta">Date: {view.dateLabel}</p>
      {view.validUntilLabel ? <p className="client-document-a4__meta">Valid until: {view.validUntilLabel}</p> : null}
      {view.subject ? <p className="client-document-a4__meta">Subject: {view.subject}</p> : null}

      {view.preparedFor.length > 0 ? (
        <section className="client-document-a4__section">
          <h2>Prepared for</h2>
          {view.preparedFor.map((line: string) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      ) : null}

      {view.sections.enquiry ? (
        <section className="client-document-a4__section">
          <h2>Customer enquiry</h2>
          <p className="client-document-a4__pre">{view.enquirySummary}</p>
        </section>
      ) : null}

      {view.sections.message ? (
        <section className="client-document-a4__section">
          <h2>Message / response</h2>
          {view.messageBlocks.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <p className="client-document-a4__subhead" key={`h-${i}`}>
                  {block.text}
                </p>
              )
            }
            if (block.type === 'bullets') {
              return (
                <ul key={`b-${i}`}>
                  {block.items.map((item: string) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )
            }
            return (
              <p key={`p-${i}`}>{block.text}</p>
            )
          })}
        </section>
      ) : null}

      {view.sections.pricing ? (
        <section className="client-document-a4__section">
          <h2>{view.pricing.mode === 'single' ? 'Price' : 'Quotation'}</h2>
          {view.pricing.mode === 'single' && view.pricing.lines.length <= 1 ? (
            <div className="client-document-a4__single-price">
              <p>{view.pricing.lines[0]?.description || 'Total'}</p>
              <p className="client-document-a4__amount">{formatClientDocumentEuro(view.pricing.total)}</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {view.pricing.lines.map((line, i) => (
                    <tr key={line.id ?? `${line.description}-${i}`}>
                      <td>{line.description}</td>
                      <td>{line.qty}</td>
                      <td>{formatClientDocumentEuro(line.unitPrice)}</td>
                      <td>{formatClientDocumentEuro(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <dl className="client-document-a4__totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatClientDocumentEuro(view.pricing.subtotal)}</dd>
                </div>
                {view.pricing.vatEnabled ? (
                  <div>
                    <dt>VAT ({view.pricing.vatPercent}%)</dt>
                    <dd>{formatClientDocumentEuro(view.pricing.vatAmount)}</dd>
                  </div>
                ) : null}
                <div className="client-document-a4__grand">
                  <dt>Total</dt>
                  <dd>{formatClientDocumentEuro(view.pricing.total)}</dd>
                </div>
              </dl>
            </>
          )}
        </section>
      ) : null}

      {view.sections.notes ? (
        <section className="client-document-a4__section">
          <h2>Additional notes</h2>
          <p className="client-document-a4__pre">{view.notes}</p>
        </section>
      ) : null}

      {view.sections.terms ? (
        <section className="client-document-a4__section">
          <h2>Terms</h2>
          <p className="client-document-a4__pre client-document-a4__terms">{view.terms}</p>
        </section>
      ) : null}

      {view.sections.payment ? (
        <section className="client-document-a4__section">
          <h2>Payment information</h2>
          <p className="client-document-a4__pre">{view.paymentDetails}</p>
        </section>
      ) : null}

      {view.sections.signature ? (
        <section className="client-document-a4__section">
          <h2>Acceptance</h2>
          <p className="client-document-a4__sig">Accepted by: ________________________________</p>
          <p className="client-document-a4__sig">Signature: ___________________________________</p>
          <p className="client-document-a4__sig">Date: ________________________________________</p>
        </section>
      ) : null}

      <footer className="client-document-a4__footer">{view.footerLine}</footer>
    </article>
  )
}
