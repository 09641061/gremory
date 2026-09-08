importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB3W9vun82YzTHjFOxwS3Odq-BJm2dCtxg",
  authDomain: "takodu-notification.firebaseapp.com",
  projectId: "takodu-notification",
  storageBucket: "takodu-notification.firebasestorage.app",
  messagingSenderId: "640713668079",
  appId: "1:640713668079:web:19ce5db17e24507a7f721a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "Notificación de Takodu";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: '/favicon.ico',
    data: {
      url: payload.data?.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
