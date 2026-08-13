export type UpgradeOfferSnapshot = Readonly<{
  planName?: string | null;
  canManageBilling: boolean;
}>;

/**
 * Only the owner pays, so only the owner is offered the upgrade: the backend
 * rejects billing calls made from a member account, and a member cannot act on
 * a nudge it is shown.
 */
export function canOfferUpgrade(
  subscription: UpgradeOfferSnapshot | null | undefined,
): boolean {
  return (
    subscription?.canManageBilling === true &&
    subscription.planName?.toUpperCase() === "FREE"
  );
}
