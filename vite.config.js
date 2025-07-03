// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url"; // Diperlukan untuk __dirname di ES module

// Dapatkan nama direktori di ES module (untuk __dirname)
const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Root proyek kita adalah folder 'src'
  root: resolve(__dirname, "src"),

  // Base URL untuk deployment. Karena di Netlify kita deploy ke root, ini adalah '/'
  // Jika Anda deploy ke sub-folder (misal GitHub Pages), ini perlu diganti
  base: "/", // <--- PASTIKAN INI HANYA '/' UNTUK DEPLOYMENT ANDA SAAT INI

  // publicDir menunjukkan folder untuk aset statis yang akan disalin langsung ke root output
  // dan dapat diakses dari '/' (misal /manifest.json, /sw.js)
  publicDir: resolve(__dirname, "src", "public"), // <--- Sesuaikan dengan struktur Anda (sekarang 'src/public')

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: ".", // Aset seperti JS/CSS akan langsung di dalam 'dist/'
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"), // Entry point utama HTML Anda
        "service-worker": resolve(__dirname, "src/service-worker.js"), // <--- UBAH NAMA INPUT INI
      },
      output: {
        // entryFileNames: '[name].js', // Ini akan menghilangkan hashing nama file.
        // Biarkan default Rollup/Vite untuk hashing jika tidak ada kebutuhan spesifik
        // yang akan membuat caching Service Worker manual lebih sulit.
        // Mari kita tetap pakai default hashing untuk production.
        // Namun, teman Anda pakai entryFileNames: '[name].js' yang menghilangkan hashing.
        // Mari kita coba ikuti dia agar sesuai dengan cara dia precaching manual.
        entryFileNames: "[name].js", // <--- MENGHILANGKAN HASHING NAMA FILE UNTUK KEMUDAHAN CACHING MANUAL
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    open: "/", // Buka root path
    fs: {
      strict: false,
    },
    proxy: {
      // Add any API proxies if needed (tidak diperlukan untuk CORS push notification)
    },
    // Headers ini hanya untuk development server, tidak mempengaruhi produksi
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  plugins: [
    // Plugin manual untuk inject manifest dan meta tags ke index.html
    {
      name: "pwa-assets-injector",
      transformIndexHtml(html) {
        return html.replace(
          "</head>",
          `
          <link rel="manifest" href="/manifest.json" /> <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
          <meta name="theme-color" content="#28a745"> <meta name="mobile-web-app-capable" content="yes">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
          <meta name="apple-mobile-web-app-title" content="Stories App">
          <meta name="description" content="Aplikasi berbagi cerita">
          </head>`
        );
      },
    },
    // Plugin manual untuk Service Worker headers (hanya untuk development server)
    {
      name: "configure-sw-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          if (_req.url === "/sw.js" || _req.url === "/service-worker.js") {
            // Sesuaikan nama SW
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Service-Worker-Allowed", "/");
            res.setHeader("Cache-Control", "no-cache"); // Penting untuk development
          }
          // Memastikan MIME type yang benar untuk manifest
          if (
            _req.url.endsWith(".webmanifest") ||
            _req.url.endsWith("manifest.json")
          ) {
            res.setHeader("Content-Type", "application/manifest+json");
          }
          next();
        });
      },
      apply: "serve",
    },
  ],
});
