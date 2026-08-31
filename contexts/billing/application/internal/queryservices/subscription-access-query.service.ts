import "server-only";

import {
  getApplicationHomePath,
  hasActiveSubscription,
  hasAssistantSubscriptionAccess,
  type SubscriptionAccessSnapshot,
} from "@/contexts/billing/domain/services/subscription-access.policy";

export type SubscriptionApplicationAccess = Readonly<{
  isActive: boolean;
  hasAssistantAccess: boolean;
  homeHref: "/chat" | "/schedule";
}>;

export class SubscriptionAccessQueryService {
  resolve(subscription: SubscriptionAccessSnapshot | null | undefined): SubscriptionApplicationAccess {
    const isActive = hasActiveSubscription(subscription);
    const hasAssistantAccess = hasAssistantSubscriptionAccess(subscription);

    return {
      isActive,
      hasAssistantAccess,
      homeHref: getApplicationHomePath(subscription),
    };
  }
}

export function createSubscriptionAccessQueryService() {
  return new SubscriptionAccessQueryService();
}
