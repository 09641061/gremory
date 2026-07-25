import "server-only";

import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

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

export class BillingApiGateway {
  async createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand
  ): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>(
      apiConfig.routes.subscriptions,
      {
        planId: command.planId,
        billingCycle: command.billingCycle,
        currency: command.currency ?? "USD",
        successUrl: command.successUrl,
        cancelUrl: command.cancelUrl,
      },
      { token: accessToken, errorMessage: "Failed to create subscription" },
    );
  }

  async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return apiClient.get<SubscriptionResponse>(apiConfig.routes.subscriptions, {
      token: accessToken,
      errorMessage: "Failed to retrieve subscription",
    });
  }

  async renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    return apiClient.put<SubscriptionResponse>(apiConfig.routes.subscriptions, request, {
      token: accessToken,
      errorMessage: "Failed to renew subscription",
    });
  }

  async cancelSubscription(accessToken: string): Promise<SubscriptionResponse> {
    return apiClient.delete<SubscriptionResponse>(apiConfig.routes.subscriptions, {
      token: accessToken,
      errorMessage: "Failed to cancel subscription",
    });
  }

  async getInvoices(accessToken: string): Promise<InvoiceResponse[]> {
    return apiClient.get<InvoiceResponse[]>(`${apiConfig.routes.invoices}/me`, {
      token: accessToken,
      errorMessage: "Failed to fetch invoices",
    });
  }
}
