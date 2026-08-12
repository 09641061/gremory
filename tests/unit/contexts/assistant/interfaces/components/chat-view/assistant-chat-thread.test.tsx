/** @vitest-environment jsdom */
import { createRef } from "react";
import { render, screen } from "@testing-library/react";

import { AssistantChatThread } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-thread";
import type { AssistantConversationViewModel } from "@/contexts/assistant/interfaces/view-models/assistant-chat.view-model";

describe("AssistantChatThread", () => {
  it("does not render the default welcome message when a conversation already has messages", () => {
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });

    const bottomRef = createRef<HTMLDivElement>();
    const conversation: AssistantConversationViewModel = {
      id: "conversation-1",
      title: "Active conversation",
      createdAt: "2026-07-30T00:00:00.000Z",
      updatedAt: "2026-07-30T00:00:01.000Z",
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "Hello",
          createdAt: "2026-07-30T00:00:00.000Z",
        },
      ],
    };

    render(
      <AssistantChatThread
        conversation={conversation}
        isLoading={false}
        bottomRef={bottomRef}
      />,
    );

    expect(
      screen.queryByText("Hello, I am your assistant. Tell me what you need and let’s get started."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hello")).toBeVisible();
  });
});
