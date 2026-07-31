/** @vitest-environment jsdom */
import { createRef } from "react";
import { render, screen } from "@testing-library/react";

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 120,
    getVirtualItems: () => [{ index: 0, key: "0", start: 0 }],
    measureElement: vi.fn(),
  }),
}));

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
          content: "Hola",
          renderedContentHtml: "",
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
      screen.queryByText("Hola, soy tu asistente. Escribime lo que necesitas y empezamos."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hola")).toBeVisible();
  });
});
