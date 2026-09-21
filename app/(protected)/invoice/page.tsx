import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { composeBillingAdapters } from "@/contexts/billing/interfaces/server/billing-composition";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { InvoiceView } from "@/contexts/billing/interfaces/components/invoice/invoice-view";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { requireSubscriptionOwnerAccess } from "@/contexts/billing/interfaces/authorization/billing-authorization";

export default function InvoicePage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <InvoicePageContent />
    </Suspense>
  );
}

async function InvoicePageContent() {
  const accessToken = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) {
    redirect("/login");
  }

  // Invoice history is an account-level read screen. It remains available
  // without a paid subscription; the backend applies authentication and owner
  // scoping, but not the active-subscription gate.

  const billing = composeBillingAdapters();
  const billingContext = await requireSubscriptionOwnerAccess();
  const subscription = await billing.currentSubscriptionService.getCurrentSubscriptionSnapshot(accessToken, billingContext);
  const invoices = await billing.invoiceQueryService.getInvoices(accessToken, 0, 20, billingContext);

  return (
    <InvoiceView
      currentSubscription={subscription}
      initialInvoices={invoices}
    />
  );
}
