import {
  Josefin_Sans,
  Signika,
  Padauk,
  Bricolage_Grotesque,
  DM_Sans,
  JetBrains_Mono,
} from 'next/font/google';

/**
 * Primary Display & Headline Font for Redesign: Bricolage Grotesque
 * Expressive Swiss-industrial grotesque with sculptural character and crisp display rhythm.
 */
export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-display',
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Body & UI Sans Font for Redesign: DM Sans
 * Geometric-humanist neutral sans-serif tuned for screen clarity at 14px–16px.
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-sans',
  weight: ['400', '500', '600', '700'],
});

/**
 * Technical Monospace Font for Redesign: JetBrains Mono
 * Used for section indices, serial codes, dates, stack metadata, and tabular coordinates.
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-mono',
  weight: ['400', '500', '600', '700'],
});

/**
 * Primary Display & Headline Font: Josefin Sans
 * Geometric, elegant Scandinavian aesthetic with striking letterforms and high x-height.
 * Best used for: Main headings (h1, h2, h3), brand titles, big metric numbers, and display banners.
 */
export const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-josefin',
  weight: ['300', '400', '500', '600', '700'],
});

/**
 * Secondary UI & Wayfinding Font: Signika
 * Clear, friendly, low-contrast signage-inspired typeface engineered for maximum readability.
 * Best used for: Navigation, buttons, interactive controls, HUD badges, tabs, form labels, and tooltips.
 */
export const signika = Signika({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-signika',
  weight: ['300', '400', '500', '600', '700'],
});

/**
 * Body & Paragraph Font: Padauk
 * Distinctive, open, curved humanist letterforms with relaxed counters and smooth reading flow.
 * Best used for: Paragraphs, descriptive copy, testimonials, case study bullets, and bio narrative.
 */
export const padauk = Padauk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-padauk',
  weight: ['400', '700'],
});

// Backwards-compatible aliases if referenced elsewhere
export const bebas = josefinSans;
export const saira = josefinSans;
export const ubuntu = padauk;
