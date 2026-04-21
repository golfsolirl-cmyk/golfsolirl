import ReactDOM from 'react-dom/client'
import { AuthProvider } from './providers/auth-provider'
import { LogoPreviewPage } from './pages/logo-preview'
import { CustomerPackagePage } from './pages/customer-packages'
import { PackageAdminPage } from './pages/packages'
import { EnquiryPdfTemplatePage } from './pages/enquiry-pdf-template'
import { ProposalTemplatePage } from './pages/proposal-template'
import { LogoCapturePage } from './pages/logo-capture'
import { FooterArticlePage } from './pages/footer-article-page'
import { LoginPage } from './pages/login-page'
import { AuthCallbackPage } from './pages/auth-callback-page'
import { ClientDashboardPage } from './pages/client-dashboard-page'
import { AdminDashboardPage } from './pages/admin-dashboard-page'
import { ClientDocumentPage } from './pages/client-document-page'
import { PublicSiteShell } from './components/public/public-site-shell'
import { isFooterArticlePath } from './data/footer-article-pages'
import { GolfExperienceHome } from './pages/golf-experience/golf-experience-home'
import { TransportServicePage } from './pages/golf-experience/transport-service-page'
import { GeContentPage } from './pages/golf-experience/content-page'
import { ContinueTripPage } from './pages/continue-trip-page'
import { isGeContentPagePath } from './pages/golf-experience/data/content-pages'
import { usePageMetadata } from './lib/page-metadata'
import './index.css'

function NotFoundPage() {
  usePageMetadata({
    title: 'Page not found',
    description: 'The page you requested could not be found.',
    canonicalPath: window.location.pathname,
    noindex: true
  })

  return (
    <PublicSiteShell>
      <main
        id="main"
        className="flex min-h-[70vh] items-center justify-center bg-[linear-gradient(180deg,#F4F7F5_0%,#FFFFFF_100%)] px-5 py-16"
      >
        <div className="max-w-lg rounded-2xl border border-gs-dark/10 bg-white p-8 text-center shadow-[0_24px_60px_rgba(6,59,42,0.12)]">
          <p className="font-ge text-sm font-bold uppercase tracking-[0.18em] text-ge-orange">Page not found</p>
          <h1 className="mt-3 font-ge text-[2rem] font-extrabold leading-tight text-gs-green sm:text-[2.4rem]">
            This page may have moved
          </h1>
          <p className="mt-3 font-ge text-base leading-7 text-ge-gray500">
            Return to the homepage to keep planning your Costa del Sol golf trip.
          </p>
          <a
            href="/"
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gs-green px-6 py-3 font-ge text-base font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gs-electric hover:text-gs-dark"
          >
            Back home
          </a>
        </div>
      </main>
    </PublicSiteShell>
  )
}

function resolvePage() {
  const normalizedPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '')

  if (normalizedPath === '/') {
    return GolfExperienceHome
  }

  if (normalizedPath === '/services/transport') {
    return TransportServicePage
  }

  if (isGeContentPagePath(normalizedPath)) {
    return GeContentPage
  }

  if (normalizedPath === '/continue-trip') {
    return ContinueTripPage
  }

  if (normalizedPath === '/golf-sol') {
    return GolfExperienceHome
  }

  if (normalizedPath === '/logo-preview') {
    return LogoPreviewPage
  }

  if (normalizedPath === '/login') {
    return LoginPage
  }

  if (normalizedPath === '/auth/callback') {
    return AuthCallbackPage
  }

  if (normalizedPath === '/dashboard') {
    return ClientDashboardPage
  }

  if (normalizedPath === '/dashboard/admin') {
    return AdminDashboardPage
  }

  if (normalizedPath === '/documents/terms' || normalizedPath === '/documents/welcome') {
    return ClientDocumentPage
  }

  if (normalizedPath === '/packages' || normalizedPath === '/package') {
    return CustomerPackagePage
  }

  if (normalizedPath === '/packages-admin' || normalizedPath === '/package-admin') {
    return PackageAdminPage
  }

  if (
    normalizedPath === '/proposal-template' ||
    normalizedPath === '/package-proposal' ||
    normalizedPath === '/proposal-template/admin' ||
    normalizedPath === '/package-proposal/admin'
  ) {
    return ProposalTemplatePage
  }

  if (normalizedPath === '/logo-capture') {
    return LogoCapturePage
  }

  if (normalizedPath === '/enquiry-pdf-template' || normalizedPath === '/enquiry-record') {
    return EnquiryPdfTemplatePage
  }

  if (isFooterArticlePath(normalizedPath)) {
    return FooterArticlePage
  }

  return NotFoundPage
}

const ActivePage = resolvePage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ActivePage />
  </AuthProvider>
)
