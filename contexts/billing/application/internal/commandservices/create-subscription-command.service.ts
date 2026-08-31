import { createPlanId } from "../../../domain/model/value-objects/plan-id";
import { createBillingCycle } from "../../../domain/model/value-objects/billing-cycle";
import { createCurrency } from "../../../domain/model/value-objects/currency";
import type { CreateSubscriptionCommand } from "../../../domain/model/commands/create-subscription.command";

export class CreateSubscriptionCommandService {
  /**
   * Processes and validates the create subscription command for UI integration without external IO.
   */
  public handle(command: CreateSubscriptionCommand): CreateSubscriptionCommand {
    const planId = createPlanId(command.planId);
    const cycle = createBillingCycle(command.billingCycle);
    const currency = createCurrency(command.currency ?? "USD");

    return {
      planId: planId.value,
      billingCycle: cycle.value,
      currency: currency.value,
      successUrl: command.successUrl,
      cancelUrl: command.cancelUrl,
    };
  }
}
