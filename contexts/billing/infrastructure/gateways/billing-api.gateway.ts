import "server-only";

import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";
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
  cancelAtPeriodEnd?: boolean;
  clientSecret?: string | null;
  stripePublicKey?: string | null;
}

export interface BillingPlanResponse {
  id: number;
  name: string;
  maxEstablishments: number;
  monthlyPriceAmount: number;
  annualPriceAmount: number;
  currency: string;
  active: boolean;
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

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export class BillingApiGateway {
  async createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand
  ): Promise<SubscriptionResponse> {
    const body: Record<string, unknown> = {
      planId: command.planId,
      billingCycle: command.billingCycle,
    };

    if (command.planId > 0) {
      body.currency = command.currency ?? "USD";
      if (command.successUrl) body.successUrl = command.successUrl;
      if (command.cancelUrl) body.cancelUrl = command.cancelUrl;
    }

    return apiClient.post<SubscriptionResponse>(
      apiConfig.routes.subscriptions,
      body,
      { token: accessToken, errorMessage: "Failed to create subscription" },
    );
  }

  async getPlans(currency?: CurrencyCode): Promise<BillingPlanResponse[]> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : "";

    return apiClient.get<BillingPlanResponse[]>(`${apiConfig.routes.plans}${query}`, {
      errorMessage: "Failed to retrieve plans",
    });
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

  async getInvoices(accessToken: string, page = 0, size = 20): Promise<PageResponse<InvoiceResponse>> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    return apiClient.get<PageResponse<InvoiceResponse>>(`${apiConfig.routes.invoices}?${query}`, {
      token: accessToken,
      errorMessage: "Failed to fetch invoices",
    });
  }

  async getInvoiceById(accessToken: string, invoiceId: string): Promise<InvoiceResponse> {
    return apiClient.get<InvoiceResponse>(
      `${apiConfig.routes.invoices}/${encodeURIComponent(invoiceId)}`,
      {
        token: accessToken,
        errorMessage: "Failed to fetch invoice",
      },
    );
  }
}
