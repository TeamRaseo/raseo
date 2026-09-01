import Link from 'next/link';
import { Bot, ArrowRight, Zap, Shield, Sparkles, Layers, Terminal, BookOpen } from 'lucide-react';
import { ProviderSwitcher } from '@/components/provider-switcher';
import { AgentFlowVisualizer } from '@/components/agent-flow';
import { InstallTabs } from '@/components/install-tabs';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F6EE] dark:bg-[#131610] text-black dark:text-[#F3F5EB] transition-colors selection:bg-[#889A56] selection:text-white">
      {/* Subtle organic ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#889A56]/15 via-[#EAECE0]/20 dark:via-[#1c2217]/20 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[50%] -left-40 w-[500px] h-[500px] bg-[#889A56]/10 blur-3xl rounded-full" />
        <div className="absolute top-[70%] -right-40 w-[500px] h-[500px] bg-[#374025]/10 dark:bg-[#889A56]/10 blur-3xl rounded-full" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE]/85 dark:bg-[#131610]/85 backdrop-blur-md sticky top-0 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-black dark:text-[#F3F5EB] group">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#889A56] to-[#374025] text-white shadow-md shadow-[#889A56]/20 group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5" />
              </span>
              <span className="text-xl">Raseo<span className="text-[#889A56] dark:text-[#a2b86c]">.</span></span>
            </Link>
            <span className="rounded-full bg-[#EAECE0] dark:bg-[#1c2217] px-2.5 py-0.5 text-xs font-mono font-medium text-[#374025] dark:text-[#a2b86c] border border-[#889A56]/30">
              v0.4.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-neutral-300">
            <Link href="/docs" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">
              Documentation
            </Link>
            <Link href="/docs/getting-started/quickstart" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">
              Quickstart
            </Link>
            <Link href="/docs/providers/overview" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">
              Providers
            </Link>
            <Link href="/docs/tools/defining-tools" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">
              Tools & Zod
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/TeamRaseo/raseo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] hover:bg-[#EAECE0] dark:hover:bg-[#1c2217] text-neutral-800 dark:text-neutral-200 transition-all shadow-sm"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
            <Link
              href="/docs"
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#889A56] hover:bg-[#374025] text-white dark:bg-[#a2b86c] dark:text-[#131610] dark:hover:bg-[#889A56] shadow-sm transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#889A56]/30 bg-[#EAECE0] dark:bg-[#1c2217] text-[#374025] dark:text-[#a2b86c] text-xs font-medium mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#889A56] dark:text-[#a2b86c]" />
            <span>Unified Model Providers • OpenAI Responses API, Claude & Gemini</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-black dark:text-[#F3F5EB] leading-tight sm:leading-none">
            The open-source AI Agent SDK{' '}
            <span className="block mt-2 olive-gradient-text">built for TypeScript.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-neutral-700 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Zero vendor lock-in. Switch effortlessly between <strong>OpenAI</strong>, <strong>Anthropic</strong>, and <strong>Google Gemini</strong> with type-safe tools, real-time streaming, and an automated reasoning loop.
          </p>

          {/* Installation snippet */}
          <div className="mt-8 flex justify-center">
            <InstallTabs />
          </div>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#889A56] hover:bg-[#374025] text-white dark:bg-[#a2b86c] dark:text-[#131610] dark:hover:bg-[#889A56] font-semibold text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Documentation</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/getting-started/quickstart"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] hover:bg-[#EAECE0] dark:hover:bg-[#1c2217] text-black dark:text-[#F3F5EB] font-semibold text-sm shadow-sm transition-all"
            >
              <Terminal className="h-4 w-4 text-[#889A56] dark:text-[#a2b86c]" />
              <span>Try 5-Min Quickstart</span>
            </Link>
          </div>
        </section>

        {/* Live Provider Parity Switcher */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-[#F3F5EB] tracking-tight">
              One Interface, Zero Rewrites
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Switch providers with 1 line of code. All tool definitions, messages, and agent loops stay identical.
            </p>
          </div>

          <ProviderSwitcher />
        </section>

        {/* Core Pillars */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] hover:border-[#889A56]/60 transition-all shadow-sm group">
              <div className="h-10 w-10 rounded-xl bg-[#889A56]/15 dark:bg-[#a2b86c]/20 border border-[#889A56]/30 flex items-center justify-center text-[#889A56] dark:text-[#a2b86c] mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-black dark:text-[#F3F5EB] mb-2">Unified Provider Abstraction</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Native integrations with OpenAI Responses API, Anthropic Messages API, and Google GenAI. Identical non-streaming (<code>generate</code>) and streaming (<code>stream</code>) APIs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] hover:border-[#889A56]/60 transition-all shadow-sm group">
              <div className="h-10 w-10 rounded-xl bg-[#889A56]/15 dark:bg-[#a2b86c]/20 border border-[#889A56]/30 flex items-center justify-center text-[#889A56] dark:text-[#a2b86c] mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-black dark:text-[#F3F5EB] mb-2">Type-Safe Tools with Zod</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Define tools using <code>tool()</code> with full TypeScript parameter inference. Automatic conversion from Zod schemas to model-ready JSON Schemas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] hover:border-[#889A56]/60 transition-all shadow-sm group">
              <div className="h-10 w-10 rounded-xl bg-[#889A56]/15 dark:bg-[#a2b86c]/20 border border-[#889A56]/30 flex items-center justify-center text-[#889A56] dark:text-[#a2b86c] mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-black dark:text-[#F3F5EB] mb-2">Autonomous Reasoning Loop</h3>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <code>runAgent</code> manages multi-turn agent execution: calls the model, detects tool invocations, executes tools via <code>ToolExecutor</code>, feeds results back, and returns the final answer.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Agent Flow Visualizer */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-20">
          <AgentFlowVisualizer />
        </section>

        {/* Subpath Architecture Overview */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-24">
          <div className="p-8 rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] shadow-sm">
            <h2 className="text-xl font-bold text-black dark:text-[#F3F5EB] mb-2">Clean Modular Subpath Exports</h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Only import what you need. Provider SDKs are decoupled so your bundle stays lightweight.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Core <code>runAgent</code>, <code>AgentRuntime</code>, types, errors, session helpers.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk/openai</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400"><code>OpenAIProvider</code> backed by OpenAI's Responses API.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk/anthropic</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400"><code>AnthropicProvider</code> backed by Anthropic's Messages API.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk/gemini</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400"><code>GeminiProvider</code> backed by Google's GenAI SDK.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk/tool</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400"><code>tool()</code>, <code>ToolRegistry</code>, <code>ToolExecutor</code>, <code>zodToJsonSchema</code>.</p>
              </div>
              <div className="p-4 rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610]">
                <div className="font-mono text-xs text-[#374025] dark:text-[#a2b86c] font-semibold mb-1">raseo-sdk/session</div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400"><code>MemorySessionStorageAdapter</code>, <code>createSession</code>, session state.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#EAECE0] dark:border-[#262e1f] bg-[#EAECE0] dark:bg-[#0e110c] py-12 px-4 sm:px-6 lg:px-8 text-xs text-neutral-600 dark:text-neutral-400 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-black dark:text-[#F3F5EB]">Raseo SDK</span>
              <span>•</span>
              <span>MIT Licensed</span>
              <span>•</span>
              <span>Built by Team Raseo</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">Docs</Link>
              <Link href="/docs/getting-started/quickstart" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">Quickstart</Link>
              <a href="https://github.com/TeamRaseo/raseo" target="_blank" rel="noreferrer" className="hover:text-[#889A56] dark:hover:text-[#a2b86c] transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
