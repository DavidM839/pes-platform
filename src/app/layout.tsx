import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Manrope, Space_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

/**
 * Sistema tipográfico de PES:
 *  - Barlow Condensed (principal / display): condensada con carácter, para
 *    titulares y cifras grandes. Aporta impacto y presencia de marca.
 *  - Manrope (secundaria / cuerpo): sans redondeada y muy legible para el
 *    cuerpo de texto y la interfaz.
 *  - Space Mono (mono): monoespaciada para etiquetas, folios y detalles técnicos.
 */
const fontDisplay = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const fontSans = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'es_PA',
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  icons: { icon: '/brand/favicon.png' },
};

export const viewport: Viewport = {
  themeColor: '#040B1D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{ style: { borderRadius: '2px', fontFamily: 'var(--font-sans)' } }}
        />
      </body>
    </html>
  );
}
