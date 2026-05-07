import ReactDOM from 'react-dom/client'
import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { AppRouteFallback } from './components/app-route-fallback'
import { AuthProvider } from './providers/auth-provider'
import { isGeContentPagePath } from './pages/golf-experience/data/content-pages'
import './index.css'

/** Supabase implicit magic links often land on Site URL (/) with tokens in #hash — route to callback so we strip secrets and run one completion flow. */
if (typeof window !== 'undefined') {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const hash = window.location.hash
  if (path !== '/auth/callback' && hash.includes('access_token=')) {
    window.location.replace(`${window.location.origin}/auth/callback${window.location.search}${hash}`)
  }
}

const GolfExperienceHome = lazy(() =>
  import('./pages/golf-experience/golf-experience-home').then((m) => ({ default: m.GolfExperienceHome }))
)
const TransportServicePage = lazy(() =>
  import('./pages/golf-experience/transport-service-page').then((m) => ({ default: m.TransportServicePage }))
)
const GeContentPage = lazy(() =>
  import('./pages/golf-experience/content-page').then((m) => ({ default: m.GeContentPage }))
)
const ContinueTripPage = lazy(() =>
  import('./pages/continue-trip-page').then((m) => ({ default: m.ContinueTripPage }))
)
const EmailTemplatePreviewPage = lazy(() =>
  import('./pages/email-template-preview').then((m) => ({ default: m.EmailTemplatePreviewPage }))
)
const LogoPreviewPage = lazy(() => import('./pages/logo-preview').then((m) => ({ default: m.LogoPreviewPage })))
const LoginPage = lazy(() => import('./pages/login-page').then((m) => ({ default: m.LoginPage })))
const LoggedOutPage = lazy(() => import('./pages/logged-out-page').then((m) => ({ default: m.LoggedOutPage })))
const AuthCallbackPage = lazy(() =>
  import('./pages/auth-callback-page').then((m) => ({ default: m.AuthCallbackPage }))
)
const ClientDashboardPage = lazy(() =>
  import('./pages/client-dashboard-page').then((m) => ({ default: m.ClientDashboardPage }))
)
const ClientQuotePreviewPage = lazy(() =>
  import('./pages/client-quote-preview-page').then((m) => ({ default: m.ClientQuotePreviewPage }))
)
const AdminDashboardPage = lazy(() =>
  import('./pages/admin-dashboard-page').then((m) => ({ default: m.AdminDashboardPage }))
)
const ClientDocumentPage = lazy(() =>
  import('./pages/client-document-page').then((m) => ({ default: m.ClientDocumentPage }))
)
const CustomerPackagePage = lazy(() =>
  import('./pages/customer-packages').then((m) => ({ default: m.CustomerPackagePage }))
)
const PackageAdminPage = lazy(() => import('./pages/packages').then((m) => ({ default: m.PackageAdminPage })))
const ProposalTemplatePage = lazy(() =>
  import('./pages/proposal-template').then((m) => ({ default: m.ProposalTemplatePage }))
)
const LogoCapturePage = lazy(() => import('./pages/logo-capture').then((m) => ({ default: m.LogoCapturePage })))
const EnquiryPdfTemplatePage = lazy(() =>
  import('./pages/enquiry-pdf-template').then((m) => ({ default: m.EnquiryPdfTemplatePage }))
)
const ProposalPdfSamplePage = lazy(() =>
  import('./pages/proposal-pdf-sample-page').then((m) => ({ default: m.ProposalPdfSamplePage }))
)
const DriverDashboardPage = lazy(() =>
  import('./pages/driver-dashboard-page').then((m) => ({ default: m.DriverDashboardPage }))
)
const RateTripPage = lazy(() => import('./pages/rate-trip-page').then((m) => ({ default: m.RateTripPage })))
const BusinessCardsPage = lazy(() =>
  import('./pages/business-cards-page').then((m) => ({ default: m.BusinessCardsPage }))
)

type PageComponent = LazyExoticComponent<ComponentType>

function syncReadableTypePageClass(path: string) {
  const nonReadableTypePaths = new Set([
    '/dashboard/login',
    '/dashboard/admin/login',
    '/dashboard/quote',
    '/proposal-template',
    '/package-proposal',
    '/proposal-template/admin',
    '/package-proposal/admin',
    '/enquiry-pdf-template',
    '/enquiry-record',
    '/proposal-pdf-sample',
    '/documents/terms',
    '/documents/welcome'
  ])

  document.body.classList.toggle('readable-type-page', !nonReadableTypePaths.has(path))
}

function resolvePage(): PageComponent {
  const normalizedPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '')
  syncReadableTypePageClass(normalizedPath)

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

  if (normalizedPath === '/email-template-preview') {
    return EmailTemplatePreviewPage
  }

  if (normalizedPath === '/golf-sol') {
    return GolfExperienceHome
  }

  if (normalizedPath === '/logo-preview') {
    return LogoPreviewPage
  }

  if (normalizedPath === '/login' || normalizedPath === '/dashboard/login' || normalizedPath === '/dashboard/admin/login') {
    return LoginPage
  }

  if (normalizedPath === '/logged-out') {
    return LoggedOutPage
  }

  if (normalizedPath === '/auth/callback') {
    return AuthCallbackPage
  }

  if (normalizedPath.startsWith('/dashboard/quote/')) {
    return ClientQuotePreviewPage
  }

  if (normalizedPath === '/dashboard') {
    return ClientDashboardPage
  }

  if (normalizedPath === '/dashboard/admin') {
    return AdminDashboardPage
  }

  if (normalizedPath === '/driver') {
    return DriverDashboardPage
  }

  if (normalizedPath === '/rate-trip') {
    return RateTripPage
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

  if (normalizedPath === '/proposal-pdf-sample') {
    return ProposalPdfSamplePage
  }

  if (normalizedPath === '/business-cards') {
    return BusinessCardsPage
  }

  return GolfExperienceHome
}

const ActivePage = resolvePage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Suspense fallback={<AppRouteFallback />}>
      <ActivePage />
    </Suspense>
  </AuthProvider>
)
