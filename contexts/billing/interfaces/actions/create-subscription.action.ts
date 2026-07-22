"use server";

import { CreateSubscriptionCommandService, type CreateSubscriptionResult } from "../../application/internal/commandservices/create-subscription-command.service";
import type { BillingCycleType } from "../../domain/model/value-objects/billing-cycle";
import type { CurrencyCode } from "../../domain/model/value-objects/currency";

export type CreateSubscriptionActionResult =
  | { status: "success"; data: CreateSubscriptionResult; error: null }
  | { status: "error"; data: null; error: string };

export interface CreateSubscriptionInput {
  planId: number;
  billingCycle: BillingCycleType;
  currency: CurrencyCode;
  ownerId?: string;
}

const DEFAULT_OWNER_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

/**
 * Server Action executing plan selection action without triggering external API calls.
 */
export async function createSubscriptionAction(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionActionResult> {
  try {
    const ownerId = input.ownerId ?? DEFAULT_OWNER_ID;

    const commandService = new CreateSubscriptionCommandService();
    const result = commandService.handle({
      ownerId,
      planId: input.planId,
      billingCycle: input.billingCycle,
      currency: input.currency,
    });

    return { status: "success", data: result, error: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "Failed to process plan selection",
    };
  }
}
