import { tool } from "raseo-sdk/tool";
import { OpenAIProvider } from "raseo-sdk/openai";
import { runAgent } from "raseo-sdk";
import { z } from "zod";

// 1. Define a tool using developer-friendly tool() helper with Zod type inference
const weatherTool = tool({
  name: "get_weather",
  description: "Get current weather for a city",
  input: z.object({
    city: z.string().describe("The city name, e.g. Tokyo, San Francisco"),
    unit: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature unit"),
  }),
  async execute({ city }) {
    return { city, temperature: 22, condition: "Sunny" };
  },
});

// 2. Direct Provider Tool Calling Example
async function directProviderExample() {
  const provider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY ?? "your-api-key",
    model: "gpt-4o-mini",
  });

  console.log("--- Direct Provider Tool Calling ---");

  // Pass tool() definitions directly to tools array!
  const response = await provider.generate({
    messages: [
      { role: "user", content: "What is the weather in Tokyo?" }
    ],
    tools: [weatherTool],
  });

  console.log("Assistant Response:", response.message);
  console.log("Tool Calls:", response.toolCalls);
}

// 3. Automated Agentic Tool Calling Loop Example
async function agenticRuntimeExample() {
  const provider = new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY ?? "your-api-key",
    model: "gpt-4o-mini",
  });

  console.log("--- Automated Agent Runtime Tool Calling ---");

  const result = await runAgent(
    {
      name: "WeatherAssistant",
      instructions: "You are a helpful assistant. Use tools when needed to answer questions accurately.",
      model: provider,
      tools: [weatherTool],
    },
    "What is the weather in Tokyo?"
  );

  console.log("Final Answer:", result.output);
  console.log("Total Turns:", result.turnCount);
}
