import type { Metadata } from 'next';
import { roboto, robotoMono } from '@/components/theme/theme';
import ThemeProvider from '@/components/theme/ThemeProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'KiLi AGENT',
  description: 'AI chat interface with agent mode and artifacts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${roboto.className} ${robotoMono.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
