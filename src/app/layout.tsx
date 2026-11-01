import '@mantine/core/styles.css';

import { ColorSchemeScript, MantineColorsTuple, MantineProvider, createTheme, mantineHtmlProps } from '@mantine/core';
import { Metadata } from 'next';
import { SidebarContextProvider } from '../components/Sidebar';
import './globals.css';
import { ThemeProvider } from '@/components/ui/themeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConditionalLayout } from '../components/ConditionalLayout';

export const metadata: Metadata = {
    title: 'Abdelkarim - Software developer',
    description: 'A simple descriptive portfolio website for ABDELKARIM BETTAYEB.',
    icons: 'favicon.ico'
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
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <ColorSchemeScript defaultColorScheme='dark' />
                <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display" />
            </head>
            <body id='app' className='h-screen'>
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
