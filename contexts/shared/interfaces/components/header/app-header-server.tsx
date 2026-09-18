import { AppHeader } from "./app-header";
import { getAppShellData } from "../app-shell-data";

/**
 * Home destination when no shell data is available (no auth, expired token,
 * Billing unavailable). Matches the no-auth landing used by the request proxy
 * and the protected layout guard.
 */
const UNAUTHENTICATED_HOME_HREF = "/welcome";

export async function AppHeaderServer() {
  const data = await getAppShellData();
  return (
    <AppHeader
      profile={data?.currentProfile ?? null}
      workspace={data?.workspace ?? null}
      homeHref={data?.shell.homeHref ?? UNAUTHENTICATED_HOME_HREF}
    />
  );
}
