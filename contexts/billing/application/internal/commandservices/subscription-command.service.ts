import type {
  BillingSubscriptionReadModel,
  BillingSubscriptionWriter,
  BillingRenewSubscriptionRequest,
  BillingRequestContext,
} from "../../ports/billing-readers-writers";

export class SubscriptionCommandService {
  constructor(private readonly writer: BillingSubscriptionWriter) {}

  renew(accessToken: string, request: BillingRenewSubscriptionRequest, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel> {
    return this.writer.renewSubscription(accessToken, request, context);
  }

  cancel(accessToken: string, context?: BillingRequestContext): Promise<BillingSubscriptionReadModel> {
    return this.writer.cancelSubscription(accessToken, context);
  }
}
