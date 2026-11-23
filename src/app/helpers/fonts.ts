import {
  Bricolage_Grotesque,
  DM_Sans,
  JetBrains_Mono,
} from 'next/font/google';

/**
 * Primary Display & Headline Font: Bricolage Grotesque
 */
export const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-display',
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Body & UI Sans Font: DM Sans
 */
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-sans',
  weight: ['400', '500', '600', '700'],
});

/**
 * Technical Monospace Font: JetBrains Mono
 */
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cv-mono',
  weight: ['400', '500', '600', '700'],
});

// Backwards-compatible aliases pointing to the active v2 font stack (zero extra font downloads)
export const josefinSans = bricolageGrotesque;
export const signika = dmSans;
export const padauk = dmSans;
export const bebas = bricolageGrotesque;
export const saira = bricolageGrotesque;
export const ubuntu = dmSans;
