// Single canonical origin for canonical links, sitemap, robots and structured data.
// Set NEXT_PUBLIC_SITE_URL in production if the primary domain differs.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://iamkarim.vercel.app').replace(/\/$/, '');
