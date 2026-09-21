"use server";

import { cookies } from "next/headers";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";
import { composeBillingAdapters } from "../server/billing-composition";
import { requireSubscriptionOwnerAccess } from "../authorization/billing-authorization";

async function contextAndToken() {
  const token = (await cookies()).get(iamSessionCookies.accessToken)?.value;
  if (!token) throw new Error("Authentication is required");
  return { token, context: await requireSubscriptionOwnerAccess(createCorrelationId()) };
}

export async function listInvoicesAction(page = 0, size = 20) {
  try {
    const { token, context } = await contextAndToken();
    return { status: "success" as const, data: await composeBillingAdapters().invoiceQueryService.getInvoices(token, page, size, context) };
  } catch (error) {
    return { status: "error" as const, data: null, error: safePublicError(error, "Unable to load invoices.").message };
  }
}

export async function getInvoiceAction(invoiceId: string) {
  try {
    const { token, context } = await contextAndToken();
    return { status: "success" as const, data: await composeBillingAdapters().invoiceQueryService.getInvoiceById(token, invoiceId, context) };
  } catch (error) {
    return { status: "error" as const, data: null, error: safePublicError(error, "Unable to load invoice.").message };
  }
}
