"use client";

import { useEffect, useRef } from "react";
import { requestPushPermission, registerForegroundNotificationListener } from "@/lib/firebase";
import { registerDeviceTokenAction } from "../actions/notification.actions";

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
          const res = await registerDeviceTokenAction(token, "WEB");
          if (!res.success) {
            console.warn("Failed to register device token in backend:", res.error);
          }
        } catch (error) {
          console.error("Error registering device token in backend:", error);
        }
      }
    });

    // Listen for push notifications when the tab is in the foreground
    const unsubscribe = registerForegroundNotificationListener((payload) => {
      console.log("Foreground notification received:", payload);
      const title = payload.notification?.title || payload.data?.title || "Takodu Notification";
      const options = {
        body: payload.notification?.body || payload.data?.message || payload.data?.body || "",
        icon: "/favicon.ico",
      };

      if (Notification.permission === "granted") {
        new Notification(title, options);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [accessToken]);

  return null;
}

