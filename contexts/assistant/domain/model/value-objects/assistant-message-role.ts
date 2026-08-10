export const ASSISTANT_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
} as const;

export type AssistantMessageRole = "USER" | "ASSISTANT";

export type NormalizedAssistantMessageRole = typeof ASSISTANT_ROLES[keyof typeof ASSISTANT_ROLES];

export function normalizeAssistantRole(role?: string | null): NormalizedAssistantMessageRole {
  const normalized = String(role ?? "").toUpperCase();
  if (normalized === "ASSISTANT" || normalized === "AGENT") {
    return ASSISTANT_ROLES.ASSISTANT;
  }
  return ASSISTANT_ROLES.USER;
}
