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
          <div className="flex items-center gap-2 font-bold tracking-tight text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 text-black shadow-md shadow-cyan-500/20">
              <Bot className="h-4 w-4" />
            </span>
            <span className="text-lg">Raseo<span className="text-cyan-400">.</span></span>
            <span className="rounded-md bg-cyan-950/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-cyan-300 border border-cyan-500/30">
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
          <div className="mb-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-2.5 text-xs text-cyan-200">
            ⚡ <strong>Vendor-Neutral</strong> Agent SDK for TypeScript
          </div>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
