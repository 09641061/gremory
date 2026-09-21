"use client";

import { useSearchParams } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "@/contexts/shared/interfaces/components/ui/alert";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ShieldAlert, X } from "lucide-react";
import { useEffect, useState, Suspense } from "react";

import { useRouter, usePathname } from "next/navigation";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

function ErrorBannerContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const denied = searchParams.get("denied");
    if (denied) {
      const timeoutId = window.setTimeout(() => {
        if (denied === "org") {
          setErrorMsg(t.shared.accessDeniedOrgDetails);
        } else if (denied === "est") {
          setErrorMsg(t.shared.accessDeniedOrgEstablishments);
        }
      }, 0);
      router.replace(pathname);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [searchParams, router, pathname, t.shared.accessDeniedOrgDetails, t.shared.accessDeniedOrgEstablishments]);

  if (!errorMsg) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-5">
      <Alert variant="destructive" className="relative rounded-lg border-destructive/20 bg-card pr-10 shadow-lg">
        <ShieldAlert className="size-4" />
        <AlertTitle>{t.shared.accessDenied}</AlertTitle>
        <AlertDescription>{errorMsg}</AlertDescription>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setErrorMsg(null)}
          className="absolute top-2.5 right-2.5 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
          aria-label={t.shared.dismissAlert}
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
