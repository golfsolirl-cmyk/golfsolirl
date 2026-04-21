import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './providers/auth-provider'
import { DesignThemeProvider } from './providers/design-theme-provider'
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

  return GolfExperienceHome
}

const ActivePage = resolvePage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <DesignThemeProvider>
    <AuthProvider>
      <ActivePage />
    </AuthProvider>
  </DesignThemeProvider>
)
