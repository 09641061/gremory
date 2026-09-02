/** @vitest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StaffColumnAvatar } from "@/contexts/scheduling/interfaces/components/calendar/staff-column-avatar";
import type { SchedulingMemberViewModel } from "@/contexts/scheduling/application/model/scheduling-page-data.view-model";

describe("StaffColumnAvatar", () => {
  const employeeWithImage: SchedulingMemberViewModel = {
    id: "11111111-1111-4111-8111-111111111111",
    userId: "user-1",
    name: "Dr. House",
    email: "house@example.com",
    role: "Physician",
    status: "ACTIVE",
    imageUrl: "https://picsum.photos/seed/replik-test/800/600",
    isOwner: false,
    availableForScheduling: true,
  };

  const employeeWithoutImage: SchedulingMemberViewModel = {
    id: "22222222-2222-4222-8222-222222222222",
    userId: "user-2",
    name: "Dr. Wilson",
    email: "wilson@example.com",
    role: "Oncologist",
    status: "ACTIVE",
    imageUrl: null,
    isOwner: false,
    availableForScheduling: true,
  };

  it("should render avatar with image when imageUrl is provided", () => {
    const { container } = render(<StaffColumnAvatar employee={employeeWithImage} />);

    expect(screen.getByText("Dr. House")).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "https://picsum.photos/seed/replik-test/800/600");
  });

  it("should render avatar fallback when an image URL fails", () => {
    const { container } = render(
      <StaffColumnAvatar employee={employeeWithImage} />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg.lucide-user")).toBeInTheDocument();
  });

  it("should render avatar fallback with Lucide User icon when imageUrl is null", () => {
    const { container } = render(<StaffColumnAvatar employee={employeeWithoutImage} />);

    expect(screen.getByText("Dr. Wilson")).toBeInTheDocument();
    const fallbackSvg = container.querySelector("svg.lucide-user");
    expect(fallbackSvg).toBeInTheDocument();
  });
});
