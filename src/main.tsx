import ReactDOM from 'react-dom/client'
import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { AppErrorBoundary } from './components/app-error-boundary'
import { pathnameNeedsImmediateSupabaseHydration } from './lib/auth-bootstrap-path'
import { CookieConsent } from './components/cookie-consent'
import { MotionRoot } from './providers/motion-root'
import { isGeContentPagePath } from './pages/golf-experience/data/ge-content-page-paths'
import { bundleRedirectForPath } from './lib/bundle-route-redirects'
/** Homepage only is eager — keeps LCP path short; other marketing pages load as route chunks. */
import { GolfExperienceHome } from './pages/golf-experience/golf-experience-home'
import './index.css'
import './theme/ge-page-token-overrides.css'
import './theme/site-readable-typography.css'

/** Supabase implicit magic links often land on Site URL (/) with tokens in #hash — route to callback so we strip secrets and run one completion flow. */
if (typeof window !== 'undefined') {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const hash = window.location.hash
  if (path !== '/auth/callback' && hash.includes('access_token=')) {
    window.location.replace(`${window.location.origin}/auth/callback${window.location.search}${hash}`)
  }
}

const TransportServicePage = lazy(() =>
  import('./pages/golf-experience/transport-service-page').then((m) => ({ default: m.TransportServicePage }))
)
const BundlesPage = lazy(() =>
  import('./pages/golf-experience/bundles-page').then((m) => ({ default: m.BundlesPage }))
)
const LeaveAReviewPage = lazy(() =>
  import('./pages/leave-a-review-page').then((m) => ({ default: m.LeaveAReviewPage }))
)
const GeContentPage = lazy(() =>
  import('./pages/golf-experience/content-page').then((m) => ({ default: m.GeContentPage }))
)
const RedirectToBundlesPage = lazy(() =>
  import('./pages/redirect-to-bundles-page').then((m) => ({ default: m.RedirectToBundlesPage }))
)
const ContinueTripPage = lazy(() =>
  import('./pages/continue-trip-page').then((m) => ({ default: m.ContinueTripPage }))
)
const EmailTemplatePreviewPage = lazy(() =>
  import('./pages/email-template-preview').then((m) => ({ default: m.EmailTemplatePreviewPage }))
)
const LogoPreviewPage = lazy(() => import('./pages/logo-preview').then((m) => ({ default: m.LogoPreviewPage })))
const LoginPage = lazy(() => import('./pages/login-page').then((m) => ({ default: m.LoginPage })))
const AdminPasswordLoginPage = lazy(() =>
  import('./pages/admin-password-login-page').then((m) => ({ default: m.AdminPasswordLoginPage }))
)
const PortalTokenLoginPage = lazy(() =>
  import('./pages/portal-token-login-page').then((m) => ({ default: m.PortalTokenLoginPage }))
)
const PortalLoginPage = lazy(() =>
  import('./pages/portal-login-page').then((m) => ({ default: m.PortalLoginPage }))
)
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
const UnifiedPdfSamplePage = lazy(() =>
  import('./pages/unified-pdf-sample-page').then((m) => ({ default: m.UnifiedPdfSamplePage }))
)
const HomepageBrandedPdfSamplePage = lazy(() =>
  import('./pages/homepage-branded-pdf-sample-page').then((m) => ({ default: m.HomepageBrandedPdfSamplePage }))
)
const DriverDashboardPage = lazy(() =>
  import('./pages/driver-dashboard-page').then((m) => ({ default: m.DriverDashboardPage }))
)
const RateTripPage = lazy(() => import('./pages/rate-trip-page').then((m) => ({ default: m.RateTripPage })))
const QuoteReplyPage = lazy(() => import('./pages/quote-reply-page').then((m) => ({ default: m.QuoteReplyPage })))
const BusinessCardsPage = lazy(() =>
  import('./pages/business-cards-page').then((m) => ({ default: m.BusinessCardsPage }))
)
const CinematicHomePage = lazy(() =>
  import('./pages/cinematic-home/cinematic-home-page').then((m) => ({ default: m.CinematicHomePage }))
)
const GolfExperienceHomeTest = lazy(() =>
  import('./pages/golf-experience/golf-experience-home-test').then((m) => ({
    default: m.GolfExperienceHomeTest,
  }))
)
const BrandIdentityMockupPage = lazy(() =>
  import('./pages/brand-mockup/brand-identity-mockup-page').then((m) => ({ default: m.BrandIdentityMockupPage }))
)
const BrandLogosPage = lazy(() =>
  import('./pages/brand-logos-page').then((m) => ({ default: m.BrandLogosPage }))
)

const NotFoundPage = lazy(() => import('./pages/not-found-page').then((m) => ({ default: m.NotFoundPage })))

type PageComponent = ComponentType | LazyExoticComponent<ComponentType>

/** Print/PDF layout routes keep exact typography (no site-wide bump or card resize). */
const SITE_READABLE_OFF_PATHS = new Set([
  '/proposal-template',
  '/package-proposal',
  '/proposal-template/admin',
  '/package-proposal/admin',
  '/enquiry-pdf-template',
  '/enquiry-record',
  '/proposal-pdf-sample',
  '/unified-pdf-sample',
  '/homepage-client-pdf-sample',
  '/email-template-preview'
])

function syncSiteReadableClass(path: string) {
  const locked = SITE_READABLE_OFF_PATHS.has(path)
  document.body.classList.toggle('site-readable', !locked)
  document.body.classList.toggle('site-readable-off', locked)
  /* legacy class — keep in sync for any remaining references */
  document.body.classList.toggle('readable-type-page', !locked)
}

function resolvePage(): PageComponent {
  const normalizedPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '')
  syncSiteReadableClass(normalizedPath)

  if (normalizedPath === '/homepagetest') {
    return GolfExperienceHomeTest
  }

  if (normalizedPath === '/') {
    return GolfExperienceHome
  }

  if (normalizedPath === '/services/transport') {
    return TransportServicePage
  }

  if (normalizedPath === '/bundles') {
    return BundlesPage
  }

  if (bundleRedirectForPath(normalizedPath)) {
    return RedirectToBundlesPage
  }

  if (normalizedPath === '/leave-a-review') {
    return LeaveAReviewPage
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

  if (normalizedPath === '/admin/login') {
    return AdminPasswordLoginPage
  }

  if (normalizedPath === '/portal') {
    return PortalLoginPage
  }

  if (normalizedPath.startsWith('/portal/') && normalizedPath.length > '/portal/'.length) {
    return PortalTokenLoginPage
  }

  if (
    normalizedPath === '/login' ||
    normalizedPath === '/dashboard/login' ||
    normalizedPath === '/dashboard/admin/login' ||
    normalizedPath === '/driver/login'
  ) {
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

  if (normalizedPath.startsWith('/quote-reply/')) {
    return QuoteReplyPage
  }

  if (normalizedPath === '/documents/terms' || normalizedPath === '/documents/welcome') {
    return ClientDocumentPage
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

  if (normalizedPath === '/unified-pdf-sample') {
    return UnifiedPdfSamplePage
  }

  if (normalizedPath === '/homepage-client-pdf-sample') {
    return HomepageBrandedPdfSamplePage
  }

  if (normalizedPath === '/business-cards') {
    return BusinessCardsPage
  }

  if (normalizedPath === '/brand-mockup') {
    return BrandIdentityMockupPage
  }

  if (normalizedPath === '/brand-logos' || normalizedPath === '/logos') {
    return BrandLogosPage
  }

  if (
    normalizedPath === '/cinematic-home' ||
    normalizedPath === '/homepage-v2' ||
    normalizedPath === '/preview'
  ) {
    return CinematicHomePage
  }

  return NotFoundPage
}

const ActivePage = resolvePage()

const normalizedBootstrapPath =
  window.location.pathname === '/' || window.location.pathname === ''
    ? '/'
    : window.location.pathname.replace(/\/+$/, '')

const AuthProviderShell = lazy(() =>
  pathnameNeedsImmediateSupabaseHydration(normalizedBootstrapPath)
    ? import('./providers/auth-provider-sync').then((m) => ({ default: m.AuthProvider }))
    : import('./providers/auth-provider-deferred').then((m) => ({ default: m.AuthProvider }))
)

const WhatsappFab = lazy(() =>
  import('./pages/golf-experience/components/whatsapp-fab').then((m) => ({ default: m.WhatsappFab }))
)

/** Login / auth surfaces stay a single centred card — no floating marketing chrome. */
const isMinimalAuthPath = (path: string) => {
  if (path === '/portal' || path === '/admin/login' || path === '/logged-out' || path === '/login') {
    return true
  }
  if (path.startsWith('/portal/')) {
    return true
  }
  if (
    path === '/dashboard/login' ||
    path === '/dashboard/admin/login' ||
    path === '/driver/login' ||
    path === '/auth/callback'
  ) {
    return true
  }
  return false
}

const showSiteWhatsappFab = !isMinimalAuthPath(normalizedBootstrapPath)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <Suspense fallback={null}>
      <AuthProviderShell>
        <MotionRoot>
          <ActivePage />
          <CookieConsent />
          {/* One site-wide compact dismissible WhatsApp FAB (+353) — not the old full-width box. */}
          {showSiteWhatsappFab ? (
            <Suspense fallback={null}>
              <WhatsappFab />
            </Suspense>
          ) : null}
        </MotionRoot>
      </AuthProviderShell>
    </Suspense>
  </AppErrorBoundary>
)
