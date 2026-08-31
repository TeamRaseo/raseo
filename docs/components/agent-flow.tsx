'use client';

import React, { useState } from 'react';
import { User, Brain, Wrench, ArrowRight, ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react';

interface StepDetail {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  codeSnippet: string;
  description: string;
}

const STEPS: StepDetail[] = [
  {
    id: 1,
    title: 'User Input & Context',
    subtitle: 'runAgent(config, prompt)',
    icon: <User className="h-5 w-5 text-blue-400" />,
    codeSnippet: `const result = await runAgent({
  name: "Assistant",
  instructions: "Help users with data tasks.",
  model: provider,
  tools: [calculatorTool],
}, "Calculate 15 * 84");`,
    description: 'The agent receives the prompt and resolves dynamic instructions (either a static string or an async function receiving AgentRunContext).',
  },
  {
    id: 2,
    title: 'Model Query',
    subtitle: 'provider.generate(request)',
    icon: <Brain className="h-5 w-5 text-cyan-400" />,
    codeSnippet: `// Raseo standardizes request across OpenAI, Claude & Gemini
const response = await model.generate({
  messages,
  tools: [calculatorTool], // Converted to JSON Schema automatically
});`,
    description: 'The model receives messages and tool schemas. If it needs calculations or data, it emits tool calls.',
  },
  {
    id: 3,
    title: 'Tool Execution & Guardrails',
    subtitle: 'ToolExecutor.executeCall()',
    icon: <Wrench className="h-5 w-5 text-yellow-400" />,
    codeSnippet: `// 1. Zod input validation (safeParse)
// 2. Optional guardrail hook
// 3. Tool execution -> ToolResult
const toolResult = await executor.executeCall(toolCall);
messages.push({
  role: "tool",
  toolCallId: toolCall.id,
  content: JSON.stringify(toolResult.data),
});`,
    description: 'ToolExecutor validates arguments against Zod schema, checks guardrails, runs the tool safely, and captures output.',
  },
  {
    id: 4,
    title: 'Final Synthesis',
    subtitle: 'Reasoning loop completion',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    codeSnippet: `// Loop terminates when model returns text without tool calls
return {
  output: "15 * 84 = 1,260",
  messages,
  turnCount: 2,
  finalAgentName: "Assistant",
};`,
    description: 'The model processes the tool output and returns the synthesized answer to the developer with turnCount metrics.',
  },
];

export function AgentFlowVisualizer() {
  const [activeStep, setActiveStep] = useState(0);

  const step = STEPS[activeStep];

  return (
    <div className="w-full max-w-4xl mx-auto my-12 rounded-2xl border border-white/10 bg-[#090d18] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            The Autonomous Agent Loop in Action
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Click each stage to inspect the internal runtime execution lifecycle in <code>raseo-sdk</code>.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
          AgentRuntime.run()
        </span>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {STEPS.map((s, idx) => {
          const isSelected = activeStep === idx;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(idx)}
              className={`text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-cyan-500/50 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-500">0{s.id}</span>
                {s.icon}
              </div>
              <div className="text-xs font-semibold text-slate-200 truncate">{s.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{s.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Active step explanation & code */}
      <div className="rounded-xl border border-white/10 bg-[#060911] p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            {step.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{step.title}</h4>
            <p className="text-xs text-slate-400">{step.description}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-[#03060c] border border-white/5 p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
          <pre>
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
