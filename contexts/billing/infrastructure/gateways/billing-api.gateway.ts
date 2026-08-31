import "server-only";

import { z } from "zod";

import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { billingPlanResponseSchema, subscriptionResponseSchema } from "../../interfaces/rest/schemas/billing.schemas";

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
  pendingPlanId?: number | null;
  pendingBillingCycle?: string | null;
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

    const response = await apiClient.post<unknown>(apiConfig.routes.subscriptions, body, {
      token: accessToken, errorMessage: "Failed to create subscription",
    });
    return subscriptionResponseSchema.parse(response);
  }

  async getPlans(currency?: CurrencyCode): Promise<BillingPlanResponse[]> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : "";

    const response = await apiClient.get<unknown>(`${apiConfig.routes.plans}${query}`, {
      errorMessage: "Failed to retrieve plans",
    });
    return z.array(billingPlanResponseSchema).parse(response);
  }

  async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse> {
    const response = await apiClient.get<unknown>(apiConfig.routes.subscriptions, {
      token: accessToken, errorMessage: "Failed to retrieve subscription",
    });
    return subscriptionResponseSchema.parse(response);
  }

  async renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest
  ): Promise<SubscriptionResponse> {
    const response = await apiClient.put<unknown>(apiConfig.routes.subscriptions, request, {
      token: accessToken, errorMessage: "Failed to renew subscription",
    });
    return subscriptionResponseSchema.parse(response);
  }

  async cancelSubscription(accessToken: string): Promise<SubscriptionResponse> {
    const response = await apiClient.delete<unknown>(apiConfig.routes.subscriptions, {
      token: accessToken, errorMessage: "Failed to cancel subscription",
    });
    return subscriptionResponseSchema.parse(response);
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
