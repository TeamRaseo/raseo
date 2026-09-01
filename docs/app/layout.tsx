import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import './globals.css';
import { Readex_Pro, JetBrains_Mono } from 'next/font/google';

const readexPro = Readex_Pro({
  subsets: ['latin'],
  variable: '--font-readex-pro',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: {
    template: '%s | Raseo SDK',
    default: 'Raseo SDK - The Open-Source Agent SDK for TypeScript',
  },
  description:
    'A unified, vendor-neutral TypeScript SDK for AI agents across OpenAI Responses API, Anthropic, and Google Gemini with streaming, Zod tools, and automated reasoning loops.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${readexPro.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen bg-[var(--color-fd-background)] text-[var(--color-fd-foreground)] antialiased font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
