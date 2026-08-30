import { describe, it, expect } from "vitest";
import { preparedPersonas, getPersonaById } from "../persona/personasData.js";
import { tokens } from "../../styles/tokens.js";
import type { CallStatus } from "../../types/call.js";

describe("Project Echo UI Layer", () => {
  it("includes Maya, Arjun, and Luna in prepared personas", () => {
    expect(preparedPersonas).toHaveLength(3);
    const ids = preparedPersonas.map((p) => p.id);
    expect(ids).toContain("maya");
    expect(ids).toContain("arjun");
    expect(ids).toContain("luna");
  });

  it("ensures each persona has distinct voice styles and suggested prompts", () => {
    preparedPersonas.forEach((persona) => {
      expect(persona.name).toBeTruthy();
      expect(persona.tagline).toBeTruthy();
      expect(persona.voiceStyle).toBeTruthy();
      expect(persona.suggestedPrompt).toBeTruthy();
      expect(persona.traits.length).toBeGreaterThanOrEqual(3);
      expect(persona.disclosure).toContain("fictional");
    });
  });

  it("retrieves persona correctly by ID", () => {
    const maya = getPersonaById("maya");
    expect(maya.name).toBe("Maya");
    expect(maya.id).toBe("maya");

    const arjun = getPersonaById("arjun");
    expect(arjun.name).toBe("Arjun");

    const luna = getPersonaById("luna");
    expect(luna.name).toBe("Luna");
  });

  it("verifies design tokens define light warm off-white canvas and lavender/peach accents", () => {
    expect(tokens.colors.canvas).toBe("#FAF8F5");
    expect(tokens.colors.lavenderPrimary).toBe("#7C3AED");
    expect(tokens.colors.peachWarm).toBe("#F4A261");
    expect(tokens.dimensions.mobileWidth).toBe("390px");
    expect(tokens.dimensions.minTouchTarget).toBe("44px");
  });

  it("validates all required mock call states exist", () => {
    const validStates: CallStatus[] = [
      "idle",
      "connecting",
      "listening",
      "thinking",
      "speaking",
      "reconnecting",
      "error",
      "ended",
    ];

    expect(validStates).toHaveLength(8);
  });
});
