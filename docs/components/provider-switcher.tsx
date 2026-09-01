'use client';

import React, { useState } from 'react';
import { Check, Copy, Sparkles, Cpu } from 'lucide-react';

type ProviderKey = 'openai' | 'anthropic' | 'gemini';

interface ProviderData {
  name: string;
  badge: string;
  accent: string;
  importSnippet: string;
  initSnippet: string;
  runSnippet: string;
  model: string;
}

const PROVIDERS: Record<ProviderKey, ProviderData> = {
  openai: {
    name: 'OpenAI',
    badge: 'Responses API',
    accent: 'from-emerald-400 to-teal-500',
    model: 'gpt-4o-mini',
    importSnippet: `import { OpenAIProvider } from "raseo-sdk/openai";`,
    initSnippet: `const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o-mini",
});`,
    runSnippet: `const result = await runAgent(
  {
    name: "WeatherBot",
    instructions: "You are a helpful weather assistant.",
    model: provider, // <-- Plug in OpenAIProvider!
    tools: [weatherTool],
  },
  "What is the weather in Delhi?"
);`,
  },
  anthropic: {
    name: 'Anthropic',
    badge: 'Claude Messages',
    accent: 'from-amber-400 to-orange-500',
    model: 'claude-sonnet-4-6',
    importSnippet: `import { AnthropicProvider } from "raseo-sdk/anthropic";`,
    initSnippet: `const provider = new AnthropicProvider({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: "claude-sonnet-4-6",
});`,
    runSnippet: `const result = await runAgent(
  {
    name: "WeatherBot",
    instructions: "You are a helpful weather assistant.",
    model: provider, // <-- Swap to AnthropicProvider! Zero tool changes!
    tools: [weatherTool],
  },
  "What is the weather in Delhi?"
);`,
  },
  gemini: {
    name: 'Google Gemini',
    badge: '@google/genai',
    accent: 'from-cyan-400 to-blue-500',
    model: 'gemini-3.5-flash',
    importSnippet: `import { GeminiProvider } from "raseo-sdk/gemini";`,
    initSnippet: `const provider = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-3.5-flash",
});`,
    runSnippet: `const result = await runAgent(
  {
    name: "WeatherBot",
    instructions: "You are a helpful weather assistant.",
    model: provider, // <-- Swap to GeminiProvider! Zero tool changes!
    tools: [weatherTool],
  },
  "What is the weather in Delhi?"
);`,
  },
};

export function ProviderSwitcher() {
  const [active, setActive] = useState<ProviderKey>('openai');
  const [copied, setCopied] = useState(false);

  const current = PROVIDERS[active];

  const fullCode = `import { tool, runAgent } from "raseo-sdk";
${current.importSnippet}
import { z } from "zod";

// 1. Unified Type-Safe Tool Definition (Zod)
const weatherTool = tool({
  name: "get_weather",
  description: "Get current weather for a city",
  input: z.object({ city: z.string().describe("City name") }),
  async execute({ city }) {
    return { city, temperature: 24, condition: "Sunny" };
  },
});

// 2. Initialize Provider
${current.initSnippet}

// 3. Automated Reasoning Loop
${current.runSnippet}

console.log(result.output);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] shadow-xl overflow-hidden transition-colors">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#EAECE0] dark:border-[#262e1f] px-4 py-3 bg-[#EAECE0] dark:bg-[#1c2217]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="h-3 w-3 rounded-full bg-[#374025]/30 dark:bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-[#374025]/30 dark:bg-white/20" />
            <div className="h-3 w-3 rounded-full bg-[#374025]/30 dark:bg-white/20" />
          </div>
          <span className="text-xs font-mono text-[#374025] dark:text-[#a2b86c] flex items-center gap-1 font-medium">
            <Cpu className="h-3.5 w-3.5 text-[#889A56] dark:text-[#a2b86c]" />
            provider-parity-demo.ts
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F6EE] dark:bg-[#131610] rounded-xl border border-[#EAECE0] dark:border-[#262e1f]">
          {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
            const isSelected = active === key;
            const p = PROVIDERS[key];
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#889A56] text-white dark:bg-[#a2b86c] dark:text-[#131610] shadow-sm font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-[#131610]' : 'bg-neutral-400 dark:bg-neutral-600'}`} />
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors px-2.5 py-1 rounded-md bg-[#F5F6EE] dark:bg-[#131610] border border-[#EAECE0] dark:border-[#262e1f] cursor-pointer active:scale-95 shadow-sm"
          title="Copy full code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#889A56] dark:text-[#a2b86c]" />
              <span className="text-xs font-semibold text-[#889A56] dark:text-[#a2b86c]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copy Code</span>
            </>
          )}
        </button>
      </div>

      {/* Code preview with user's exact code block colors #1E293C and full syntax highlighting */}
      <div className="p-4 sm:p-6 overflow-x-auto bg-[#1E293C] text-[#F3F5EB] font-mono text-xs sm:text-sm leading-relaxed">
        <pre tabIndex={0}>
          <code>
            <span className="text-[#f472b6]">import</span> <span className="text-[#94a3b8]">{'{'}</span>{' '}
            <span className="text-[#38bdf8]">tool</span><span className="text-[#94a3b8]">,</span>{' '}
            <span className="text-[#38bdf8]">runAgent</span>{' '}
            <span className="text-[#94a3b8]">{'}'}</span> <span className="text-[#f472b6]">from</span>{' '}
            <span className="text-[#86efac]">"raseo-sdk"</span><span className="text-[#94a3b8]">;</span>{'\n'}
            <span className="text-[#f472b6]">import</span> <span className="text-[#94a3b8]">{'{'}</span>{' '}
            <span className="text-[#67e8f9] font-bold">{current.name}Provider</span>{' '}
            <span className="text-[#94a3b8]">{'}'}</span> <span className="text-[#f472b6]">from</span>{' '}
            <span className="text-[#86efac]">"raseo-sdk/{active}"</span><span className="text-[#94a3b8]">;</span>{'\n'}
            <span className="text-[#f472b6]">import</span> <span className="text-[#94a3b8]">{'{'}</span>{' '}
            <span className="text-[#38bdf8]">z</span> <span className="text-[#94a3b8]">{'}'}</span>{' '}
            <span className="text-[#f472b6]">from</span> <span className="text-[#86efac]">"zod"</span><span className="text-[#94a3b8]">;</span>{'\n\n'}
            <span className="text-[#64748b]">// 1. Strongly-typed tool definition (Zod)</span>{'\n'}
            <span className="text-[#e2b714]">const</span> <span className="text-[#38bdf8]">weatherTool</span>{' '}
            <span className="text-[#94a3b8]">=</span> <span className="text-[#a2b86c] font-bold">tool</span>
            <span className="text-[#94a3b8]">({'{'}</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">name</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"get_weather"</span><span className="text-[#94a3b8]">,</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">description</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"Get current weather for a city"</span><span className="text-[#94a3b8]">,</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">input</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#38bdf8]">z</span><span className="text-[#94a3b8]">.</span>
            <span className="text-[#a2b86c]">object</span><span className="text-[#94a3b8]">({'{'}</span>{'\n'}
            {'    '}<span className="text-[#38bdf8]">city</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#38bdf8]">z</span><span className="text-[#94a3b8]">.</span>
            <span className="text-[#a2b86c]">string</span><span className="text-[#94a3b8]">().</span>
            <span className="text-[#a2b86c]">describe</span><span className="text-[#94a3b8]">(</span>
            <span className="text-[#86efac]">"City name"</span><span className="text-[#94a3b8]">),</span>{'\n'}
            {'  '}<span className="text-[#94a3b8]">{'}'}),</span>{'\n'}
            {'  '}<span className="text-[#f472b6]">async</span> <span className="text-[#a2b86c] font-bold">execute</span>
            <span className="text-[#94a3b8]">({'{'}</span> <span className="text-[#cbd5e1]">city</span> <span className="text-[#94a3b8]">{'}'}) {'{'}</span>{'\n'}
            {'    '}<span className="text-[#f472b6]">return</span> <span className="text-[#94a3b8]">{'{'}</span>{' '}
            <span className="text-[#38bdf8]">city</span><span className="text-[#94a3b8]">,</span>{' '}
            <span className="text-[#38bdf8]">temperature</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#fb923c] font-semibold">24</span><span className="text-[#94a3b8]">,</span>{' '}
            <span className="text-[#38bdf8]">condition</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"Sunny"</span> <span className="text-[#94a3b8]">{'}'};</span>{'\n'}
            {'  '}<span className="text-[#94a3b8]">{'}'},</span>{'\n'}
            <span className="text-[#94a3b8]">{'}'});</span>{'\n\n'}
            <span className="text-[#64748b]">// 2. Swappable Model Provider ({current.name})</span>{'\n'}
            <span className="text-[#e2b714]">const</span> <span className="text-[#38bdf8]">provider</span>{' '}
            <span className="text-[#94a3b8]">=</span> <span className="text-[#f472b6]">new</span>{' '}
            <span className="text-[#67e8f9] font-bold">{current.name}Provider</span>
            <span className="text-[#94a3b8]">({'{'}</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">apiKey</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#cbd5e1]">process.env.{active.toUpperCase()}_API_KEY!</span><span className="text-[#94a3b8]">,</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">model</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"{current.model}"</span><span className="text-[#94a3b8]">,</span>{'\n'}
            <span className="text-[#94a3b8]">{'}'});</span>{'\n\n'}
            <span className="text-[#64748b]">// 3. Multi-turn Agent Reasoning Loop</span>{'\n'}
            <span className="text-[#e2b714]">const</span> <span className="text-[#38bdf8]">result</span>{' '}
            <span className="text-[#94a3b8]">=</span> <span className="text-[#f472b6]">await</span>{' '}
            <span className="text-[#a2b86c] font-bold">runAgent</span><span className="text-[#94a3b8]">({'{'}</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">name</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"WeatherBot"</span><span className="text-[#94a3b8]">,</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">instructions</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#86efac]">"You are a helpful weather assistant."</span><span className="text-[#94a3b8]">,</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">model</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#38bdf8]">provider</span><span className="text-[#94a3b8]">,</span>{' '}
            <span className="text-[#64748b]">// Unified interface across all models</span>{'\n'}
            {'  '}<span className="text-[#38bdf8]">tools</span><span className="text-[#94a3b8]">:</span>{' '}
            <span className="text-[#94a3b8]">[</span><span className="text-[#38bdf8]">weatherTool</span><span className="text-[#94a3b8]">],</span>{'\n'}
            <span className="text-[#94a3b8]">{'}'},</span> <span className="text-[#86efac]">"What is the weather in Delhi?"</span><span className="text-[#94a3b8]">);</span>{'\n\n'}
            <span className="text-[#38bdf8]">console</span><span className="text-[#94a3b8]">.</span>
            <span className="text-[#a2b86c]">log</span><span className="text-[#94a3b8]">(</span>
            <span className="text-[#38bdf8]">result.output</span><span className="text-[#94a3b8]">);</span>
          </code>
        </pre>
      </div>

      {/* Footer parity note */}
      <div className="bg-[#EAECE0] dark:bg-[#1c2217] px-6 py-3 border-t border-[#EAECE0] dark:border-[#262e1f] flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#889A56] dark:text-[#a2b86c]" />
          <span>Notice: Agent logic & tool definitions stay <strong>100% identical</strong>.</span>
        </span>
        <span className="font-mono text-[11px] text-[#374025] dark:text-[#a2b86c] bg-[#889A56]/15 dark:bg-[#a2b86c]/20 px-2 py-0.5 rounded border border-[#889A56]/30">
          Zero vendor lock-in
        </span>
      </div>
    </div>
  );
}
