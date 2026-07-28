import type { AssistantMessageRole } from "../value-objects/assistant-message-role";

export class AssistantMessage {
  private constructor(
    public readonly id: string,
    public readonly role: AssistantMessageRole,
    public readonly content: string,
    public readonly intent: string | null,
    public readonly createdAt: string,
  ) {}

  static create(params: {
    id: string;
    role: AssistantMessageRole;
    content: string;
    intent?: string | null;
    createdAt: string;
  }) {
    return new AssistantMessage(
      params.id,
      params.role,
      params.content,
      params.intent ?? null,
      params.createdAt,
    );
  }
}
