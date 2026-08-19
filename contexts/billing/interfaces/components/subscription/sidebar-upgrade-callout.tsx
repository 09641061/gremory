import Link from "next/link";
import { CircleArrowUp } from "lucide-react";

/**
 * Sidebar plan indicator, sitting directly above the account control.
 *
 * It renders at a fixed spot instead of following the route, because a callout
 * that appears and disappears as the user navigates makes the whole footer jump.
 * It shows the owner's current plan name; the "Upgrade" affordance only appears
 * while the owner is on the Free plan.
 */
export function SidebarUpgradeCallout({
  planName,
  canUpgrade = false,
  href = "/upgrade",
}: {
  planName?: string | null;
  canUpgrade?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-(--app-sidebar-control-height) items-center gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground"
    >
      <CircleArrowUp className="size-(--app-sidebar-icon-size) shrink-0" aria-hidden="true" />
      <span className="truncate">{formatPlanName(planName)}</span>
      {canUpgrade ? (
        <span className="ml-auto font-semibold text-foreground underline decoration-muted-foreground/60 underline-offset-2">
          Upgrade
        </span>
      ) : null}
    </Link>
  );
}

function formatPlanName(planName?: string | null): string {
  switch ((planName ?? "").trim().toUpperCase()) {
    case "FREE":
      return "Free plan";
    case "STANDARD":
    case "STANDART":
      return "Standard plan";
    case "PREMIUM":
      return "Premium plan";
    default:
      return planName && planName.trim().length > 0 ? `${planName.trim()} plan` : "Free plan";
  }
}
