// El Service Worker obtiene la configuración dinámicamente desde el cliente o mediante URL params
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_FIREBASE_CONFIG') {
    if (!self.firebaseAppInitialized && typeof firebase !== 'undefined') {
      firebase.initializeApp(event.data.config);
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
      self.firebaseAppInitialized = true;
    }
  }
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
