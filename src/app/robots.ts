import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/** Solo se indexa la parte pública: el portal y el panel quedan fuera. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/portal', '/s/', '/solicitud-enviada', '/configurar-acceso', '/diagnostico'],
      },
    ],
    sitemap: `${siteConfig.url.replace(/\/$/, '')}/sitemap.xml`,
  };
}
