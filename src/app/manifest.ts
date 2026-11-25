import type { MetadataRoute } from 'next';
import { personalInfo } from '@/data/resumeData';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${personalInfo.name} - ${personalInfo.role}`,
    short_name: personalInfo.name,
    start_url: '/',
    display: 'standalone',
    background_color: '#18181C',
    theme_color: '#18181C',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/android-chrome-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
