import "server-only";

import { composeAssistantAdapters } from "../server/assistant-composition";
import type { AssistantConversationsPort } from "../../application/ports/assistant-port";

/**
 * Resolves the assistant conversation port for an action. The current
 * composition ignores the establishmentId (it is provided per-call); callers
 * pass it explicitly to the command service.
 */
export async function createAssistantConversationRepository(): Promise<AssistantConversationsPort> {
  return composeAssistantAdapters().conversations;
}
