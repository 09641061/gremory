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
  clientSecret?: string | null;
  stripePublicKey?: string | null;
}

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";

export class BillingApiGateway {
  async createSubscription(
    command: CreateSubscriptionCommand
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${apiBaseUrl}/api/billing/subscriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerId: command.ownerId,
        planId: command.planId,
        billingCycle: command.billingCycle,
        currency: command.currency ?? "PEN",
        successUrl: command.successUrl,
        cancelUrl: command.cancelUrl,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      let errorMessage = "Failed to create subscription";
      try {
        const errorData = (await response.json()) as { message?: string };
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // fallback message
      }
      throw new Error(errorMessage);
    }

    return (await response.json()) as SubscriptionResponse;
  }
}
