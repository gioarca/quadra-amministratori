/**
 * API dimostrativa: dati in memoria, stessa logica che usa il server (`@quadra/shared/centrali`, service.ts).
 * Le modifiche valgono finché la pagina resta aperta, anche cambiando persona:
 * un preventivo mandato dalla ditta compare subito nel portale dell'amministratrice.
 */
import { buildCentraliDemo, commands, queries, type Dataset, type Result, type User } from "@quadra/shared/centrali";
import { ApiError, type Api, type Persona } from "./types.ts";

const state: { ds: Dataset; userId: string | null } = {
  ds: buildCentraliDemo(new Date()),
  userId: null,
};

const wait = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function me(): User {
  const u = state.ds.users.find((x) => x.id === state.userId);
  if (!u) throw new ApiError(401, "Scegli con chi entrare.");
  return u;
}

const q = () => queries({ ds: state.ds, user: me(), now: new Date() });
const c = () => commands({ ds: state.ds, user: me(), now: new Date() });

/** Applica un comando: il dataset aggiornato prende il posto di quello vecchio. */
function apply<T>(r: Result<T>): T {
  state.ds = r.ds;
  return r.result;
}

const PERSONAS: Persona[] = [
  {
    userId: "u-mario",
    name: "Mario Rossetto",
    role: "termotecnico",
    title: "Termotecnico, terzo responsabile",
    description: "Titolare di Rossetto Impianti, 61 anni. Segue 9 centrali condominiali con due tecnici.",
  },
  {
    userId: "u-laura",
    name: "Laura Bressan",
    role: "amministratore",
    title: "Amministratrice di condominio",
    description: "Studio Bressan, Treviso. Ha 7 condomini seguiti da tre ditte diverse.",
  },
];

export const demoApi: Api = {
  mode: "demo",
  personas: () => PERSONAS,

  async loginAs(userId) {
    await wait(200);
    state.userId = userId;
  },
  async requestCode() {
    throw new ApiError(400, "Nella demo si entra scegliendo la persona.");
  },
  async verifyCode() {
    throw new ApiError(400, "Nella demo si entra scegliendo la persona.");
  },
  async logout() {
    state.userId = null;
  },
  async me() {
    await wait(60);
    return state.ds.users.some((x) => x.id === state.userId) ? q().me() : null;
  },

  /* ditta */
  fleet: async () => (await wait(), q().fleet()),
  plant: async (id) => (await wait(), q().plant(id)),
  workOrders: async () => (await wait(), q().workOrders()),
  workOrder: async (id) => (await wait(), q().workOrder(id)),
  deadlines: async () => (await wait(), q().deadlines()),
  createWork: async (input) => (await wait(), apply(c().createWork(input))),
  assignWork: async (id, technicianId, scheduledFor) => void (await wait(), apply(c().assignWork(id, technicianId, scheduledFor))),
  startWork: async (id) => void (await wait(), apply(c().startWork(id))),
  completeWork: async (id, input) => void (await wait(300), apply(c().completeWork(id, input))),
  reopenWork: async (id) => void (await wait(), apply(c().reopenWork(id))),
  markCadastreSent: async (plantId) => void (await wait(300), apply(c().markCadastreSent(plantId))),
  createQuote: async (input) => (await wait(250), apply(c().createQuote(input))),

  /* entrambi */
  quotes: async () => (await wait(), q().quotes()),
  quote: async (id) => (await wait(), q().quote(id)),
  myBuildings: async () => (await wait(60), q().myBuildings()),

  /* amministratore */
  adminHome: async () => (await wait(), q().adminHome()),
  building: async (id) => (await wait(), q().building(id)),
  decideQuote: async (id, status, note) => void (await wait(250), apply(c().decideQuote(id, status, note))),
  notices: async () => (await wait(), q().notices()),
  createNotice: async (input) => (await wait(250), apply(c().createNotice(input))),

  // Nella demo la foto resta nel browser.
  uploadPhoto: async (file) => ({ id: crypto.randomUUID(), url: URL.createObjectURL(file) }),
};
