/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/assistant-avatar/assistant-avatar";

describe("AssistantAvatar", () => {
  it("renders a flat avatar without the framed surface", () => {
    render(<AssistantAvatar variant="flat" />);

    const avatar = screen.getByRole("button", { name: "Assistant avatar" });

    expect(avatar).toHaveClass("bg-transparent");
    expect(avatar).toHaveClass("border-transparent");
    expect(avatar).toHaveClass("shadow-none");
  });
});
