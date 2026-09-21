import "server-only";

import { z } from "zod";

import type { CreateSubscriptionCommand } from "../../domain/model/commands/create-subscription.command";
import type {
  BillingInvoiceReader,
  BillingPlanReader,
  BillingSubscriptionReader,
  BillingSubscriptionWriter,
  BillingRequestContext,
} from "../../application/ports/billing-readers-writers";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import {
  billingPlanResponseSchema,
  invoicePageResponseSchema,
  invoiceResponseSchema,
  subscriptionResponseSchema,
  type BillingPlanResponse,
  type InvoiceResponse,
  type SubscriptionResponse,
  type BillingInvoicePage,
} from "../contracts/billing.schemas";

export type { BillingPlanResponse, InvoiceResponse, SubscriptionResponse };
export type { PageResponse } from "@/contexts/shared/application/model/page-response";

export interface RenewSubscriptionRequest {
  newPlanId?: number;
  newBillingCycle?: string;
}

export class BillingApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown, options?: ErrorOptions) {
    super(message, status, details, options);
    this.name = "BillingApiError";
  }
}

export class BillingApiGateway
  implements BillingSubscriptionReader, BillingSubscriptionWriter, BillingPlanReader, BillingInvoiceReader
{
  async createSubscription(
    accessToken: string,
    command: CreateSubscriptionCommand,
    context?: BillingRequestContext,
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
      token: accessToken,
      tenantId: context?.tenantId,
      correlationId: context?.correlationId,
      errorMessage: "Failed to create subscription",
      errorType: BillingApiError,
    });
    return parseProviderResponse(subscriptionResponseSchema, response, "subscription");
  }

  async getPlans(currency?: CurrencyCode): Promise<BillingPlanResponse[]> {
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : "";

    const response = await apiClient.get<unknown>(`${apiConfig.routes.plans}${query}`, {
      errorMessage: "Failed to retrieve plans",
      errorType: BillingApiError,
    });
    return parseProviderResponse(z.array(billingPlanResponseSchema), response, "plans");
  }

  async getCurrentSubscription(accessToken: string, context?: BillingRequestContext): Promise<SubscriptionResponse> {
    const response = await apiClient.get<unknown>(apiConfig.routes.subscriptions, {
      token: accessToken,
      tenantId: context?.tenantId,
      correlationId: context?.correlationId,
      errorMessage: "Failed to retrieve subscription",
      errorType: BillingApiError,
    });
    return parseProviderResponse(subscriptionResponseSchema, response, "subscription");
  }

  async renewSubscription(
    accessToken: string,
    request: RenewSubscriptionRequest,
    context?: BillingRequestContext,
  ): Promise<SubscriptionResponse> {
    const response = await apiClient.put<unknown>(apiConfig.routes.subscriptions, request, {
      token: accessToken,
      tenantId: context?.tenantId,
      correlationId: context?.correlationId,
      errorMessage: "Failed to renew subscription",
      errorType: BillingApiError,
    });
    return parseProviderResponse(subscriptionResponseSchema, response, "subscription");
  }

  async cancelSubscription(accessToken: string, context?: BillingRequestContext): Promise<SubscriptionResponse> {
    const response = await apiClient.delete<unknown>(apiConfig.routes.subscriptions, {
      token: accessToken,
      tenantId: context?.tenantId,
      correlationId: context?.correlationId,
      errorMessage: "Failed to cancel subscription",
      errorType: BillingApiError,
    });
    return parseProviderResponse(subscriptionResponseSchema, response, "subscription");
  }

  async getInvoices(accessToken: string, page = 0, size = 20, context?: BillingRequestContext): Promise<BillingInvoicePage> {
    const query = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    const response = await apiClient.get<unknown>(`${apiConfig.routes.invoices}?${query}`, {
      token: accessToken,
      tenantId: context?.tenantId,
      correlationId: context?.correlationId,
      errorMessage: "Failed to fetch invoices",
      errorType: BillingApiError,
    });
    return parseProviderResponse(invoicePageResponseSchema, response, "invoice page");
  }

  async getInvoiceById(accessToken: string, invoiceId: string, context?: BillingRequestContext): Promise<InvoiceResponse> {
    const response = await apiClient.get<unknown>(
      `${apiConfig.routes.invoices}/${encodeURIComponent(invoiceId)}`,
      {
        token: accessToken,
        tenantId: context?.tenantId,
        correlationId: context?.correlationId,
        errorMessage: "Failed to fetch invoice",
        errorType: BillingApiError,
      },
    );
    return parseProviderResponse(invoiceResponseSchema, response, "invoice");
  }
}

function parseProviderResponse<T extends z.ZodTypeAny>(
  schema: T,
  response: unknown,
  resource: string,
): z.infer<T> {
  try {
    return schema.parse(response);
  } catch (cause) {
    throw new BillingApiError(`Invalid billing ${resource} response`, 502, undefined, { cause });
  }
}
