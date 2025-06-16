importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.0/workbox-sw.js"
);

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

workbox.precaching.precacheAndRoute([
  { url: "/index.html", revision: "1" },
  { url: "/main.js", revision: "1" },
  { url: "/style.css", revision: "1" },

  { url: "/manifest.json", revision: "1" },
  { url: "/icons/icon-192x192.png", revision: "1" },
  { url: "/icons/icon-512x512.png", revision: "1" },
  { url: "/icons/icon-maskable-192x192.png", revision: "1" },
  { url: "/icons/icon-maskable-512x512.png", revision: "1" },
  { url: "/icons/shortcut-add-story.png", revision: "1" },

  { url: "/screenshots/screenshot-desktop.png", revision: "1" },
  { url: "/screenshots/screenshot-mobile.png", revision: "1" },
]);

workbox.routing.registerRoute(
  ({ request }) => request.destination === "image",
  new workbox.strategies.CacheFirst({
    cacheName: "story-app-images",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => {
    const isApiStories =
      url.origin === "https://story-api.dicoding.dev" &&
      url.pathname.startsWith("/v1/stories");
    if (isApiStories) {
      console.log("SW: Intercepting API stories request:", url.href);
    }
    return isApiStories;
  },
  new workbox.strategies.CacheFirst({
    cacheName: "story-app-api-data",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60,
      }),

      {
        cacheWillUpdate: async ({ response }) => {
          console.log("SW: API response WILL BE CACHED.");
          return response;
        },
        cachedResponseWillBeUsed: async ({ response }) => {
          console.log("SW: Serving API response FROM CACHE!");
          return response;
        },
        handlerDidError: async ({ request, error }) => {
          console.error("SW: API handler ERROR:", error);
          return null;
        },
      },
    ],
  })
);

workbox.routing.registerRoute(
  ({ url, request }) => {
    return (
      request.destination === "script" &&
      url.origin === self.location.origin &&
      !url.pathname.startsWith("/node_modules/")
    );
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: "story-app-local-js",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new workbox.strategies.CacheFirst({
    cacheName: "google-fonts-cache",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60,
        maxEntries: 30,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.origin === "https://unpkg.com",
  new workbox.strategies.CacheFirst({
    cacheName: "leaflet-cdn-cache",
    plugins: [
      new workbox.cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "Story App Notification",
    body: "Anda memiliki cerita baru!",
    icon: "/icons/icon-192x192.png",
  };

  if (event.data) {
    try {
      const receivedData = event.data.json();
      console.log("Push data from server:", receivedData);
      notificationData.title = receivedData.title || notificationData.title;
      notificationData.body = receivedData.body || notificationData.body;
      notificationData.icon = receivedData.icon || notificationData.icon;
      notificationData.image = receivedData.image || undefined;
      notificationData.data = receivedData.data || undefined;
    } catch (e) {
      console.error("Failed to parse push data as JSON:", e);
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      image: notificationData.image,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      badge: "/icons/icon-72x72.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification.tag);
  event.notification.close();

  const clickedNotificationData = event.notification.data;
  const targetUrl =
    clickedNotificationData && clickedNotificationData.url
      ? clickedNotificationData.url
      : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("Service Worker with Workbox script loaded.");
