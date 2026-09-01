'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

const COMMANDS: Record<PackageManager, string> = {
  pnpm: 'pnpm add raseo-sdk zod',
  npm: 'npm install raseo-sdk zod',
  yarn: 'yarn add raseo-sdk zod',
  bun: 'bun add raseo-sdk zod',
};

export function InstallTabs() {
  const [pm, setPm] = useState<PackageManager>('pnpm');
  const [copied, setCopied] = useState(false);

  const cmd = COMMANDS[pm];
  const action = pm === 'npm' ? 'install' : 'add';

  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] p-1.5 shadow-md transition-colors">
      {/* Package Manager Selection Tabs */}
      <div className="flex items-center gap-1 bg-[#EAECE0] dark:bg-[#131610] rounded-lg p-1">
        {(['pnpm', 'npm', 'yarn', 'bun'] as PackageManager[]).map((pkg) => (
          <button
            key={pkg}
            onClick={() => setPm(pkg)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md cursor-pointer transition-all ${
              pm === pkg
                ? 'bg-[#889A56] text-white dark:bg-[#a2b86c] dark:text-[#131610] font-semibold shadow-sm'
                : 'text-neutral-700 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {pkg}
          </button>
        ))}
      </div>

      {/* Terminal Code Capsule: background #1E293C with syntax-highlighted command */}
      <div
        onClick={copy}
        title="Click to copy command"
        className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#1E293C] shadow-inner border border-black/20 cursor-pointer group hover:border-[#889A56]/40 transition-all select-none"
      >
        {/* Prompt symbol */}
        <span className="text-[#889A56] dark:text-[#a2b86c] select-none font-bold text-xs sm:text-sm">$</span>

        {/* Syntax-highlighted command elements (not all white) */}
        <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm tracking-wide">
          <span className="text-[#f59e0b] font-semibold">{pm}</span>
          <span className="text-[#c4d68e]">{action}</span>
          <span className="text-[#8ec5fc] font-bold">raseo-sdk</span>
          <span className="text-[#cbd5e1]">zod</span>
        </div>

        {/* Copy / Copied button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            copy();
          }}
          className="ml-2 flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer transition-all bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white active:scale-95"
          title="Copy command"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#a2b86c]" />
              <span className="text-[11px] font-sans font-medium text-[#a2b86c]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white transition-colors" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
