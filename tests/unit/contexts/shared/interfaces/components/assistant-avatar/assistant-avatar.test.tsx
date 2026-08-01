/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

import { AssistantAvatar } from "@/contexts/shared/interfaces/components/kodu/kodu";

describe("AssistantAvatar", () => {
  it("renders a flat avatar without the framed surface", () => {
    render(<AssistantAvatar variant="flat" />);

    const avatar = screen.getByRole("button", { name: "Assistant avatar" });

    expect(avatar).toHaveClass("bg-transparent");
    expect(avatar).toHaveClass("border-transparent");
    expect(avatar).toHaveClass("shadow-none");
  });
});
