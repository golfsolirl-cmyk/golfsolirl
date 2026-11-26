import ReactDOM from 'react-dom/client'
import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react'
import { AppErrorBoundary } from './components/app-error-boundary'
import { pathnameNeedsImmediateSupabaseHydration } from './lib/auth-bootstrap-path'
import { CookieConsent } from './components/cookie-consent'
import { MotionRoot } from './providers/motion-root'
import { isGeContentPagePath } from './pages/golf-experience/data/ge-content-page-paths'
import { bundleRedirectForPath } from './lib/bundle-route-redirects'
import { AuthProvider as AuthProviderDeferred } from './providers/auth-provider-deferred'
import { AuthProvider as AuthProviderSync } from './providers/auth-provider-sync'

/** Main public surfaces are eager — no Suspense spinners / blank folds on first paint. */
import { GolfExperienceHome } from './pages/golf-experience/golf-experience-home'
import { TransportServicePage } from './pages/golf-experience/transport-service-page'
import { BundlesPage } from './pages/golf-experience/bundles-page'
import { QuotePage } from './pages/golf-experience/quote-page'
import { GeContentPage } from './pages/golf-experience/content-page'
import { RedirectToBundlesPage } from './pages/redirect-to-bundles-page'
import { LoginPage } from './pages/login-page'
import { AdminPasswordLoginPage } from './pages/admin-password-login-page'
import { PortalTokenLoginPage } from './pages/portal-token-login-page'
import { PortalLoginPage } from './pages/portal-login-page'
import { LoggedOutPage } from './pages/logged-out-page'
import { NotFoundPage } from './pages/not-found-page'

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

/** Heavier / admin / rare routes stay code-split. */
const LeaveAReviewPage = lazy(() =>
  import('./pages/leave-a-review-page').then((m) => ({ default: m.LeaveAReviewPage }))
)
const ContinueTripPage = lazy(() =>
  import('./pages/continue-trip-page').then((m) => ({ default: m.ContinueTripPage }))
)
const EmailTemplatePreviewPage = lazy(() =>
  import('./pages/email-template-preview').then((m) => ({ default: m.EmailTemplatePreviewPage }))
)
const LogoPreviewPage = lazy(() => import('./pages/logo-preview').then((m) => ({ default: m.LogoPreviewPage })))
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
    default: m.GolfExperienceHomeTest
  }))
)
const BrandIdentityMockupPage = lazy(() =>
  import('./pages/brand-mockup/brand-identity-mockup-page').then((m) => ({ default: m.BrandIdentityMockupPage }))
)
const BrandLogosPage = lazy(() =>
  import('./pages/brand-logos-page').then((m) => ({ default: m.BrandLogosPage }))
)
const AdminBrandKitPage = lazy(() =>
  import('./pages/admin-brand-kit-page').then((m) => ({ default: m.AdminBrandKitPage }))
)
const PublicBrandKitPage = lazy(() =>
  import('./pages/public-brand-kit-page').then((m) => ({ default: m.PublicBrandKitPage }))
)
const TowAdminEnquiriesPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-enquiries-page').then((m) => ({ default: m.TowAdminEnquiriesPage }))
)
const TowAdminEnquiryDetailPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-enquiry-detail-page').then((m) => ({
    default: m.TowAdminEnquiryDetailPage
  }))
)
const TowAdminCustomersPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-customers-page').then((m) => ({ default: m.TowAdminCustomersPage }))
)
const TowAdminCustomerDetailPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-customer-detail-page').then((m) => ({
    default: m.TowAdminCustomerDetailPage
  }))
)
const TowAdminSignaturePage = lazy(() =>
  import('./pages/tow-admin/tow-admin-signature-page').then((m) => ({ default: m.TowAdminSignaturePage }))
)
const TowAdminOfferPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-offer-page').then((m) => ({ default: m.TowAdminOfferPage }))
)
const TowAdminEmailsPage = lazy(() =>
  import('./pages/tow-admin/tow-admin-emails-page').then((m) => ({ default: m.TowAdminEmailsPage }))
)

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

  if (normalizedPath === '/quote') {
    return QuotePage
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

  if (normalizedPath === '/admin' || normalizedPath === '/admin/enquiries') {
    return TowAdminEnquiriesPage
  }

  if (normalizedPath.startsWith('/admin/enquiries/')) {
    return TowAdminEnquiryDetailPage
  }

  if (normalizedPath === '/admin/customers') {
    return TowAdminCustomersPage
  }

  if (normalizedPath.startsWith('/admin/customers/')) {
    return TowAdminCustomerDetailPage
  }

  if (normalizedPath === '/admin/signature') {
    return TowAdminSignaturePage
  }

  if (normalizedPath === '/admin/offer') {
    return TowAdminOfferPage
  }

  if (normalizedPath === '/admin/emails') {
    return TowAdminEmailsPage
  }

  if (normalizedPath === '/admin/brand') {
    return AdminBrandKitPage
  }

  if (normalizedPath === '/brand' || normalizedPath.startsWith('/brand/')) {
    return PublicBrandKitPage
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

const AuthProviderShell = pathnameNeedsImmediateSupabaseHydration(normalizedBootstrapPath)
  ? AuthProviderSync
  : AuthProviderDeferred

const Page = ActivePage as ComponentType

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <AuthProviderShell>
      <MotionRoot>
        {/* Suspense only matters for remaining lazy admin/rare routes; eager public pages resolve immediately. */}
        <Suspense fallback={<div className="min-h-[40vh] w-full bg-offwhite" aria-hidden />}>
          <Page />
        </Suspense>
        <CookieConsent />
      </MotionRoot>
    </AuthProviderShell>
  </AppErrorBoundary>
)
