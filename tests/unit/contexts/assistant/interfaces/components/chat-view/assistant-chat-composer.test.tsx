/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";

import { AssistantChatComposer } from "@/contexts/assistant/interfaces/components/chat-view/assistant-chat-composer";

const originalScrollHeight = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "scrollHeight");

function mockScrollHeight(value: number) {
  Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => value,
  });
}

describe("AssistantChatComposer", () => {
  afterEach(() => {
    if (originalScrollHeight) {
      Object.defineProperty(HTMLTextAreaElement.prototype, "scrollHeight", originalScrollHeight);
    }
  });

  it("should render the compact empty state with the live voice action", () => {
    render(
      <AssistantChatComposer
        value=""
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Preguntar lo que quieras")).toBeVisible();
    expect(screen.getByLabelText("Live voice")).toBeVisible();
    expect(screen.getByLabelText("Microphone")).toBeVisible();
    expect(screen.getByTestId("assistant-composer-shell")).toHaveAttribute("data-composer-state", "empty");
  });

  it("should switch to the send action as soon as text exists", async () => {
    render(
      <AssistantChatComposer
        value="Hola"
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Send message")).toBeVisible();
    expect(screen.getByTestId("assistant-composer-shell")).toHaveAttribute(
      "data-composer-state",
      "single-line",
    );
  });

  it("should expand into the multiline card when the text wraps", async () => {
    mockScrollHeight(128);

    const { rerender } = render(
      <AssistantChatComposer
        value=""
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    rerender(
      <AssistantChatComposer
        value={"a".repeat(180)}
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("assistant-composer-shell")).toHaveAttribute(
        "data-composer-state",
        "multiline",
      );
    });
  });
});
