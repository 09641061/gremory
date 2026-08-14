import Link from "next/link";
import { CircleArrowUp } from "lucide-react";

/**
 * Sidebar upgrade nudge, sitting directly above the account control.
 *
 * It renders at a fixed spot instead of following the route, because a callout
 * that appears and disappears as the user navigates makes the whole footer jump.
 * Whether it renders at all is `canOfferUpgrade`'s decision, not this component's.
 */
export function SidebarUpgradeCallout({ href = "/upgrade" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex h-(--app-sidebar-control-height) items-center gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground"
    >
      <CircleArrowUp className="size-(--app-sidebar-icon-size) shrink-0" aria-hidden="true" />
      <span className="truncate">Free plan</span>
      <span className="ml-auto font-semibold text-foreground underline decoration-muted-foreground/60 underline-offset-2">
        Upgrade
      </span>
    </Link>
  );
}
