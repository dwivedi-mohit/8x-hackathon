import type { Persona } from "../../types/persona.js";
import dadajiImg from "../../assets/personas/dadaji.jpg";

export const defaultDemoPersona: Persona = {
  id: "dadaji",
  name: "Dada Ji",
  tagline: "Grandparent • 3D Companion",
  description:
    "Dada Ji is your loving grandfather. In calls, he shares timeless wisdom, warm encouragement, and gentle comfort whenever you need him.",
  voiceStyle: "Deep, warm, steady, and comforting",
  suggestedPrompt:
    "Dada Ji, how do I stay calm and focused when things feel overwhelming?",
  photoUrl: dadajiImg,
  traits: ["Wise", "Patient", "Loving", "Comforting"],
  avatarGradient: {
    start: "#F59E0B",
    end: "#B45309",
    glow: "rgba(245, 158, 11, 0.35)",
    ring: "#FDE68A",
  },
  clonedVoice: {
    fileName: "dadaji_voice.wav",
    durationSeconds: 15.4,
    isExtractedFromVideo: false,
    audioBlobUrl: "",
    pitchEstimateHz: 120,
    sampleRate: 44100,
    channels: 1,
    clarityPercent: 96,
  },
  disclosure:
    "Dada Ji is your personalized AI grandfather companion created to offer warm, comforting, and wise conversation.",
};

export const preparedPersonas: Persona[] = [defaultDemoPersona];

const CACHE_KEY = "echo_custom_personas_v4";

const loadCachedPersonas = (): Persona[] => {
  if (typeof window === "undefined") return [defaultDemoPersona];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [defaultDemoPersona];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [defaultDemoPersona];

    // Filter out dummy/demo test entries
    const cleanList = parsed.filter(
      (p: Persona) =>
        p &&
        p.name &&
        p.name.trim().length > 1 &&
        !/^(dfghj|asdf|test|dummy|abc)$/i.test(p.name.trim())
    );

    const hasDadaJi = cleanList.some(
      (p: Persona) => p.id === "dadaji" || p.name.toLowerCase().includes("dada")
    );
    if (!hasDadaJi) {
      cleanList.unshift(defaultDemoPersona);
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cleanList));
    return cleanList;
  } catch (err) {
    console.warn("Failed to load cached personas:", err);
    return [defaultDemoPersona];
  }
};

const saveCachedPersonas = (personas: Persona[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(personas));
  } catch (err) {
    console.warn("Failed to cache personas:", err);
  }
};

let customPersonasStore: Persona[] = loadCachedPersonas();

export const addCustomPersona = (persona: Persona): void => {
  const existingIdx = customPersonasStore.findIndex((p) => p.id === persona.id);
  if (existingIdx >= 0) {
    customPersonasStore[existingIdx] = persona;
  } else {
    customPersonasStore.unshift(persona);
  }
  saveCachedPersonas(customPersonasStore);
};

export const getAllPersonas = (): Persona[] => {
  if (customPersonasStore.length === 0) {
    return [defaultDemoPersona];
  }
  return [...customPersonasStore];
};

export const getPersonaById = (id: string): Persona => {
  const found = customPersonasStore.find((p) => p.id === id);
  if (found) return found;
  if (id === "dadaji") return defaultDemoPersona;
  return customPersonasStore[0] || defaultDemoPersona;
};
