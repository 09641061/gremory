import { AppHeader } from "./app-header";
import { getAppShellData } from "./app-shell-data";

export async function AppHeaderServer() {
  const data = await getAppShellData();
  return <AppHeader profile={data?.currentProfile ?? null} workspace={data?.workspace ?? null} />;
}
