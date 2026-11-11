import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Single-page site: one canonical URL. Add entries here if routes are added.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 }];
}
