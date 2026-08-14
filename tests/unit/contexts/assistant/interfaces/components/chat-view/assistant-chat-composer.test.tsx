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

  it("should render the compact empty state with only the send action", () => {
    render(
      <AssistantChatComposer
        value=""
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Ask what you need about Takodu")).toBeVisible();
    expect(screen.getByLabelText("Send message")).toBeVisible();
    expect(screen.getByTestId("assistant-composer-shell")).toHaveAttribute("data-composer-state", "empty");
  });

  it("should switch to the send action as soon as text exists", async () => {
    render(
      <AssistantChatComposer
        value="Hello"
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

  it("should switch the minimal composer to the multiline layout when the text contains line breaks", async () => {
    mockScrollHeight(128);

    const { rerender } = render(
      <AssistantChatComposer
        value=""
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
        variant="minimal"
      />,
    );

    rerender(
      <AssistantChatComposer
        value={"Hola\n\nmundo"}
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
        variant="minimal"
      />,
    );

    await waitFor(() => {
      const shell = screen.getByTestId("assistant-composer-shell");
      expect(shell).toHaveAttribute("data-composer-state", "multiline");
      expect(shell.children[1]).toHaveClass("flex", "min-h-0", "flex-col", "gap-3");
    });
  });

  it("should keep the textarea focused when the composer switches from single-line to multiline", async () => {
    mockScrollHeight(128);

    const { rerender } = render(
      <AssistantChatComposer
        value="Hola"
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
        variant="minimal"
      />,
    );

    const textarea = screen.getByPlaceholderText("Ask what you need about Takodu") as HTMLTextAreaElement;
    textarea.focus();
    expect(textarea).toHaveFocus();

    rerender(
      <AssistantChatComposer
        value={"Hola\n"}
        isSending={false}
        onValueChange={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
        variant="minimal"
      />,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Ask what you need about Takodu")).toHaveFocus();
      expect(screen.getByTestId("assistant-composer-shell")).toHaveAttribute(
        "data-composer-state",
        "multiline",
      );
    });
  });
});
