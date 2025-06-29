// src/service-worker.js

/* eslint-disable no-unused-vars */

// Workbox diimport oleh vite-plugin-pwa secara internal, tidak perlu importScripts
// Cukup import modul yang dibutuhkan dari workbox-sw
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// Variabel Workbox global seharusnya sudah tersedia berkat vite-plugin-pwa
// Kita tidak perlu lagi if (workbox) check di sini, cukup gunakan modulnya

console.log("Service Worker script loaded with VitePWA integration.");

// Workbox Precaching untuk Application Shell.
// '__WB_MANIFEST' adalah placeholder yang akan diisi otomatis oleh vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST);

// Strategi Caching untuk Gambar (Image): Cache First
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "story-app-images",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Strategi Caching untuk API (API Story Dicoding): CacheFirst
registerRoute(
  ({ url }) => {
    const isApiStories =
      url.origin === "https://story-api.dicoding.dev" &&
      url.pathname.startsWith("/v1/stories");
    if (isApiStories) {
      console.log(
        "SW: Intercepting API stories request (from Service Worker):",
        url.href
      );
    }
    return isApiStories;
  },
  new CacheFirst({
    cacheName: "story-app-api-data",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
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

// Strategi Caching untuk Semua File JavaScript Aplikasi Lokal: StaleWhileRevalidate
registerRoute(
  ({ url, request }) => {
    return (
      request.destination === "script" &&
      url.origin === self.location.origin &&
      !url.pathname.startsWith("/node_modules/")
    );
  },
  new StaleWhileRevalidate({
    cacheName: "story-app-local-js",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

// Strategi Caching untuk Google Fonts: Cache First
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 365 * 24 * 60 * 60,
        maxEntries: 30,
      }),
    ],
  })
);

// Strategi Caching untuk CDN Leaflet: Cache First
registerRoute(
  ({ url }) => url.origin === "https://unpkg.com",
  new CacheFirst({
    cacheName: "leaflet-cdn-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// >>>>>> TAMBAHKAN KODE setCatchHandler INI <<<<<<
// setCatchHandler adalah fallback handler terakhir jika strategi Workbox gagal merespons
workbox.routing.setCatchHandler(async ({ event }) => {
  console.log("SW: setCatchHandler triggered for:", event.request.url);

  // Jika permintaan adalah navigasi (misalnya, pengguna mencoba membuka URL yang tidak di-cache)
  if (event.request.mode === "navigate") {
    // Coba kembalikan index.html dari cache precache
    const cachedResponse = await caches.match("/index.html");
    if (cachedResponse) {
      console.log("SW: Serving index.html from cache as fallback.");
      return cachedResponse;
    }
  }

  // Jika permintaan untuk gambar dan gambar gagal, bisa mengembalikan fallback image
  if (event.request.destination === "image") {
    // return caches.match('/path/to/offline-image.png'); // Contoh: jika Anda punya gambar offline default
    console.log("SW: Image request failed, no fallback image provided.");
  }

  // Jika ini adalah permintaan API yang gagal, coba ambil dari cache API
  if (
    event.request.url.origin === "https://story-api.dicoding.dev" &&
    event.request.url.pathname.startsWith("/v1/stories")
  ) {
    const cachedResponse = await caches.match(event.request.url, {
      cacheName: "story-app-api-data",
    });
    if (cachedResponse) {
      console.log(
        "SW: Serving API response from API cache as fallback in catchHandler!"
      );
      return cachedResponse;
    }
  }

  // Jika tidak ada fallback yang bisa diberikan, kembalikan sinyal 'no-response'
  console.log("SW: setCatchHandler could not provide a response.");
  return Response.error(); // Mengembalikan respons error jaringan standar
});
// >>>>>> AKHIR KODE setCatchHandler INI <<<<<<

// Event 'push' dipanggil saat Service Worker menerima pesan push dari server
self.addEventListener("push", (event) => {
  console.log("Push event received (from Service Worker):", event);

  let notificationData = {
    title: "Story App Notification",
    body: "Anda memiliki cerita baru!",
    icon: "/icons/icon-192x192.png",
  };

  if (event.data) {
    try {
      const receivedData = event.data.json();
      console.log("Push data from server (from Service Worker):", receivedData);
      notificationData.title = receivedData.title || notificationData.title;
      notificationData.body = receivedData.body || notificationData.body;
      notificationData.icon = receivedData.icon || notificationData.icon;
      notificationData.image = receivedData.image || undefined;
      notificationData.data = receivedData.data || undefined;
    } catch (e) {
      console.error(
        "Failed to parse push data as JSON (from Service Worker):",
        e
      );
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

// Event 'notificationclick' dipanggil saat pengguna mengklik notifikasi
self.addEventListener("notificationclick", (event) => {
  console.log(
    "Notification clicked (from Service Worker):",
    event.notification.tag
  );
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

// Event 'message' untuk menerima pesan dari halaman utama
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
