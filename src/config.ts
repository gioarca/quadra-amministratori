/**
 * Modalità:
 * - demo (`npm run dev`): dati di esempio nel browser, nessun server
 * - preview (`npm run build:preview`): la stessa demo in un unico file HTML
 * - development / production (`npm run dev:live`, `npm run build`): API vera su /api/centrali
 */
export const DEMO =
  import.meta.env.MODE === "demo" || import.meta.env.MODE === "preview" || import.meta.env.VITE_DEMO === "1";

/** Anteprima in un unico file HTML: niente indirizzi propri, niente service worker, niente stampa. */
export const SINGLE_FILE = import.meta.env.MODE === "preview";

/** Indirizzo dell'API se è su un altro dominio; vuoto = stesso dominio (proxy di Vite in sviluppo). */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
