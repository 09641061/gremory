import { Skeleton } from "../ui/skeleton";

/**
 * Server-rendered skeleton for {@link AppHeader}.
 *
 * Mirrors the real header's footprint (sticky top-0 z-20, h-16,
 * border-b, left brand + right profile/notification slot) so the layout
 * does not reflow when the async {@link AppHeaderServer} resolves.
 * Renders while the surrounding <Suspense> is pending.
 */
export function AppHeaderFallback() {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background px-4 sm:px-6">
      <Skeleton className="h-5 w-16" />
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    </header>
  );
}