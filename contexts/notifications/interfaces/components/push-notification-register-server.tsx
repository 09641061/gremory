import { cookies } from "next/headers";

import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { PushNotificationRegister } from "./push-notification-register";

/**
 * Server-side wrapper that forwards the access-token cookie to the client
 * `PushNotificationRegister`. Reads the cookie inside the request scope so
 * the value is captured at SSR time and passed as a serialisable prop.
 */
export async function PushNotificationRegisterServer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  return <PushNotificationRegister accessToken={accessToken} />;
}
