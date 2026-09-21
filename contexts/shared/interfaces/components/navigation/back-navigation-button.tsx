"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

export function BackNavigationButton({
  fallbackHref,
  forceFallback = false,
}: {
  fallbackHref: string;
  /**
   * When true, the button always navigates to `fallbackHref` instead of
   * `router.back()`. Use this for navigation hubs whose sub-pages are reached
   * through their own sidebar: there the browser history only reflects the
   * entry point, so `router.back()` can pop the user out of the app to an
   * unrelated previous page rather than to the hub's parent screen.
   */
  forceFallback?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  // The org settings hub (`/organization`, `/organization/members`,
  // `/organization/roles`, `/organization/invites`) is navigated via its own
  // left-hand sidebar. The browser history there only records the entry into
  // the hub, so `router.back()` would take the user out of the app to
  // whatever they were looking at before. Detect the hub here (client-side,
  // reactive to client navigations between sibling routes) and exit to the
  // workspace home instead.
  const isOrgSettingsHub =
    pathname === "/organization" || pathname.startsWith("/organization/");
  const mustUseFallback = forceFallback || isOrgSettingsHub;

  const handleBack = () => {
    if (!mustUseFallback && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-2"
      type="button"
      aria-label={t.common.back}
      title={t.common.back}
      onClick={handleBack}
    >
      <ArrowLeft />
    </Button>
  );
}
