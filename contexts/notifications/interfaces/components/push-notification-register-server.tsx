import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { PushNotificationRegister } from "./push-notification-register";

/**
 * The client only triggers the server action. Authentication remains in the
 * HttpOnly cookie and is resolved by the action, never serialized into RSC.
 */
export async function PushNotificationRegisterServer() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get(iamSessionCookies.accessToken)?.value);
  return <PushNotificationRegister isAuthenticated={isAuthenticated} />;
}
