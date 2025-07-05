import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: resolve(__dirname, "src"),

  base: "/",

  publicDir: resolve(__dirname, "src", "public"),

  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    assetsDir: ".",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        "service-worker": resolve(__dirname, "src/service-worker.js"),
      },
      output: {
        entryFileNames: "[name].js",
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
    open: "/",
    fs: {
      strict: false,
    },
    proxy: {},
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
  plugins: [
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
    {
      name: "configure-sw-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          if (_req.url === "/sw.js" || _req.url === "/service-worker.js") {
            res.setHeader("Content-Type", "application/javascript");
            res.setHeader("Service-Worker-Allowed", "/");
            res.setHeader("Cache-Control", "no-cache");
          }
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
