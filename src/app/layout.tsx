import type { Metadata } from 'next';
import Script from 'next/script';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import '@/styles/brand.css';
import '@/styles/theme.css';
import '@/styles/tokens.css';
import './globals.css';

/** Bunny Fonts (GDPR-friendly; Master Plan 1.3). Variables set in globals.css :root. */
const BUNNY_FONTS_URL = 'https://fonts.bunny.net/css?family=playfair-display:400,700|dm-sans:400,500,600|dancing-script:400,600,700|outfit:600,700,800';

export const metadata: Metadata = {
  title: `${SITE_NAME} | Golf Holidays in Costa del Sol`,
  description: SITE_DESCRIPTION,
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: 'website',
    ...(SITE_URL && { url: SITE_URL, siteName: SITE_NAME, images: [{ url: '/og.jpg', width: 1200, height: 630, alt: SITE_NAME }] }),
  },
};

/* Default theme = light; only use stored preference. No system preference to avoid flicker. */
const noFlashScript = `(function(){var k='golf-sol-theme';var s=typeof document!=='undefined'&&document.documentElement&&typeof localStorage!=='undefined'?localStorage.getItem(k):null;var t=(s==='dark'||s==='light')?s:'light';try{document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="no-js" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href={BUNNY_FONTS_URL} rel="stylesheet" />
      </head>
      <body className="bg-background text-neutral-foreground antialiased min-h-screen flex flex-col font-body text-base theme-transition">
        <Script id="theme-no-flash" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: noFlashScript }} />
        <Script id="no-js-remove" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.remove('no-js');` }} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <ErrorBoundary>
            <Header />
            <main id="main" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <Footer />
            <WhatsAppButton />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
