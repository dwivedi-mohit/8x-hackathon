import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { Img2ThreejsConverter } from "../../lib/3d/Img2ThreejsEngine.js";
import { VoiceboxService } from "../../services/voice/VoiceboxService.js";

describe("img2threejs & Voicebox Real Engine Verification", () => {
  it("verifies Img2ThreejsConverter reconstructs complete procedural 3D character hierarchy", () => {
    // Mock image object
    const img = {} as HTMLImageElement;

    const result = Img2ThreejsConverter.reconstructCharacterFromImage(img, "Dada Ji");

    // 1. Verify 3D Model Group & parts
    expect(result.model).toBeInstanceOf(THREE.Group);
    expect(result.model.name).toBe("Character_Dada Ji");

    // Check anatomical hierarchy
    const headGroup = result.model.getObjectByName("headGroup");
    expect(headGroup).toBeDefined();

    const headwearGroup = headGroup?.getObjectByName("headwearGroup");
    expect(headwearGroup).toBeDefined();

    // 2. Verify mouth viseme tracking indices exist
    expect(result.mouthIndices).toBeDefined();
    expect(result.mouthIndices.length).toBeGreaterThan(0);

    // 3. Verify cranial head vertex buffer exists
    expect(result.headPosAttr).toBeDefined();
    expect(result.originalHeadPositions.length).toBeGreaterThan(0);

    // 4. Verify materials generated
    expect(result.materials.length).toBeGreaterThanOrEqual(5);
  });

  it("verifies VoiceboxService acoustic voice cloning profile", async () => {
    const audioBlob = new Blob([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])], { type: "audio/wav" });
    const profile = await VoiceboxService.cloneVoice(audioBlob, "Dada Ji");

    expect(profile).toBeDefined();
    expect(profile.speakerName).toBe("Dada Ji");
    expect(profile.fundamentalPitchHz).toBeGreaterThan(0);
    expect(profile.pitchShiftFactor).toBeGreaterThan(0);
    expect(profile.formants.f1).toBeGreaterThan(0);
    expect(profile.formants.f2).toBeGreaterThan(0);
    expect(profile.formants.f3).toBeGreaterThan(0);
    expect(profile.embeddingVector).toHaveLength(64);
  });
});
