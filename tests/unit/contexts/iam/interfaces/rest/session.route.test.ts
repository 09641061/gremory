import { cookies } from "next/headers";
import { createSessionRoute, clearSessionRoute } from "@/contexts/iam/interfaces/rest/routes/session.route";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

describe("IAM session route", () => {
  it("should return bad request when the session body is invalid", async () => {
    const response = await createSessionRoute(new Request("http://localhost", { method: "POST", body: JSON.stringify({ accessToken: "" }) }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Invalid session" });
  });

  it("should store tokens and return no content when the session body is valid", async () => {
    const cookieStore = { set: vi.fn(), delete: vi.fn() };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    const response = await createSessionRoute(new Request("http://localhost", { method: "POST", body: JSON.stringify({ accessToken: "a", refreshToken: "r" }) }));
    expect(response.status).toBe(204);
    expect(cookieStore.set).toHaveBeenCalledWith(iamSessionCookies.accessToken, "a", expect.objectContaining({ maxAge: 86400 }));
    expect(cookieStore.set).toHaveBeenCalledWith(iamSessionCookies.refreshToken, "r", expect.objectContaining({ maxAge: 2592000 }));
  });

  it("should delete all session cookies when clearing the session", async () => {
    const cookieStore = { set: vi.fn(), delete: vi.fn() };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    await clearSessionRoute();
    expect(cookieStore.delete).toHaveBeenCalledWith(iamSessionCookies.pendingEmail);
    expect(cookieStore.delete).toHaveBeenCalledTimes(3);
  });

  it("should only create access and refresh cookies", async () => {
    // Arrange
    const cookieStore = { set: vi.fn(), delete: vi.fn() };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ accessToken: "a", refreshToken: "r" }),
    });

    // Act
    await createSessionRoute(request);

    expect(cookieStore.set).toHaveBeenCalledTimes(2);
  });
});
