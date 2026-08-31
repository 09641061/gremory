"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";

/**
 * This page is also reached transiently mid-onboarding (e.g. right after
 * creating an organization, before its establishment exists), so a retry is
 * the primary way out - signing out is a dead end for an account that is not
 * actually misconfigured.
 *
 * This page itself fetches nothing, so `router.refresh()` alone has nothing
 * to re-resolve and would just redraw the same static screen. The retry has
 * to send the account back through the guard: `/` re-runs the workspace
 * resolution and either lands on the right module or bounces back here with
 * an up-to-date verdict - never stuck, always a fresh answer.
 */
export function AccessDeniedActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
      <Link href="/organizations" className={buttonVariants({ variant: "outline" })}>
        Manage organizations
      </Link>
      <Button
        type="button"
        onClick={() =>
          startTransition(() => {
            router.push("/");
            router.refresh();
          })
        }
        disabled={isPending}
        className="gap-2"
      >
        {isPending ? <Spinner className="size-4" /> : null}
        {isPending ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}
