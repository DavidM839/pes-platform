import type { Metadata, Viewport } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Toaster } from 'sonner';
import { siteConfig } from '@/config/site';
import './globals.css';

/**
 * Sistema tipográfico en dos niveles.
 *
 *  · Sora  → titulares, rótulos en versalitas y cifras destacadas.
 *    Geométrica y de eje vertical marcado: da el aire corporativo y
 *    premium que pedía el cliente, y acompaña bien al navy/dorado.
 *  · Inter → texto corrido, formularios, tablas y panel administrativo,
 *    donde manda la legibilidad a tamaños pequeños.
 *
 * Si más adelante se quiere probar otra familia display, basta cambiar
 * el import y el nombre aquí: el resto del sitio usa `font-display`.
 */
const fontSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const fontDisplay = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
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
    <html lang="es" className={`${fontSans.variable} ${fontDisplay.variable}`}>
      <body className="min-h-screen font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{ style: { borderRadius: '8px', fontFamily: 'var(--font-sans)' } }}
        />
      </body>
    </html>
  );
}
