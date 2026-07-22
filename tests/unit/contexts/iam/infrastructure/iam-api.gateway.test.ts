import { IamApiGateway } from "@/contexts/iam/infrastructure/gateways/iam-api.gateway";
import { createEmail } from "@/contexts/iam/domain/model/valueobjects/email";

describe("IamApiGateway", () => {
  it("should send the normalized email when requesting sign-in", async () => {
    // Arrange
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const gateway = new IamApiGateway();
    // Act
    await gateway.requestEmailSignIn({ email: createEmail(" User@Example.com ") });
    // Assert
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/auth/sign-in",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "user@example.com" }) })
    );
  });

  it("should parse a valid authentication session when confirmation succeeds", async () => {
    // Arrange
    const session = { accessToken: "a", refreshToken: "r", expiresIn: 3600 };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(session), { status: 200 })));
    const gateway = new IamApiGateway();
    // Act
    const result = await gateway.confirmEmailSignIn({ email: createEmail("user@example.com"), code: "123456" });
    // Assert
    expect(result).toEqual(session);
  });

  it("should throw the API message when sign-out fails", async () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Session expired" }), { status: 401 })));
    const gateway = new IamApiGateway();
    // Act / Assert
    await expect(gateway.signOut({ accessToken: "a", refreshToken: "r" })).rejects.toThrow("Session expired");
  });
});
