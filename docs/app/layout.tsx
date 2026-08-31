import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import './globals.css';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-[#070a11] text-slate-100 antialiased font-sans">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
