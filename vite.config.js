// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa"; // <-- Import VitePWA

export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      // <-- Tambahkan plugin VitePWA
      registerType: "autoUpdate", // Mengatur agar Service Worker diperbarui secara otomatis
      injectRegister: "auto", // Menginjeksi kode registrasi Service Worker secara otomatis
      // Mode InjectManifest agar kita bisa menulis service worker secara mandiri
      strategies: "injectManifest",
      srcDir: ".", // Folder sumber service worker kita
      filename: "service-worker.js", // Nama file service worker kita
      devOptions: {
        enabled: true, // Aktifkan di development mode untuk debugging
      },
      manifest: {
        // Konfigurasi manifest yang akan di-generate/digunakan
        name: "Story App",
        short_name: "StoryApp",
        description: "Aplikasi berbagi cerita dari Dicoding.",
        start_url: "/index.html", // Pastikan ini benar untuk root yang di-deploy
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#28a745",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Tambah Cerita Baru",
            short_name: "Tambah",
            description: "Menambah cerita baru ke aplikasi",
            url: "/index.html#/add",
            icons: [{ src: "/icons/shortcut-add-story.png", sizes: "96x96" }],
          },
        ],
        screenshots: [
          {
            src: "/screenshots/screenshot-desktop.png",
            sizes: "1280x800",
            type: "image/png",
            form_factor: "wide", // Menggunakan form_factor untuk desktop
            label: "Tampilan Desktop Aplikasi Daftar Cerita",
          },
          {
            src: "/screenshots/screenshot-mobile.png",
            sizes: "750x1334",
            type: "image/png",
            form_factor: "narrow", // Menggunakan form_factor untuk mobile
            label: "Tampilan Mobile Aplikasi Daftar Cerita",
          },
        ],
      },
    }),
  ],
});
