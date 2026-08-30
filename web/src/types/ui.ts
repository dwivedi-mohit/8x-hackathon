import type { PersonaId } from "./call.js";

export type AppScreen =
  | "home"
  | "persona-detail"
  | "call"
  | "ended"
  | "create-persona";

export type NavigationState = {
  currentScreen: AppScreen;
  selectedPersonaId: PersonaId;
  previousScreen?: AppScreen;
  callDurationSeconds: number;
};
