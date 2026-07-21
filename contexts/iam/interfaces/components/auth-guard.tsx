"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const noSubscription = () => () => {};
const hasAccessToken = () =>
  window.localStorage.getItem("takodu.access_token")
    ? "authenticated"
    : "unauthenticated";
const serverAuthState = () => "checking";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const authenticated = useSyncExternalStore(
    noSubscription,
    hasAccessToken,
    serverAuthState
  );

  useEffect(() => {
    if (authenticated === "unauthenticated") router.replace("/login");
  }, [authenticated, router]);

  if (authenticated !== "authenticated") return null;

  return children;
}
