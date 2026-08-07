import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";
import { ProtectedHeaderClient } from "@/contexts/business/interfaces/components/organization/protected-header-client/protected-header-client";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createLandingPathQueryService } from "@/contexts/iam/application/internal/queryservices/landing-path-query.service";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <Header
            establishments={[]}
          />
        }
      >
        <ProtectedHeader />
      </Suspense>
      {children}
      <ErrorBanner />
    </div>
  );
}

async function ProtectedHeader() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  const subscription = accessToken
    ? await new BillingApiGateway().getCurrentSubscription(accessToken).catch(() => null)
    : null;

  const landing = accessToken
    ? await createLandingPathQueryService().getHeaderData({ accessToken, subscription }).catch(() => ({ status: "unavailable" as const }))
    : { status: "unavailable" as const };

  const ownerData = landing.status === "ready" ? landing.ownerData : undefined;
  const employeeData = landing.status === "ready" ? landing.employeeData : undefined;
  const homeHref = landing.status === "ready" ? landing.homeHref : "/organizations";

  return (
    <ProtectedHeaderClient
      ownerData={ownerData}
      employeeData={employeeData}
      homeHref={homeHref}
    />
  );
}
