"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ShieldAlert, X } from "lucide-react";
import { useEffect, useState, Suspense } from "react";

import { useRouter, usePathname } from "next/navigation";

function ErrorBannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const denied = searchParams.get("denied");
    if (denied) {
      setTimeout(() => {
        if (denied === "org") {
          setErrorMsg("You do not have permission to access organization details. Please contact your administrator.");
        } else if (denied === "est") {
          setErrorMsg("You do not have permission to access establishments in this organization. Please contact your administrator.");
        }
      }, 0);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  if (!errorMsg) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-5">
      <Alert variant="destructive" className="relative pr-10 shadow-lg bg-card">
        <ShieldAlert className="size-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>{errorMsg}</AlertDescription>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setErrorMsg(null)}
          className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
          aria-label="Dismiss alert"
        >
          <X className="size-4" />
        </Button>
      </Alert>
    </div>
  );
}

export function ErrorBanner() {
  return (
    <Suspense fallback={null}>
      <ErrorBannerContent />
    </Suspense>
  );
}
