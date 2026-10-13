import { DEMO } from "../config.ts";
import { demoApi } from "./demo.ts";
import { httpApi } from "./http.ts";

export const api = DEMO ? demoApi : httpApi;
export * from "./types.ts";
