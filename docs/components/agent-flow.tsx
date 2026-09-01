'use client';

import React, { useState } from 'react';
import { User, Brain, Wrench, CheckCircle2, RotateCw } from 'lucide-react';

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
    icon: <User className="h-5 w-5 text-[#889A56] dark:text-[#a2b86c]" />,
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
    icon: <Brain className="h-5 w-5 text-[#889A56] dark:text-[#a2b86c]" />,
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
    icon: <Wrench className="h-5 w-5 text-[#889A56] dark:text-[#a2b86c]" />,
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
    icon: <CheckCircle2 className="h-5 w-5 text-[#889A56] dark:text-[#a2b86c]" />,
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
    <div className="w-full max-w-4xl mx-auto my-12 rounded-2xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#FFFFFF] dark:bg-[#181e14] p-6 sm:p-8 shadow-xl transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-[#F3F5EB] flex items-center gap-2">
            <RotateCw className="h-4 w-4 text-[#889A56] dark:text-[#a2b86c] animate-spin" style={{ animationDuration: '6s' }} />
            The Autonomous Agent Loop in Action
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Click each stage to inspect the internal runtime execution lifecycle in <code>raseo-sdk</code>.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full bg-[#EAECE0] dark:bg-[#1c2217] border border-[#889A56]/30 text-[#374025] dark:text-[#a2b86c] font-mono">
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
                  ? 'border-[#889A56] bg-[#889A56]/15 dark:bg-[#a2b86c]/20 shadow-sm'
                  : 'border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE]/60 dark:bg-[#131610]/60 hover:bg-[#EAECE0] dark:hover:bg-[#1c2217]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-neutral-500">0{s.id}</span>
                {s.icon}
              </div>
              <div className="text-xs font-semibold text-black dark:text-[#F3F5EB] truncate">{s.title}</div>
              <div className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate">{s.subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* Active step explanation & code */}
      <div className="rounded-xl border border-[#EAECE0] dark:border-[#262e1f] bg-[#F5F6EE] dark:bg-[#131610] p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-[#889A56]/15 dark:bg-[#a2b86c]/20 border border-[#889A56]/30">
            {step.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-black dark:text-[#F3F5EB]">{step.title}</h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">{step.description}</p>
          </div>
        </div>

        {/* User's code block background #1E293C and text #F3F5EB */}
        <div className="mt-4 rounded-lg bg-[#1E293C] border border-[#EAECE0]/20 p-4 font-mono text-xs text-[#F3F5EB] overflow-x-auto leading-relaxed shadow-inner">
          <pre>
            <code>{step.codeSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
