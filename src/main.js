// src/main.js

import "./style.css";
import AppRouter from "./routes/AppRouter";
import StoryApiService from "./api/StoryApiService";

console.log(">>> main.js loaded and executing!");

// Fungsi untuk mengkonversi VAPID public key dari string ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// GANTI DENGAN VAPID PUBLIC KEY ASLI DARI DOKUMENTASI API DICODING
export const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"; // <-- GANTI INI!

// Fungsi untuk berlangganan push notification
export async function subscribeUserForPush() {
  const storyApiService = new StoryApiService();

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported by this browser.");
    alert("Browser Anda tidak mendukung notifikasi push.");
    return;
  }

  // Pastikan Service Worker sudah ready
  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  console.log("Service Worker is ready:", serviceWorkerRegistration.scope);

  // Cek apakah sudah ada subscription
  const existingSubscription =
    await serviceWorkerRegistration.pushManager.getSubscription();
  if (existingSubscription) {
    console.log("Existing push subscription found:", existingSubscription);
    try {
      // Penting: Selalu kirim ulang subscription yang ada untuk memastikan backend tahu (untuk robustnes)
      await storyApiService.sendUserSubscription(existingSubscription.toJSON());
      console.log("Existing subscription re-sent to backend.");
      alert("Anda akan menerima notifikasi cerita baru!"); // Notifikasi bahwa subscription berhasil
      return existingSubscription;
    } catch (error) {
      console.error("Failed to re-send existing subscription:", error);
      // Jika gagal kirim ulang, mungkin subscription di backend sudah expired. Coba unsubscribe yang lama dan subscribe ulang.
      await existingSubscription.unsubscribe();
      return subscribeUserForPush(); // Coba proses subscription dari awal
    }
  }

  console.log("Requesting push notification permission...");
  const permissionResult = await Notification.requestPermission();

  if (permissionResult !== "granted") {
    console.warn("Permission for push notifications not granted.");
    alert(
      "Izin notifikasi tidak diberikan. Fitur notifikasi tidak akan berfungsi."
    );
    return null;
  }

  try {
    console.log("Subscribing user for push notifications...");
    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    console.log("Push subscription successful:", subscription);
    await storyApiService.sendUserSubscription(subscription.toJSON()); // Kirim subscription ke backend
    alert("Anda akan menerima notifikasi cerita baru!"); // Notifikasi bahwa subscription berhasil
    return subscription;
  } catch (error) {
    console.error(
      "Failed to subscribe the user for push notifications:",
      error
    );
    alert(
      "Gagal berlangganan notifikasi. Pastikan Anda online dan berikan izin."
    );
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Pendaftaran Service Worker secara manual
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      // Panggil saat seluruh halaman dan aset dimuat
      navigator.serviceWorker
        .register("/service-worker.js") // Path Service Worker relatif terhadap root
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }

  const router = new AppRouter();
  router.handleLocation();
});
