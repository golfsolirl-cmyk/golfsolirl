import ReactDOM from 'react-dom/client'
import { AlertCircle } from 'lucide-react'
import App from './App'
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
import { isFooterArticlePath } from './data/footer-article-pages'
import { GolfExperienceHome } from './pages/golf-experience/golf-experience-home'
import { TransportServicePage } from './pages/golf-experience/transport-service-page'
import { GeContentPage } from './pages/golf-experience/content-page'
import { ContinueTripPage } from './pages/continue-trip-page'
import { isGeContentPagePath } from './pages/golf-experience/data/content-pages'
import './index.css'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gs-bg px-5 py-24 font-ge text-gs-dark">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-[2rem] border border-gs-dark/10 bg-white p-8 text-center shadow-[0_24px_60px_rgba(6,59,42,0.08)] sm:p-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gs-gold/18 text-gs-green">
          <AlertCircle className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-ge-orange">Page not found</p>
        <h1 className="mt-3 text-[2rem] font-extrabold leading-tight sm:text-[2.6rem]">
          That page does not exist on GolfSol Ireland
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-ge-gray500">
          Use the homepage to browse packages, courses, accommodation, transfers, and tailored planning support.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full bg-gs-green px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-gs-electric hover:text-gs-dark"
        >
          Back to homepage
        </a>
      </div>
    </div>
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
    return App
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
