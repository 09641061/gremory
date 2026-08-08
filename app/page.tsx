import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

export default async function HomePage() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const subscription = accessToken
    ? await new BillingApiGateway().getCurrentSubscription(accessToken).catch(() => null)
    : null;
  const shell = accessToken
    ? await createAppShellQueryService().resolve({ subscription }).catch(() => null)
    : null;

  redirect(shell?.homeHref ?? "/organizations");
}
