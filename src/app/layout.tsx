import { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ui/themeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { josefinSans, signika, padauk } from './helpers/fonts';

export const metadata: Metadata = {
    title: 'Abdelkarim - Software developer',
    description: 'A simple descriptive portfolio website for ABDELKARIM BETTAYEB.',
    icons: 'favicon.ico',
    verification: { google: 'nbU0dg4qMqGMY-D2AMLv6hsAxz4ZU9terrFUF8Ba6RM' }
};

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
