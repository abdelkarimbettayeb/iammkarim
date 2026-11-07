import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineColorsTuple, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';
import { Metadata } from 'next';
import { SidebarContextProvider } from '../components/Sidebar';
import './globals.css';
import { ThemeProvider } from '@/components/ui/themeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConditionalLayout } from '../components/ConditionalLayout';
import { josefinSans, signika, padauk } from './helpers/fonts';

export const metadata: Metadata = {
    title: 'Abdelkarim - Software developer',
    description: 'A simple descriptive portfolio website for ABDELKARIM BETTAYEB.',
    icons: 'favicon.ico',
    verification: { google: '6mKxUSRolcNT34_bEIukWyXcNkeMywO1EA0yh_vHvHU' }
};

const myColor: MantineColorsTuple = [
    '#fff6e1',
    '#ffedcc',
    '#ffda9b',
    '#ffc664',
    '#ffb438',
    '#ffa91b',
    '#ffa409',
    '#e38f00',
    '#ca7e00',
    '#b06c00'
];

const theme = createTheme({
    fontFamily: 'var(--font-signika), system-ui, sans-serif',
    headings: {
        fontFamily: 'var(--font-josefin), system-ui, sans-serif',
    },
    defaultGradient: {
        from: myColor[4],
        to: myColor[3],
        deg: 45
    },
    components: {
        TextInput: {
            classNames: {
                error: 'text-red-400 font-bold'
            }
        }
    }
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html
            lang="en"
            className={`${josefinSans.variable} ${signika.variable} ${padauk.variable} font-secondary`}
            {...mantineHtmlProps}
        >
            <head>
                <ColorSchemeScript defaultColorScheme='dark' />
            </head>
            <body id='app' className='h-screen font-secondary antialiased'>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange>
                    <TooltipProvider>
                        <SidebarContextProvider>
                            <MantineProvider defaultColorScheme='dark' theme={theme}>
                                <ConditionalLayout>
                                    {children}
                                </ConditionalLayout>
                            </MantineProvider>
                        </SidebarContextProvider>
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html >
    );
}
