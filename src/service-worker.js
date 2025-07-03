// src/service-worker.js

/* eslint-disable no-unused-vars */

// Konstanta Cache dan URL
const CACHE_NAME = "stories-app-cache"; // Nama cache aplikasi Anda
const CACHE_VERSION = "v1.0.0"; // Versi cache. Ubah ini jika ada perubahan pada aset yang di-cache
const CACHE_NAME_VERSIONED = `${CACHE_NAME}-${CACHE_VERSION}`;
const BASE_URL = "/"; // <--- PASTIKAN INI '/' UNTUK DEPLOYMENT ROOT ANDA
const OFFLINE_PAGE_URL = `${BASE_URL}offline.html`; // <--- Kita perlu membuat file offline.html

// Daftar URL yang akan di-cache saat instalasi Service Worker (Application Shell)
const urlsToCache = [
  BASE_URL, // Cache root URL
  `${BASE_URL}index.html`,
  `${BASE_URL}main.js`, // Nama file JS utama tanpa hash
  `${BASE_URL}style.css`, // Nama file CSS utama tanpa hash
  `${BASE_URL}manifest.json`, // Manifest PWA
  `${BASE_URL}offline.html`, // Halaman offline fallback

  // Icons (pastikan path ini sesuai dengan folder src/public/icons Anda)
  `${BASE_URL}icons/icon-192x192.png`,
  `${BASE_URL}icons/icon-512x512.png`,
  `${BASE_URL}icons/icon-maskable-192x192.png`,
  `${BASE_URL}icons/icon-maskable-512x512.png`,
  `${BASE_URL}icons/shortcut-add-story.png`,

  // Screenshots (pastikan path ini sesuai dengan folder src/public/screenshots Anda)
  `${BASE_URL}screenshots/screenshot-desktop.png`,
  `${BASE_URL}screenshots/screenshot-mobile.png`,

  // File JS aplikasi lainnya (sesuai struktur Anda dan nama file tanpa hash dari rollupOptions)
  // Ini harus sesuai dengan semua file .js di folder src/pages, src/routes, src/api, src/utils Anda
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

  // CDN dari Google Fonts (yang Anda gunakan di index.html)
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap",
  "https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JPZGzf5am.woff2", // Contoh WOFF2 untuk Poppins
  // ... tambahkan URL font spesifik lainnya jika ada

  // CDN dari Font Awesome
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/webfonts/fa-solid-900.woff2", // Contoh font-awesome font
  // ... tambahkan URL font-awesome font spesifik lainnya

  // CDN dari Leaflet
  "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
];

// Event 'install' - Cache the application shell
self.addEventListener("install", (event) => {
  console.log(`[Service Worker] Installing version ${CACHE_VERSION}...`);
  self.skipWaiting(); // Penting: aktifkan SW baru segera

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
            // Jangan gagal instalasi jika beberapa aset tidak bisa di-cache
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

// Event 'activate' - Clean up old caches and take control
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  // Remove old caches
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
  self.clients.claim(); // Ambil kendali semua klien segera
});

// Helper function untuk handle network requests dengan cache fallback
const handleNetworkRequest = async (request) => {
  try {
    const networkResponse = await fetch(request);

    // If we got a valid response, cache it (for GET requests only)
    if (request.method === "GET" && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME_VERSIONED);
      await cache.put(request, networkResponse.clone()); // Simpan respons ke cache
    }
    return networkResponse;
  } catch (error) {
    console.error("Network request failed, trying cache", error);
    throw error; // Lempar kembali agar bisa ditangkap oleh caller
  }
};

// Fetch event - Serve from cache, falling back to network or specific handlers
self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Abaikan non-GET requests dan non-http(s) requests
  if (
    event.request.method !== "GET" ||
    !requestUrl.protocol.startsWith("http")
  ) {
    return;
  }

  // Abaikan permintaan lintas-asal (cross-origin) yang tidak spesifik
  // kecuali untuk API atau CDN yang kita handle secara khusus
  if (
    requestUrl.origin !== self.location.origin &&
    requestUrl.origin !== "https://story-api.dicoding.dev" &&
    requestUrl.origin !== "https://fonts.googleapis.com" &&
    requestUrl.origin !== "https://fonts.gstatic.com" &&
    requestUrl.origin !== "https://unpkg.com"
  ) {
    return;
  }

  // Strategi Cache-First untuk aset statis dan CDN
  const cacheOnlyUrls = [
    self.location.origin, // Root dan semua aset lokal
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://unpkg.com",
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
          // Jika tidak ada di cache, coba network dan cache
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
              // Jika network juga gagal dan ini request navigation, layani offline page
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

  // Strategi Network-First dengan Cache Fallback untuk API Stories
  if (
    requestUrl.origin === "https://story-api.dicoding.dev" &&
    requestUrl.pathname.startsWith("/v1/stories")
  ) {
    event.respondWith(
      handleNetworkRequest(event.request) // Coba network
        .catch(async () => {
          // Jika network gagal
          const cachedResponse = await caches.match(event.request, {
            cacheName: CACHE_NAME_VERSIONED,
          });
          if (cachedResponse) {
            console.log(
              "SW: Serving API response from API cache as fallback in fetch handler!"
            );
            return cachedResponse;
          }
          // Jika tidak ada di cache, dan ini request API, kembalikan response error
          console.error(
            "SW: API request failed and no cache found for:",
            event.request.url
          );
          // Mengembalikan response khusus untuk aplikasi agar bisa menampilkan pesan error yang tepat
          return new Response(
            JSON.stringify({
              error: true,
              message: "Offline: Data tidak tersedia di cache.",
            }),
            {
              status: 503, // Service Unavailable
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  // Untuk permintaan lainnya (misalnya, gambar story dari API yang tidak ditangkap oleh Image Strategy awal)
  // Gunakan strategi Cache-First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const cache = caches.open(CACHE_NAME_VERSIONED);
            cache.then((c) => c.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "image") {
            // Placeholder jika gambar gagal dimuat
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

// Helper function untuk mengirim pesan ke semua klien
const notifyClients = async (message) => {
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => {
    client.postMessage(message);
  });
};

// Listen for push events (for Push Notifications)
self.addEventListener("push", (event) => {
  console.log("Push event received (from Service Worker):", event);
  const title = "Stories App";
  const options = {
    body: event.data?.text() || "You have new updates!",
    icon: `${BASE_URL}icons/icon-192x192.png`, // Perhatikan BASE_URL
    badge: `${BASE_URL}icons/icon-96x96.png`, // Perhatikan BASE_URL
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: `${BASE_URL}#/stories`, // URL yang akan dibuka saat notifikasi diklik
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received (from Service Worker).", event);
  event.notification.close();

  const targetUrl = event.notification.data?.url || `${BASE_URL}#/stories`; // Gunakan URL dari data notifikasi atau default

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Jika window sudah ada, fokus ke sana
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Jika tidak, buka window baru
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
        return null;
      })
  );
});
