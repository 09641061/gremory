import type { ReactNode } from "react";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { headers } from "next/headers";
import { Header } from "@/contexts/shared/interfaces/components/header";
import { ErrorBanner } from "@/contexts/shared/interfaces/components/error-banner";
import { ProtectedHeaderClient } from "@/contexts/business/interfaces/components/organization/protected-header-client/protected-header-client";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { createAppShellQueryService } from "@/contexts/shared/application/internal/queryservices/app-shell-query.service";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Suspense
        fallback={
          <Header />
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
  const requestHeaders = await headers();
  const organizationId = requestHeaders.get("x-takodu-organization-id") ?? undefined;
  const establishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const subscription = accessToken
    ? await new BillingApiGateway().getCurrentSubscription(accessToken).catch(() => null)
    : null;
  const shell = accessToken
    ? await createAppShellQueryService().resolve({
        subscription,
        workspace: { organizationId, establishmentId },
      }).catch(() => null)
    : null;

  return (
    <ProtectedHeaderClient
      workspace={shell?.workspace ?? {
        organizations: [],
        establishments: [],
        activeOrganizationId: undefined,
        canReadOrganizations: false,
        canReadEstablishments: false,
        canCreateEstablishment: false,
        canCreateOrganization: false,
      }}
      navigation={shell?.headerNavigation ?? {
        organizationListHref: null,
        newOrganizationHref: null,
      }}
      homeHref={shell?.homeHref ?? "/organizations"}
    />
  );
}
