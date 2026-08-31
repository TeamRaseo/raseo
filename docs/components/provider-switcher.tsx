'use client';

import React, { useState } from 'react';
import { Check, Copy, Sparkles, Terminal, Cpu } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-white/10 bg-[#0a0f1d]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0d1424]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            provider-parity-demo.ts
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#070a12] rounded-xl border border-white/5">
          {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => {
            const isSelected = active === key;
            const p = PROVIDERS[key];
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors px-2.5 py-1 rounded-md bg-white/5 border border-white/10"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Code preview */}
      <div className="p-4 sm:p-6 overflow-x-auto bg-[#070b14]/95 font-mono text-xs sm:text-sm text-slate-300 leading-relaxed">
        <pre tabIndex={0}>
          <code>
            <span className="text-purple-400">import</span> {'{ tool, runAgent }'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-emerald-300">"raseo-sdk"</span>;{'\n'}
            <span className="text-purple-400">import</span> {'{ '}
            <span className="text-cyan-300 font-bold">{current.name}Provider</span>
            {' }'} <span className="text-purple-400">from</span>{' '}
            <span className="text-emerald-300">"raseo-sdk/{active}"</span>;{'\n'}
            <span className="text-purple-400">import</span> {'{ z }'}{' '}
            <span className="text-purple-400">from</span>{' '}
            <span className="text-emerald-300">"zod"</span>;{'\n\n'}
            <span className="text-slate-500">// 1. Strongly-typed tool definition</span>{'\n'}
            <span className="text-blue-400">const</span> weatherTool ={' '}
            <span className="text-yellow-300">tool</span>({'{'}{'\n'}
            {'  '}name:{' '}
            <span className="text-emerald-300">"get_weather"</span>,{'\n'}
            {'  '}description:{' '}
            <span className="text-emerald-300">"Get current weather for a city"</span>,{'\n'}
            {'  '}input: z.<span className="text-blue-300">object</span>({'{'}{'\n'}
            {'    '}city: z.<span className="text-blue-300">string</span>().
            <span className="text-blue-300">describe</span>(
            <span className="text-emerald-300">"City name"</span>),{'\n'}
            {'  '}{'}'}),{'\n'}
            {'  '}<span className="text-purple-400">async</span>{' '}
            <span className="text-yellow-300">execute</span>({'{ city }'}) {'{'}{'\n'}
            {'    '}<span className="text-purple-400">return</span> {'{'} city,
            temperature: <span className="text-orange-300">24</span>, condition:{' '}
            <span className="text-emerald-300">"Sunny"</span> {'}'};{'\n'}
            {'  '}{'}'},{'\n'}
            {'}'});{'\n\n'}
            <span className="text-slate-500">// 2. Swappable Model Provider ({current.name})</span>{'\n'}
            <span className="text-blue-400">const</span> provider ={' '}
            <span className="text-purple-400">new</span>{' '}
            <span className="text-cyan-300 font-bold">{current.name}Provider</span>({'{'}{'\n'}
            {'  '}apiKey: process.env.{active.toUpperCase()}_API_KEY!,{'\n'}
            {'  '}model:{' '}
            <span className="text-emerald-300">"{current.model}"</span>,{'\n'}
            {'}'});{'\n\n'}
            <span className="text-slate-500">// 3. Multi-turn Agent Reasoning Loop</span>{'\n'}
            <span className="text-blue-400">const</span> result ={' '}
            <span className="text-purple-400">await</span>{' '}
            <span className="text-yellow-300">runAgent</span>({'{'}{'\n'}
            {'  '}name: <span className="text-emerald-300">"WeatherBot"</span>,{'\n'}
            {'  '}instructions:{' '}
            <span className="text-emerald-300">"You are a helpful weather assistant."</span>,{'\n'}
            {'  '}model: provider, <span className="text-cyan-400">// Unified interface across all models</span>{'\n'}
            {'  '}tools: [weatherTool],{'\n'}
            {'}'}, <span className="text-emerald-300">"What is the weather in Delhi?"</span>);{'\n\n'}
            console.<span className="text-blue-300">log</span>(result.output);
          </code>
        </pre>
      </div>

      {/* Footer parity note */}
      <div className="bg-[#0b101c] px-6 py-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Notice: Agent logic & tool definitions stay <strong>100% identical</strong>.</span>
        </span>
        <span className="font-mono text-[11px] text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30">
          Zero vendor lock-in
        </span>
      </div>
    </div>
  );
}
