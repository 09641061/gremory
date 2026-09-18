import { test, expect } from "../helpers/auth";
import { TEST_USERS, TEST_OTP_CODE } from "../fixtures/test-users";

test.describe("Real E2E Authentication Flow (Login & OTP Confirmation)", () => {
  test("Should load the login screen correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toHaveCount(2);
  });

  test("Should allow requesting an OTP code and sign in against the real backend", async ({ page }) => {
    await page.goto("/login");

    // 1. Enter the test user's email address.
    const emailInput = page.locator("input[type='email']");
    await emailInput.fill(TEST_USERS.OWNER.email);

    // Click the submit button inside the email form (second form on the page).
    const emailForm = page.locator("form").filter({ has: page.locator("input[type='email']") });
    const submitButton = emailForm.locator("button[type='submit']");
    await submitButton.click();

    // 2. Redirect to /auth/verify.
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 15000 });
    await expect(page.getByText(TEST_USERS.OWNER.email)).toBeVisible();

    // 3. Enter the test OTP code (123456).
    const inputs = page.locator("input[aria-label^='Verification digit']");
    for (let i = 0; i < TEST_OTP_CODE.length; i++) {
      await inputs.nth(i).fill(TEST_OTP_CODE[i]);
    }

    const verifyButton = page.getByRole("button", { name: /verify/i });
    await verifyButton.click();

    // 4. Redirect through the auth callback and into the protected app.
    await expect(page).not.toHaveURL(/\/login/);
  });
});
