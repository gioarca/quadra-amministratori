import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Modalità:
 * - demo (npm run dev): dati di esempio nel browser, nessun server
 * - development (npm run dev:live): API vera su :4000 tramite proxy
 * - preview (npm run build:preview): la demo in un unico file HTML da condividere
 */
export default defineConfig(({ mode }) => {
  const singleFile = mode === "preview";
  return {
    plugins: [
      react(),
      tailwindcss(),
      singleFile
        ? viteSingleFile()
        : VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["icon.svg"],
            manifest: {
              name: "Quadra centrali",
              short_name: "Quadra",
              description: "Centrali termiche dei condomini: stato, guasti, scadenze e preventivi",
              lang: "it",
              start_url: "/",
              display: "standalone",
              background_color: "#F1F4F7",
              theme_color: "#14202E",
              icons: [
                { src: "icon-192.png", sizes: "192x192", type: "image/png" },
                { src: "icon-512.png", sizes: "512x512", type: "image/png" },
                { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
              ],
            },
            workbox: {
              navigateFallback: "/index.html",
              navigateFallbackDenylist: [/^\/api/, /^\/uploads/],
              // In centrale termica spesso non c'è campo: l'ultima scheda scaricata resta leggibile.
              runtimeCaching: [
                {
                  urlPattern: ({ url, request }) => url.pathname.startsWith("/api/centrali/") && request.method === "GET",
                  handler: "NetworkFirst",
                  options: { cacheName: "api-centrali", networkTimeoutSeconds: 6, expiration: { maxEntries: 120, maxAgeSeconds: 7 * 86400 } },
                },
              ],
            },
          }),
    ],
    server: {
      port: 5180,
      proxy: { "/api": "http://localhost:4000", "/uploads": "http://localhost:4000" },
    },
    build: singleFile
      ? { outDir: "dist-preview", assetsInlineLimit: 100_000_000, cssCodeSplit: false, emptyOutDir: true }
      : { outDir: "dist" },
  };
});
