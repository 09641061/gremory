import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createCurrentSubscriptionQueryService } from "@/contexts/billing/application/internal/queryservices/current-subscription-query.service";
import { createBillingInvoicesAdapter } from "@/contexts/billing/infrastructure/adapters/billing-invoices.adapter";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { InvoiceView } from "@/contexts/billing/interfaces/components/invoice/invoice-view";

export default async function InvoicePage() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    redirect("/login");
  }

  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
  if (workspace.accessPolicy?.canManageBilling === false) {
    redirect("/access-denied");
  }

  const subscription = await createCurrentSubscriptionQueryService().getCurrentSubscriptionSnapshot(accessToken);
  const invoices = await createBillingInvoicesAdapter().getInvoices(accessToken, 0, 20);

  return (
    <InvoiceView
      currentSubscription={subscription}
      initialInvoices={invoices}
    />
  );
}
