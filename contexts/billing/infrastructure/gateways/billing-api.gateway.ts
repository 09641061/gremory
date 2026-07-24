import "server-only";

import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";

export interface SubscriptionResponse {
  id: string;
  ownerId: string;
  planId: number;
  billingCycle: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  failedAttemptsCount?: number;
  active?: boolean;
  clientSecret?: string | null;
  stripePublicKey?: string | null;
}

export interface RenewSubscriptionRequest {
  newPlanId?: number;
  newBillingCycle?: string;
}

export interface InvoiceResponse {
  id: string;
  subscriptionId: string;
  ownerId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl?: string | null;
  receiptUrl?: string | null;
  issueDate: string;
  paidDate?: string | null;
}

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export class BillingApiGateway {
  async createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        planId: command.planId,
        billingCycle: command.billingCycle,
        currency: command.currency ?? "USD",
        successUrl: command.successUrl,
        cancelUrl: command.cancelUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to create subscription"));
    }

    return (await response.json()) as SubscriptionResponse;
  }

  async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/billing/subscriptions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to retrieve subscription"));
    }

    return (await response.json()) as SubscriptionResponse;
  }

  async renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/billing/subscriptions`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to renew subscription"));
    }

    return (await response.json()) as SubscriptionResponse;
  }

  async cancelSubscription(accessToken: string): Promise<SubscriptionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/billing/subscriptions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to cancel subscription"));
    }

    return (await response.json()) as SubscriptionResponse;
  }

  async getInvoices(accessToken: string): Promise<InvoiceResponse[]> {
    const response = await fetch(`${apiBaseUrl}/api/billing/invoices/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to fetch invoices"));
    }

    return (await response.json()) as InvoiceResponse[];
  }
}

async function readError(response: Response, defaultMsg: string): Promise<string> {
  try {
    const errorData = (await response.json()) as { message?: string };
    return errorData.message ?? defaultMsg;
  } catch {
    return defaultMsg;
  }
}
