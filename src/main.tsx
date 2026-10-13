import "@fontsource-variable/atkinson-hyperlegible-next/wght.css";
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App.tsx";
import { SINGLE_FILE } from "./config.ts";
import { PrefsProvider } from "./lib/prefs.tsx";
import { ToastProvider } from "./components/Toast.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: (count, err) => count < 2 && !(err as { status?: number })?.status,
      refetchOnWindowFocus: true,
    },
  },
});

// L'anteprima in un file unico non ha indirizzi propri: la navigazione resta in memoria.
const Router = SINGLE_FILE ? MemoryRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrefsProvider>
        <ToastProvider>
          <Router>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </Router>
        </ToastProvider>
      </PrefsProvider>
    </QueryClientProvider>
  </StrictMode>,
);
