/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

vi.mock(
  "@/contexts/shared/interfaces/components/kodu/kodu",
  () => ({
    AssistantAvatar: () => <div data-testid="assistant-avatar" />,
  }),
);

import { AssistantChatThinkingBubble } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-thinking-bubble";

describe("AssistantChatThinkingBubble", () => {
  it("renders the assistant loading message", () => {
    render(<AssistantChatThinkingBubble />);

    expect(screen.getByText("We received your message.")).toBeVisible();
    expect(screen.getByLabelText("AI is thinking.")).toBeVisible();
    expect(screen.getByText("Kodu is thinking")).toBeVisible();
    expect(screen.getByTestId("assistant-avatar")).toBeVisible();
  });
});
