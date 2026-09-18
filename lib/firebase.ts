import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

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
      console.warn("Firebase Messaging is not supported in this browser.");
      return null;
    }

    if (Notification.permission === "denied") {
      console.warn("Notification permission denied in browser.");
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
      console.warn("User did not grant notification permissions:", permission);
      return null;
    }
  } catch (error) {
    console.warn("Notification permission or push service failed:", error);
    if (String(error).includes("push service error") || String(error).includes("AbortError")) {
      console.warn(
        "💡 Note: If using Brave Browser, enable 'Use Google services for push messaging' in brave://settings/privacy. Push notifications are not supported in incognito/private mode."
      );
    }
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
    console.warn("Could not register foreground notification listener:", err);
    return () => {};
  }
};

