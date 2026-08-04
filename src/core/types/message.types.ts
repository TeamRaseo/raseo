export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface SystemMessage {
  role: "system";
  content: string;
}

export interface UserMessageContentPartText {
  type: "text";
  text: string;
}

export interface UserMessageContentPartImage {
  type: "image";
  imageUrl: string;
}

export type UserMessageContentPart = UserMessageContentPartText | UserMessageContentPartImage;

export interface UserMessage {
  role: "user";
  content: string | UserMessageContentPart[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  rawFunctionCall?: Record<string, unknown>;
}

export interface AssistantMessage {
  role: "assistant";
  content?: string | null;
  toolCalls?: readonly ToolCall[];
  rawParts?: readonly unknown[];
}

export interface ToolResponseMessage {
  role: "tool";
  toolCallId: string;
  toolName: string;
  content: string;
}

export type ChatMessage = SystemMessage | UserMessage | AssistantMessage | ToolResponseMessage;
