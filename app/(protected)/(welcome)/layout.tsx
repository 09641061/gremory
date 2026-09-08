import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeaderServer } from "@/contexts/shared/interfaces/components/header/app-header-server";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

// Welcome's page owns the existing entry guard. This shell never mounts app navigation.
export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-16 shrink-0" />}>
        <AppHeaderServer />
      </Suspense>
      <main className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </main>
    </>
  );
}
