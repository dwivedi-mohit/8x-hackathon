import type { PersonaId } from "./call.js";

export type PersonaTrait = string;

export type ClonedVoiceMetadata = {
  fileName: string;
  durationSeconds: number;
  isExtractedFromVideo: boolean;
  audioBlobUrl: string;
  pitchEstimateHz: number;
  sampleRate: number;
  channels: number;
  clarityPercent: number;
};

export type Persona = {
  id: PersonaId | string;
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
  photoUrl?: string;
  isCustom?: boolean;
  clonedVoice?: ClonedVoiceMetadata;
  disclosure: string;
};

export type CustomPersonaDraft = {
  name: string;
  tagline: string;
  voiceStyle: string;
  voiceSource: "preset" | "cloned";
  clonedVoice?: ClonedVoiceMetadata;
  description: string;
  suggestedPrompt?: string;
  traits: string[];
  photoPreviewUrl?: string;
  selectedAvatarIndex?: number;
  consentAcknowledged: boolean;
};
