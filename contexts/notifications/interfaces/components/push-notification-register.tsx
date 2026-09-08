"use client";

import { useEffect } from "react";
import { requestPushPermission } from "@/lib/firebase";

interface PushNotificationRegisterProps {
  accessToken?: string;
}

export function PushNotificationRegister({ accessToken }: PushNotificationRegisterProps) {
  useEffect(() => {
    if (!accessToken) return;

    // Solicitar permiso al usuario y registrar el token en el backend
    requestPushPermission().then(async (token) => {
      if (token) {
        try {
          await fetch("/api/notifications/device-tokens", {
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
