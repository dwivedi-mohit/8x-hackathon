import type { PersonaId } from "./call.js";

export type PersonaTrait = string;

export type Persona = {
  id: PersonaId;
  name: string;
  tagline: string;
  description: string;
  voiceStyle: string;
  suggestedPrompt: string;
  traits: PersonaTrait[];
  avatarGradient: {
    start: string;
    end: string;
    glow: string;
    ring: string;
  };
  disclosure: string;
};

export type CustomPersonaDraft = {
  name: string;
  tagline: string;
  voiceStyle: string;
  description: string;
  photoPreviewUrl?: string;
  consentAcknowledged: boolean;
};
