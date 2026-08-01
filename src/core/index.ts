import { z } from "zod";

export const AgentConfigSchema = z.object({
  name: z.string(),
});

export type AgentConfig = z.infer<typeof AgentConfigSchema>;
