/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

import { AssistantChatEmptyState } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-empty-state";

describe("AssistantChatEmptyState", () => {
  it("renders the empty state without the assistant avatar", () => {
    render(<AssistantChatEmptyState />);

    expect(screen.getByRole("heading", { name: "What do you want to manage today?" })).toBeVisible();
    expect(screen.queryByLabelText("Assistant avatar")).not.toBeInTheDocument();
  });
});
