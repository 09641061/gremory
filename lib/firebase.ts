import { initializeApp, getApps } from "firebase/app";
import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { getMessaging, getToken, isSupported, onMessage, type MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const defaultVapidKey =
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const getFirebaseApp = () => {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
};

export const requestPushPermission = async (): Promise<string | null> => {
  try {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      recordSafely("firebase.messaging.unsupported", { level: "warn", code: "UNSUPPORTED_BROWSER" });
      return null;
    }

    if (Notification.permission === "denied") {
      recordSafely("firebase.messaging.permission", { level: "warn", code: "PERMISSION_DENIED" });
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const app = getFirebaseApp();
      const messaging = getMessaging(app);

      // Register and wait for service worker to be fully ready
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey: defaultVapidKey,
        serviceWorkerRegistration: registration,
      });

      return token;
    } else {
      recordSafely("firebase.messaging.permission", {
        level: "warn",
        code: "PERMISSION_NOT_GRANTED",
        context: { permission },
      });
      return null;
    }
  } catch (error) {
    recordSafely("firebase.messaging.request.failed", { cause: error });
  }
  return null;
};

export const registerForegroundNotificationListener = (
  onNotificationReceived: (payload: MessagePayload) => void
) => {
  if (typeof window === "undefined") return () => {};

  try {
    const app = getFirebaseApp();
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      onNotificationReceived(payload);
    });
  } catch (err) {
    recordSafely("firebase.messaging.listener.failed", { cause: err });
    return () => {};
  }
};

