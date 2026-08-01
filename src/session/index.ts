import type { ChatMessage } from "../core/types/message.types.js";

/**
 * Lifetime 3: Persisted Session State
 * Long-lived state persisted across multiple agent run invocations.
 */
export interface SessionState {
  sessionId: string;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface SessionStorageAdapter {
  getSession(sessionId: string): Promise<SessionState | null>;
  saveSession(session: SessionState): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}

export interface SessionOptions {
  sessionId?: string;
  storage?: SessionStorageAdapter;
}

export class MemorySessionStorageAdapter implements SessionStorageAdapter {
  private sessions = new Map<string, SessionState>();

  async getSession(sessionId: string): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return JSON.parse(JSON.stringify(session));
  }

  async saveSession(session: SessionState): Promise<void> {
    this.sessions.set(session.sessionId, JSON.parse(JSON.stringify(session)));
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

export function createSession(options: SessionOptions = {}) {
  const storage = options.storage ?? new MemorySessionStorageAdapter();
  return {
    id: options.sessionId ?? "default-session",
    storage,
  };
}
