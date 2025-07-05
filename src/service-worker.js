importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.5.0/workbox-sw.js"
);

console.log("Service Worker script loaded with manual Workbox integration.");

const CACHE_NAME = "stories-app-cache";
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME_VERSIONED = `${CACHE_NAME}-${CACHE_VERSION}`;
const BASE_URL = "/";
const OFFLINE_PAGE_URL = `${BASE_URL}offline.html`;

const urlsToCache = [
  BASE_URL, // Cache root URL
  `${BASE_URL}index.html`,
  `${BASE_URL}main.js`,
  `${BASE_URL}style.css`,
  `${BASE_URL}manifest.json`,
  `${BASE_URL}offline.html`,

  `${BASE_URL}icons/icon-192x192.png`,
  `${BASE_URL}icons/icon-512x512.png`,
  `${BASE_URL}icons/icon-maskable-192x192.png`,
  `${BASE_URL}icons/icon-maskable-512x512.png`,
  `${BASE_URL}icons/shortcut-add-story.png`,

  `${BASE_URL}screenshots/screenshot-desktop.png`,
  `${BASE_URL}screenshots/screenshot-mobile.png`,

  `${BASE_URL}pages/stories/StoryModel.js`,
  `${BASE_URL}pages/stories/StoryView.js`,
  `${BASE_URL}pages/stories/StoryPresenter.js`,
  `${BASE_URL}pages/add-story/AddStoryModel.js`,
  `${BASE_URL}pages/add-story/AddStoryView.js`,
  `${BASE_URL}pages/add-story/AddStoryPresenter.js`,
  `${BASE_URL}pages/login/LoginModel.js`,
  `${BASE_URL}pages/login/LoginView.js`,
  `${BASE_URL}pages/login/LoginPresenter.js`,
  `${BASE_URL}pages/favorites/FavoriteModel.js`,
  `${BASE_URL}pages/favorites/FavoriteView.js`,
  `${BASE_URL}pages/favorites/FavoritePresenter.js`,
  `${BASE_URL}routes/AppRouter.js`,
  `${BASE_URL}api/StoryApiService.js`,
  `${BASE_URL}utils/MapHelper.js`,
  `${BASE_URL}utils/IndexedDBHelper.js`,

  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JPZGzf5am.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2",

  "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
];

self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Installing version ${CACHE_VERSION}...`);
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME_VERSIONED)
      .then((cache) => {
        console.log("[Service Worker] Caching app shell and static assets");
        return cache
          .addAll(urlsToCache)
          .then(() => {
            console.log("[Service Worker] All assets have been cached");
          })
          .catch((error) => {
            console.error(
              "[Service Worker] Failed to cache some assets:",
              error
            );
          });
      })
      .catch((error) => {
        console.error(
          "[Service Worker] Failed to open cache during install:",
          error
        );
      })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith(CACHE_NAME) &&
            cacheName !== CACHE_NAME_VERSIONED
          ) {
            console.log("[Service Worker] Removing old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

const handleNetworkRequest = async (request) => {
  try {
    const networkResponse = await fetch(request);

    if (request.method === "GET" && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME_VERSIONED);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error("Network request failed, trying cache", error);
    throw error;
  }
};

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  if (
    event.request.method !== "GET" ||
    !requestUrl.protocol.startsWith("http")
  ) {
    return;
  }

  if (
    requestUrl.origin !== self.location.origin &&
    requestUrl.origin !== "https://story-api.dicoding.dev" &&
    requestUrl.origin !== "https://fonts.googleapis.com" &&
    requestUrl.origin !== "https://fonts.gstatic.com" &&
    requestUrl.origin !== "https://unpkg.com" &&
    requestUrl.origin !== "https://cdnjs.cloudflare.com"
  ) {
    return;
  }

  const cacheOnlyUrls = [
    self.location.origin,
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
  ];
  if (
    cacheOnlyUrls.some((origin) => requestUrl.origin.startsWith(origin)) &&
    requestUrl.pathname !== "/v1/stories"
  ) {
    event.respondWith(
      caches
        .match(event.request, { cacheName: CACHE_NAME_VERSIONED })
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log(
              `[Service Worker] Serving from cache: ${event.request.url}`
            );
            return cachedResponse;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.status === 200) {
                const cache = caches.open(CACHE_NAME_VERSIONED);
                cache.then((c) =>
                  c.put(event.request, networkResponse.clone())
                );
              }
              return networkResponse;
            })
            .catch(() => {
              if (event.request.mode === "navigate") {
                return caches.match(OFFLINE_PAGE_URL);
              }
              return new Response(
                "You are offline and this resource is not available in the cache.",
                { status: 408, headers: { "Content-Type": "text/plain" } }
              );
            });
        })
    );
    return;
  }

  if (
    requestUrl.origin === "https://story-api.dicoding.dev" &&
    requestUrl.pathname.startsWith("/v1/stories")
  ) {
    event.respondWith(
      handleNetworkRequest(event.request).catch(async () => {
        const cachedResponse = await caches.match(event.request, {
          cacheName: "story-app-api-data",
        });
        if (cachedResponse) {
          console.log(
            "SW: Serving API response from API cache as fallback in fetch handler!"
          );
          return cachedResponse;
        }
        console.error(
          "SW: API request failed and no cache found for:",
          event.request.url
        );
        return new Response(
          JSON.stringify({
            error: true,
            message: "Offline: Data tidak tersedia di cache.",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const cache = caches.open("story-images");
            cache.then((c) => c.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "image") {
            return new Response(
              '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Image not available</title><path fill="currentColor" d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01L3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4-4 4-4z"/></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }
          return new Response("Offline: Resource not available", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});

const notifyClients = async (message) => {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage(message);
  });
};

self.addEventListener("push", (event) => {
  console.log("Push event received (from Service Worker):", event);
  const title = "Stories App";
  const options = {
    body: event.data?.text() || "You have new updates!",
    icon: `${BASE_URL}icons/icon-192x192.png`,
    badge: `${BASE_URL}icons/icon-96x96.png`,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: `${BASE_URL}#/stories`,
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received (from Service Worker).", event);
  event.notification.close();

  const targetUrl = event.notification.data?.url || `${BASE_URL}#/stories`;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return clients.openWindow(targetUrl);
      })
  );
});
