import { test, expect } from "../helpers/auth";
import { TEST_USERS, TEST_OTP_CODE } from "../fixtures/test-users";

test.describe("Flujo de Autenticación E2E Real (Login & Confirmación OTP)", () => {
  test("Debe cargar la pantalla de login correctamente", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toHaveCount(2);
  });

  test("Debe permitir solicitar código OTP e iniciar sesión de forma real con el backend", async ({ page }) => {
    await page.goto("/login");

    // 1. Ingresar email del usuario de prueba
    const emailInput = page.locator("input[type='email']");
    await emailInput.fill(TEST_USERS.OWNER.email);

    // Click en el botón del formulario de email (segundo formulario)
    const emailForm = page.locator("form").filter({ has: page.locator("input[type='email']") });
    const submitButton = emailForm.locator("button[type='submit']");
    await submitButton.click();

    // 2. Redirección a /auth/verify
    await expect(page).toHaveURL(/\/auth\/verify/, { timeout: 15000 });
    await expect(page.getByText(TEST_USERS.OWNER.email)).toBeVisible();

    // 3. Ingresar código OTP de prueba (123456)
    const inputs = page.locator("input[aria-label^='Verification digit']");
    for (let i = 0; i < TEST_OTP_CODE.length; i++) {
      await inputs.nth(i).fill(TEST_OTP_CODE[i]);
    }

    const verifyButton = page.getByRole("button", { name: /verify|verificar/i });
    await verifyButton.click();

    // 4. Redirección a auth callback y finalmente a la app protegida
    await expect(page).not.toHaveURL(/\/login/);
  });
});
