'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

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
    <div className="inline-flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-white/10 bg-[#0d1424]/90 p-1.5 backdrop-blur-md">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[#070b14] rounded-lg p-1">
        {(['pnpm', 'npm', 'yarn', 'bun'] as PackageManager[]).map((pkg) => (
          <button
            key={pkg}
            onClick={() => setPm(pkg)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
              pm === pkg
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {pkg}
          </button>
        ))}
      </div>

      {/* Command & Copy */}
      <div className="flex items-center gap-3 px-3 py-1 font-mono text-xs sm:text-sm text-slate-200">
        <span className="text-cyan-400 select-none">$</span>
        <span>{cmd}</span>
        <button
          onClick={copy}
          className="ml-2 text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
          title="Copy command"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
