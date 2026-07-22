import { createEmail } from "@/contexts/iam/domain/model/valueobjects/email";

describe("createEmail", () => {
  it("should normalize a valid email when it has spaces and uppercase letters", () => {
    // Arrange
    const value = "  USER@Example.COM ";
    // Act
    const email = createEmail(value);
    // Assert
    expect(email.value).toBe("user@example.com");
    expect(Object.isFrozen(email)).toBe(true);
  });

  it("should reject an email when it is blank or has no at sign", () => {
    // Arrange / Act / Assert
    for (const value of ["", "   ", "user.example.com"]) {
      expect(() => createEmail(value)).toThrow("A valid email is required");
    }
  });
});
