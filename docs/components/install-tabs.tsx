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

  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#EAECE0]/90 dark:bg-[#1c2217]/90 p-1.5 shadow-sm backdrop-blur-md">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#F5F6EE] dark:bg-[#131610] rounded-lg p-1 border border-[#EAECE0] dark:border-[#262e1f]">
        {(['pnpm', 'npm', 'yarn', 'bun'] as PackageManager[]).map((pkg) => (
          <button
            key={pkg}
            onClick={() => setPm(pkg)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
              pm === pkg
                ? 'bg-[#889A56] text-white dark:bg-[#a2b86c] dark:text-[#131610] font-semibold shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {pkg}
          </button>
        ))}
      </div>

      {/* Command & Copy */}
      <div className="flex items-center gap-3 px-3 py-1 font-mono text-xs sm:text-sm text-black dark:text-[#F3F5EB]">
        <span className="text-[#889A56] dark:text-[#a2b86c] select-none font-bold">$</span>
        <span>{cmd}</span>
        <button
          onClick={copy}
          className="ml-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          title="Copy command"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#889A56] dark:text-[#a2b86c]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
