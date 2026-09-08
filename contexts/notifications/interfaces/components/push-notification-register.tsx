"use client";

import { useEffect, useRef } from "react";
import { requestPushPermission } from "@/lib/firebase";

interface PushNotificationRegisterProps {
  accessToken?: string;
}

export function PushNotificationRegister({ accessToken }: PushNotificationRegisterProps) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!accessToken || registeredRef.current) return;
    registeredRef.current = true;

    requestPushPermission().then(async (token) => {
      if (token) {
        try {
          await fetch("/api/v1/notifications/device-tokens", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ deviceToken: token, platform: "WEB" }),
          });
        } catch (error) {
          console.error("Error al registrar el device token en Haimiya:", error);
        }
      }
    });
  }, [accessToken]);

  return null;
}
