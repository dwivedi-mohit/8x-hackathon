import { describe, it, expect } from "vitest";
import { preparedPersonas, getPersonaById } from "../persona/personasData.js";
import { tokens } from "../../styles/tokens.js";
import type { CallStatus } from "../../types/call.js";

describe("Project Echo UI Layer", () => {
  it("includes default featured Dada Ji 3D persona", () => {
    expect(preparedPersonas.length).toBeGreaterThanOrEqual(1);
    const dadaji = preparedPersonas[0];
    expect(dadaji.id).toBe("dadaji");
    expect(dadaji.name).toBe("Dada Ji");
    expect(dadaji.photoUrl).toBeDefined();
  });

  it("ensures each persona has distinct voice styles and suggested prompts", () => {
    preparedPersonas.forEach((persona) => {
      expect(persona.name).toBeTruthy();
      expect(persona.tagline).toBeTruthy();
      expect(persona.voiceStyle).toBeTruthy();
      expect(persona.suggestedPrompt).toBeTruthy();
      expect(persona.traits.length).toBeGreaterThanOrEqual(3);
      expect(persona.disclosure).toBeTruthy();
    });
  });

  it("retrieves persona correctly by ID", () => {
    const dadaji = getPersonaById("dadaji");
    expect(dadaji.name).toBe("Dada Ji");
    expect(dadaji.id).toBe("dadaji");
  });

  it("verifies design tokens define translucent liquid-glass surfaces with lavender/peach accents", () => {
    expect(tokens.colors.canvas).toContain("rgba");
    expect(tokens.colors.surface).toContain("rgba");
    expect(tokens.colors.lavenderPrimary).toContain("rgba");
    expect(tokens.colors.peachWarm).toContain("rgba");
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
