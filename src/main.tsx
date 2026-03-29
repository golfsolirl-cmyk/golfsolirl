import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LogoPreviewPage } from './pages/logo-preview'
import { CustomerPackagePage } from './pages/customer-packages'
import { PackageAdminPage } from './pages/packages'
import { EnquiryPdfTemplatePage } from './pages/enquiry-pdf-template'
import { ProposalTemplatePage } from './pages/proposal-template'
import { LogoCapturePage } from './pages/logo-capture'
import './index.css'

function resolvePage() {
  const normalizedPath = window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/+$/, '')

  if (normalizedPath === '/logo-preview') {
    return LogoPreviewPage
  }

  if (normalizedPath === '/packages' || normalizedPath === '/package') {
    return CustomerPackagePage
  }

  if (normalizedPath === '/packages-admin' || normalizedPath === '/package-admin') {
    return PackageAdminPage
  }

  if (normalizedPath === '/proposal-template' || normalizedPath === '/package-proposal') {
    return ProposalTemplatePage
  }

  if (normalizedPath === '/logo-capture') {
    return LogoCapturePage
  }

  if (normalizedPath === '/enquiry-pdf-template' || normalizedPath === '/enquiry-record') {
    return EnquiryPdfTemplatePage
  }

  return App
}

const ActivePage = resolvePage()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ActivePage />
  </React.StrictMode>
)
