import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';
import { Bot } from 'lucide-react';

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <div className="flex items-center gap-2 font-bold tracking-tight text-black dark:text-[#F3F5EB]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#889A56] to-[#374025] text-white shadow-md shadow-[#889A56]/25">
              <Bot className="h-4 w-4" />
            </span>
            <span className="text-lg">Raseo<span className="text-[#889A56] dark:text-[#a2b86c]">.</span></span>
            <span className="rounded-md bg-[#EAECE0] dark:bg-[#1c2217] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#374025] dark:text-[#a2b86c] border border-[#889A56]/30">
              v0.4.0
            </span>
          </div>
        ),
      }}
      links={[
        {
          text: 'GitHub',
          url: 'https://github.com/TeamRaseo/raseo-sdk',
          external: true,
        },
      ]}
      sidebar={{
        banner: (
          <div className="mb-3 rounded-lg border border-[#889A56]/30 bg-[#EAECE0]/70 dark:bg-[#1c2217]/80 p-2.5 text-xs text-[#374025] dark:text-[#a2b86c]">
            🌿 <strong>Vendor-Neutral</strong> Agent SDK for TypeScript
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
