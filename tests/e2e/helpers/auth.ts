import { test as base, expect } from "@playwright/test";
import { TEST_USERS } from "../fixtures/test-users";

export { expect };

type AuthFixtures = {
  loginAs: (userKey: keyof typeof TEST_USERS) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  // Helper para autenticar dinámicamente la página con cualquiera de los usuarios preestablecidos
  // eslint-disable-next-line react-hooks/rules-of-hooks
  loginAs: async ({ context }, use) => {
    const loginFn = async (userKey: keyof typeof TEST_USERS) => {
      const user = TEST_USERS[userKey];
      await context.addCookies([
        {
          name: "takodu.access_token",
          value: `mock_access_token_for_${user.id}`,
          domain: "localhost",
          path: "/",
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
        },
        {
          name: "takodu.refresh_token",
          value: `mock_refresh_token_for_${user.id}`,
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
