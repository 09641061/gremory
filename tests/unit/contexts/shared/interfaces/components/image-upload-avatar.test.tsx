/** @vitest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ImageUploadAvatar } from "@/contexts/shared/interfaces/components/image-upload-avatar";

describe("ImageUploadAvatar", () => {
  const createObjectURLMock = vi.fn();
  const revokeObjectURLMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = createObjectURLMock.mockReturnValue("blob:http://localhost/mock-blob-id");
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should open the file picker from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <ImageUploadAvatar
        name="imageFile"
        alt="User photo"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />,
    );

    const input = screen.getByLabelText(/Upload image/i) as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    const trigger = screen.getByRole("button", { name: "Choose user photo" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(click).toHaveBeenCalled();
  });

  it("should render fallback icon when no initialUrl is provided", () => {
    render(
      <ImageUploadAvatar
        name="imageFile"
        alt="User photo"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />
    );

    expect(screen.getByTestId("fallback")).toBeVisible();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should render fallback when the initial image URL fails", () => {
    render(
      <ImageUploadAvatar
        name="imageFile"
        alt="User photo"
        initialUrl="https://picsum.photos/seed/replik-test/800/600"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />,
    );

    fireEvent.error(screen.getByRole("img", { name: "User photo" }));

    expect(screen.getByTestId("fallback")).toBeVisible();
    expect(screen.queryByRole("img", { name: "User photo" })).toBeNull();
  });

  it("should render image when initialUrl is provided", () => {
    render(
      <ImageUploadAvatar
        name="imageFile"
        alt="User photo"
        initialUrl="https://picsum.photos/seed/replik-test/800/600"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />
    );

    const img = screen.getByRole("img", { name: "User photo" });
    expect(img).toHaveAttribute("src", "https://picsum.photos/seed/replik-test/800/600");
  });

  it("should initialize preview from the current initialUrl when remounted", () => {
    const { rerender } = render(
      <ImageUploadAvatar
        key="version-1"
        name="imageFile"
        alt="User photo"
        initialUrl="https://picsum.photos/seed/replik-test/800/600"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />
    );

    expect(screen.getByRole("img", { name: "User photo" })).toHaveAttribute(
      "src",
      "https://picsum.photos/seed/replik-test/800/600"
    );

    rerender(
      <ImageUploadAvatar
        key="version-2"
        name="imageFile"
        alt="User photo"
        initialUrl="https://picsum.photos/seed/replik-test/900/700"
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />
    );

    expect(screen.getByRole("img", { name: "User photo" })).toHaveAttribute(
      "src",
      "https://picsum.photos/seed/replik-test/900/700"
    );
  });

  it("should update preview with blob url when a file is selected and notify onFileSelect", async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(
      <ImageUploadAvatar
        name="imageFile"
        alt="User photo"
        onFileSelect={onFileSelect}
        fallbackIcon={<span data-testid="fallback">No photo</span>}
      />
    );

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const input = screen.getByLabelText(/Upload image/i);

    await user.upload(input, file);

    expect(createObjectURLMock).toHaveBeenCalledWith(file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
    const img = screen.getByRole("img", { name: "User photo" });
    expect(img).toHaveAttribute("src", "blob:http://localhost/mock-blob-id");
  });

  it("should revoke blob url and reset preview when form resets", async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="form">
        <ImageUploadAvatar
          name="imageFile"
          alt="User photo"
          initialUrl="https://picsum.photos/seed/replik-test/800/600"
          fallbackIcon={<span data-testid="fallback">No photo</span>}
        />
        <button type="reset">Reset</button>
      </form>
    );

    const file = new File(["dummy"], "photo.png", { type: "image/png" });
    const input = screen.getByLabelText(/Upload image/i);
    await user.upload(input, file);

    expect(screen.getByRole("img", { name: "User photo" })).toHaveAttribute(
      "src",
      "blob:http://localhost/mock-blob-id"
    );

    const form = screen.getByTestId("form");
    fireEvent.reset(form);

    expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/mock-blob-id");
    expect(screen.getByRole("img", { name: "User photo" })).toHaveAttribute(
      "src",
      "https://picsum.photos/seed/replik-test/800/600"
    );
  });
});
