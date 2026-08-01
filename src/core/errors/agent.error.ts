import { RaseoError } from "./runtime.error.js";

export class TurnLimitExceededError extends RaseoError {
  readonly runId: string;
  readonly turnCount: number;
  readonly maxTurns: number;

  constructor(runId: string, turnCount: number, maxTurns: number) {
    super(
      `Agent run '${runId}' exceeded max turns limit (${turnCount}/${maxTurns}).`,
      "TURN_LIMIT_EXCEEDED"
    );
    this.runId = runId;
    this.turnCount = turnCount;
    this.maxTurns = maxTurns;
  }
}

export class HandoffLoopError extends RaseoError {
  readonly agentChain: string[];

  constructor(agentChain: string[]) {
    super(
      `Detected potential handoff loop across agents: ${agentChain.join(" -> ")}`,
      "HANDOFF_LOOP_DETECTED"
    );
    this.agentChain = agentChain;
  }
}

export class GuardrailViolationError extends RaseoError {
  readonly target: "input" | "output" | "tool";
  readonly reason: string;

  constructor(target: "input" | "output" | "tool", reason: string) {
    super(`Guardrail violation [${target}]: ${reason}`, "GUARDRAIL_VIOLATION");
    this.target = target;
    this.reason = reason;
  }
}
