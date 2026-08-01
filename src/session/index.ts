export interface SessionOptions {
  sessionId?: string;
}

export function createSession(options: SessionOptions = {}) {
  return {
    id: options.sessionId ?? "default-session",
  };
}
