import type { Metadata } from 'next';
import Script from 'next/script';
import { Playfair_Display, Dancing_Script, DM_Sans } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';
import '@/styles/theme.css';
import '@/styles/tokens.css';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-dancing',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

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

const noFlashScript = `(function(){var k='golf-sol-theme';var s=typeof document!=='undefined'&&document.documentElement&&typeof localStorage!=='undefined'?localStorage.getItem(k):null;var t=(s==='dark'||s==='light')?s:(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');try{document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dancing.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="bg-background text-neutral-foreground antialiased min-h-screen flex flex-col font-body text-base theme-transition">
        <Script id="theme-no-flash" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: noFlashScript }} />
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
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
