import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

const PAGES = ['', '/servicios', '/como-funciona', '/solicitar', '/contacto', '/privacidad', '/terminos'];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, '');
  const now = new Date();

  return PAGES.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/solicitar' ? 0.9 : 0.7,
  }));
}
