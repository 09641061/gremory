import { test as base, expect } from "@playwright/test";
import { TEST_USERS } from "../fixtures/test-users";

export { expect };

export const test = base.extend({
  // Helper para autenticar dinámicamente la página con cualquiera de los usuarios preestablecidos
  loginAs: async ({ page, context }, use) => {
    const loginFn = async (userKey: keyof typeof TEST_USERS) => {
      const user = TEST_USERS[userKey];
      await context.addCookies([
        {
          name: "takodu.access_token",
          value: user.accessToken,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
        {
          name: "takodu.refresh_token",
          value: user.refreshToken,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
      ]);
      if (user.establishmentId) {
        await context.addCookies([
          {
            name: "takodu.establishment_id",
            value: user.establishmentId,
            domain: "localhost",
            path: "/",
            httpOnly: false,
            secure: false,
            sameSite: "Lax",
          },
        ]);
      }
    };
    await use(loginFn);
  },
});
