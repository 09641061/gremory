"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MessageSquare, Phone, Unlink, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import {
  getEstablishmentWhatsappStatusAction,
  connectEstablishmentWhatsappAction,
  disconnectEstablishmentWhatsappAction,
} from "@/contexts/business/interfaces/actions/establishment.actions";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";
import type { WhatsappStatusResponse } from "../../../rest/schemas/establishment.schemas";

interface FBLoginOptions {
  config_id: string;
  response_type: string;
  override_default_response_type?: boolean;
  extras?: {
    featureType?: string;
    sessionInfoVersion?: number;
  };
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (options: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { code?: string }; status?: string }) => void,
        options: FBLoginOptions
      ) => void;
    };
  }
}

interface EstablishmentWhatsappSectionProps {
  establishmentId: string;
  canUpdate?: boolean;
}

export function EstablishmentWhatsappSection({
  establishmentId,
  canUpdate = true,
}: EstablishmentWhatsappSectionProps) {
  const { t } = useBusinessTranslations();
  const [status, setStatus] = useState<WhatsappStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [showManualCode, setShowManualCode] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

  const sessionInfoRef = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In development or when embedded, origins may include localhost or facebook domains
      if (
        !event.origin.includes("facebook.com") &&
        !event.origin.includes("localhost")
      ) {
        return;
      }
      try {
        const payload =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (payload && (payload.type === "WA_EMBEDDED_SIGNUP" || payload.event === "FINISH" || payload.event === "FINISH_ONLY_WABA")) {
          const wabaId = payload.data?.waba_id ?? payload.waba_id;
          const phoneNumberId = payload.data?.phone_number_id ?? payload.phone_number_id;
          if (wabaId || phoneNumberId) {
            sessionInfoRef.current = {
              wabaId: wabaId ? String(wabaId) : undefined,
              phoneNumberId: phoneNumberId ? String(phoneNumberId) : undefined,
            };
          }
        }
      } catch {
        // Ignore non-JSON postMessage events
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getEstablishmentWhatsappStatusAction(establishmentId)
      .then((result) => {
        if (!mounted) return;
        if (result.status === "success" && result.data) {
          setStatus(result.data as WhatsappStatusResponse);
        } else {
          setError(result.error ?? null);
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [establishmentId]);

  const appId = process.env.NEXT_PUBLIC_WHATSAPP_APP_ID;
  const configId = process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID;
  const apiVersion = process.env.NEXT_PUBLIC_WHATSAPP_GRAPH_API_VERSION ?? "v26.0";

  // Load Meta Facebook SDK dynamically if configured
  useEffect(() => {
    if (!appId || typeof window === "undefined" || window.FB) return;

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId,
        cookie: true,
        xfbml: true,
        version: apiVersion,
      });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId, apiVersion]);

  const handleConnectWithCode = (
    code: string,
    wabaId?: string,
    phoneNumberId?: string,
  ) => {
    setError(null);
    startTransition(async () => {
      const res = await connectEstablishmentWhatsappAction(
        establishmentId,
        code,
        wabaId ?? sessionInfoRef.current.wabaId,
        phoneNumberId ?? sessionInfoRef.current.phoneNumberId,
      );
      if (res.status === "success" && res.data) {
        setStatus(res.data as WhatsappStatusResponse);
        setManualCode("");
        setShowManualCode(false);
        sessionInfoRef.current = {};
      } else {
        setError(res.error ?? "Failed to connect WhatsApp line");
      }
    });
  };

  const handleLaunchPopup = () => {
    setError(null);
    if (!appId || !configId) {
      setError(t.establishments.whatsappSdkMissingConfig);
      return;
    }

    if (typeof window !== "undefined" && window.location.protocol !== "https:") {
      setShowManualCode(true);
      setError(t.establishments.whatsappHttpWarning);
      return;
    }

    if (!window.FB) {
      setError("Meta SDK is still loading, please retry in a moment or enter the code manually.");
      return;
    }

    sessionInfoRef.current = {};
    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          handleConnectWithCode(
            response.authResponse.code,
            sessionInfoRef.current.wabaId,
            sessionInfoRef.current.phoneNumberId,
          );
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          featureType: "whatsapp_embedded_signup",
          sessionInfoVersion: 3,
        },
      }
    );
  };

  const handleDisconnect = () => {
    setShowDisconnectDialog(false);
    setError(null);
    startTransition(async () => {
      const res = await disconnectEstablishmentWhatsappAction(establishmentId);
      if (res.status === "success") {
        setStatus((prev: WhatsappStatusResponse | null) =>
          prev
            ? { ...prev, connected: false, status: "DISCONNECTED", displayPhoneNumber: null, wabaId: null, phoneNumberId: null }
            : null
        );
      } else {
        setError(res.error ?? "Failed to disconnect WhatsApp line");
      }
    });
  };

  return (
    <div className="flex flex-col border-t border-border">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-semibold text-foreground">
                {t.establishments.whatsappTitle}
              </h3>
              {loading ? (
                <Spinner className="size-3 text-muted-foreground" />
              ) : (
                <StatusBadge tone={status?.connected ? "success" : "neutral"}>
                  {status?.connected
                    ? t.establishments.whatsappConnectedBadge
                    : t.establishments.whatsappDisconnectedBadge}
                </StatusBadge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t.establishments.whatsappDescription}
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex h-12 items-center">
            <Spinner className="size-4 text-muted-foreground" />
          </div>
        ) : status?.connected ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Phone className="size-4 text-muted-foreground" />
                <span>{status.displayPhoneNumber ?? "WhatsApp"}</span>
              </div>
              {status.wabaId && (
                <p className="text-xs text-muted-foreground">
                  {t.establishments.whatsappLineWaba.replace("{wabaId}", status.wabaId)}
                </p>
              )}
            </div>

            {canUpdate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setShowDisconnectDialog(true)}
                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isPending ? <Spinner className="size-3.5" /> : <Unlink className="size-3.5" />}
                {isPending
                  ? t.establishments.whatsappDisconnectingButton
                  : t.establishments.whatsappDisconnectButton}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {canUpdate && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleLaunchPopup}
                  className="gap-2 border-emerald-600/30 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                >
                  {isPending ? <Spinner className="size-3.5" /> : <MessageSquare className="size-3.5" />}
                  {isPending
                    ? t.establishments.whatsappConnectingButton
                    : t.establishments.whatsappConnectButton}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowManualCode((prev) => !prev)}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <KeyRound className="size-3" />
                  {t.establishments.whatsappManualCodeToggle}
                </Button>
              </div>
            )}

            {showManualCode && canUpdate && (
              <div className="flex max-w-md items-center gap-2 pt-1">
                <Input
                  type="text"
                  placeholder={t.establishments.whatsappManualCodePlaceholder}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  disabled={isPending}
                  className="text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={isPending || !manualCode.trim()}
                  onClick={() => handleConnectWithCode(manualCode.trim())}
                >
                  {isPending ? <Spinner className="size-3" /> : t.establishments.whatsappManualCodeSubmit}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.establishments.whatsappDisconnectConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.establishments.whatsappDisconnectConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t.establishments.whatsappDisconnectConfirmCancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDisconnect();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? <Spinner className="size-3.5" /> : null}
              {t.establishments.whatsappDisconnectConfirmAction}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
