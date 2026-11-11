import type { Metadata, Viewport } from 'next';
import './globals.css';
import { personalInfo } from '@/data/resumeData';
import { SITE_URL } from '@/lib/site';
import { ThemeProvider } from '@/components/ui/themeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { josefinSans, signika, padauk } from './helpers/fonts';

const title = `${personalInfo.name} - ${personalInfo.role}`;
const description =
    'Interactive 3D portfolio of Abdelkarim Bettayeb, a full-stack and lead software engineer with 9+ years of experience in TypeScript, React, Next.js, Node.js and PostgreSQL. Open to remote work.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${personalInfo.name}` },
    description,
    keywords: ['Abdelkarim Bettayeb', 'full-stack developer', 'software engineer', 'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'portfolio', 'remote developer', 'Algeria'],
    authors: [{ name: personalInfo.name, url: SITE_URL }],
    creator: personalInfo.name,
    alternates: { canonical: '/' },
    icons: 'favicon.ico',
    openGraph: { type: 'website', url: '/', siteName: personalInfo.name, title, description, locale: 'en_US' },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 } },
    verification: { google: 'nbU0dg4qMqGMY-D2AMLv6hsAxz4ZU9terrFUF8Ba6RM' }
};

export const viewport: Viewport = { themeColor: '#0B0F19' };

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html
            lang="en"
            className={`${josefinSans.variable} ${signika.variable} ${padauk.variable} font-secondary`}
            suppressHydrationWarning
        >
            <body id='app' className='h-screen font-secondary antialiased'>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange>
                    <TooltipProvider>
                        {/* The room and the studio are full-bleed standalone 3D experiences */}
                        <div className="w-screen h-screen overflow-hidden p-0 m-0 bg-[#0B0F19]">
                            {children}
                        </div>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html >
    );
}
