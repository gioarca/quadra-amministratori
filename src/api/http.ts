/**
 * Client dell'API vera (`/api/centrali`). Stesse risposte della demo: le schermate non cambiano.
 * La sessione è un cookie httpOnly: qui non si tocca nessun token.
 */
import { API_BASE } from "../config.ts";
import { ApiError, type Api, type Me } from "./types.ts";

const OFFLINE = "Sei senza connessione. Quando torna il segnale, riprova.";
const enc = encodeURIComponent;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/centrali${path}`, {
      method,
      credentials: "include",
      headers: body === undefined || body instanceof FormData ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, OFFLINE);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Qualcosa non ha funzionato. Riprova.");
  return data as T;
}

const none = async (p: Promise<unknown>) => void (await p);

export const httpApi: Api = {
  mode: "http",
  personas: () => [],
  loginAs: async () => {
    throw new ApiError(400, "Entra con la tua email.");
  },
  requestCode: (email) => request("POST", "/auth/request-code", { email }),
  verifyCode: (email, code) => none(request("POST", "/auth/verify", { email, code })),
  logout: () => none(request("POST", "/auth/logout")),
  async me() {
    try {
      return await request<Me>("GET", "/auth/me");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },

  /* ditta */
  fleet: () => request("GET", "/fleet"),
  plant: (id) => request("GET", `/plants/${enc(id)}`),
  workOrders: () => request("GET", "/work"),
  workOrder: (id) => request("GET", `/work/${enc(id)}`),
  createWork: (input) => request("POST", "/work", input),
  assignWork: (id, technicianId, scheduledFor) => none(request("POST", `/work/${enc(id)}/assign`, { technicianId, scheduledFor })),
  startWork: (id) => none(request("POST", `/work/${enc(id)}/start`)),
  completeWork: (id, input) => none(request("POST", `/work/${enc(id)}/complete`, input)),
  reopenWork: (id) => none(request("POST", `/work/${enc(id)}/reopen`)),
  markCadastreSent: (plantId) => none(request("POST", `/plants/${enc(plantId)}/catasto`)),
  deadlines: () => request("GET", "/deadlines"),
  createQuote: (input) => request("POST", "/quotes", input),

  /* entrambi */
  quotes: () => request("GET", "/quotes"),
  quote: (id) => request("GET", `/quotes/${enc(id)}`),
  myBuildings: () => request("GET", "/buildings"),

  /* amministratore */
  adminHome: () => request("GET", "/admin/home"),
  building: (id) => request("GET", `/buildings/${enc(id)}`),
  decideQuote: (id, status, note) => none(request("POST", `/quotes/${enc(id)}/decision`, { status, note })),
  notices: () => request("GET", "/notices"),
  createNotice: (input) => request("POST", "/notices", input),

  uploadPhoto(file, name) {
    const form = new FormData();
    form.append("photo", file, name);
    return request("POST", "/uploads", form);
  },
};
