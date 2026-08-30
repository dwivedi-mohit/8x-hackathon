import React, { useState, useRef } from "react";
import type { Persona } from "../../types/persona.js";
import { AppHeader } from "../../components/AppHeader.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { tokens } from "../../styles/tokens.js";
import {
  extractVoiceFromMediaFile,
  playSampleSpeech,
  type ExtractedVoiceResult,
} from "../../lib/audio/VoiceExtractor.js";

type CreatePersonaScreenProps = {
  onBack: () => void;
  onCreated?: (newPersona: Persona) => void;
  onStartCallWithNewPersona?: (newPersona: Persona) => void;
};

const PRESET_AVATARS = [
  {
    name: "Lavender Twilight",
    gradient: {
      start: "#A78BFA",
      end: "#C084FC",
      glow: "rgba(167, 139, 250, 0.4)",
      ring: "#DDD6FE",
    },
  },
  {
    name: "Warm Peach",
    gradient: {
      start: "#F4A261",
      end: "#E76F51",
      glow: "rgba(244, 162, 97, 0.4)",
      ring: "#FED7AA",
    },
  },
  {
    name: "Sage Serenity",
    gradient: {
      start: "#34D399",
      end: "#10B981",
      glow: "rgba(52, 211, 153, 0.4)",
      ring: "#A7F3D0",
    },
  },
  {
    name: "Midnight Indigo",
    gradient: {
      start: "#6366F1",
      end: "#4F46E5",
      glow: "rgba(99, 102, 241, 0.4)",
      ring: "#C7D2FE",
    },
  },
  {
    name: "Blush Rose",
    gradient: {
      start: "#F472B6",
      end: "#FB7185",
      glow: "rgba(244, 114, 182, 0.4)",
      ring: "#FBCFE8",
    },
  },
  {
    name: "Golden Sunrise",
    gradient: {
      start: "#FBBF24",
      end: "#F59E0B",
      glow: "rgba(251, 191, 36, 0.4)",
      ring: "#FDE68A",
    },
  },
];

const PRESET_VOICES = [
  {
    id: "gentle",
    name: "Gentle & Calming",
    description: "Soft, steady, soothing cadence (Maya-like)",
    pitchHz: 165,
    sampleText: "Take a slow breath with me. We can explore this together.",
  },
  {
    id: "direct",
    name: "Direct & Practical",
    description: "Crisp, warm, grounded, and clear (Arjun-like)",
    pitchHz: 125,
    sampleText: "Let's cut through the noise. What is the single most important step today?",
  },
  {
    id: "poetic",
    name: "Poetic & Melodic",
    description: "Empathetic, lyrical, and hopeful (Luna-like)",
    pitchHz: 180,
    sampleText: "Even on cloudy days, the quiet horizon is always waiting for you.",
  },
  {
    id: "inquisitive",
    name: "Warm & Inquisitive",
    description: "Engaging, curious, and open-minded",
    pitchHz: 150,
    sampleText: "That's fascinating. What led you to think about that in the first place?",
  },
  {
    id: "deep",
    name: "Deep & Grounding",
    description: "Resonant, reassuring, unhurried presence",
    pitchHz: 105,
    sampleText: "You are doing just fine. Let's take this one manageable moment at a time.",
  },
];

const SUGGESTED_NAMES = ["Robin", "Aria", "Kiran", "Zoe", "Orion", "Mira"];

const ROLE_PRESETS = [
  {
    emoji: "🧘",
    title: "Grounding Presence",
    tagline: "A calm companion to untangle racing thoughts",
    icebreaker: "My mind won't stop spinning today. Where should I start?",
    traits: ["Calm", "Reflective", "Patient"],
  },
  {
    emoji: "💡",
    title: "Practical Sounding Board",
    tagline: "A direct partner to clarify decisions and next steps",
    icebreaker: "I'm stuck between two choices and need a clear perspective.",
    traits: ["Practical", "Direct", "Insightful"],
  },
  {
    emoji: "🌸",
    title: "Empathetic Listener",
    tagline: "A gentle friend who offers warmth and quiet hope",
    icebreaker: "I feel like I've been way too hard on myself lately.",
    traits: ["Gentle", "Hopeful", "Empathetic"],
  },
  {
    emoji: "🚀",
    title: "Creative Catalyst",
    tagline: "A lively partner to brainstorm fresh possibilities",
    icebreaker: "I have a wild idea and want to see where we can take it.",
    traits: ["Creative", "Curious", "Playful"],
  },
];

const ALL_TRAITS = [
  "Calm",
  "Insightful",
  "Gentle",
  "Direct",
  "Creative",
  "Grounding",
  "Hopeful",
  "Analytical",
  "Empathetic",
  "Playful",
  "Patient",
  "Honest",
];

export const CreatePersonaScreen: React.FC<CreatePersonaScreenProps> = ({
  onBack,
  onCreated,
  onStartCallWithNewPersona,
}) => {
  // Step navigation (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number | null>(null);

  // Avatar State
  const [avatarMode, setAvatarMode] = useState<"preset" | "photo">("preset");
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState<number>(0);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Voice State
  const [voiceMode, setVoiceMode] = useState<"preset" | "clone">("preset");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("gentle");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Voice Clone State
  const [isExtractingVoice, setIsExtractingVoice] = useState(false);
  const [extractionStage, setExtractionStage] = useState("");
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [clonedVoiceResult, setClonedVoiceResult] = useState<ExtractedVoiceResult | null>(null);
  const [cloneAudioPlaying, setCloneAudioPlaying] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Personality & Icebreaker State
  const [selectedTraits, setSelectedTraits] = useState<string[]>(["Calm", "Reflective"]);
  const [suggestedPrompt, setSuggestedPrompt] = useState(
    "I’ve had a busy week and my head won't stop racing. Where do I begin?"
  );
  const [description, setDescription] = useState("");

  // Consent & Completion State
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [createdPersona, setCreatedPersona] = useState<Persona | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceMediaInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Handlers for Photo Upload
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrl(url);
      setAvatarMode("photo");
    }
  };

  // Handlers for Voice Media Extraction (Audio or Video)
  const handleVoiceMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCloneError(null);
    setIsExtractingVoice(true);
    setExtractionProgress(10);
    setExtractionStage("Initializing media pipeline…");

    try {
      const result = await extractVoiceFromMediaFile(file, (stage, percent) => {
        setExtractionStage(stage);
        setExtractionProgress(percent);
      });

      setClonedVoiceResult(result);
      setVoiceMode("clone");
    } catch (err) {
      console.error("Voice extraction failed:", err);
      setCloneError(
        "Could not decode audio from this file. Please ensure it contains a valid audio/video stream."
      );
    } finally {
      setIsExtractingVoice(false);
    }
  };

  const handleToggleClonePlayback = () => {
    if (!clonedVoiceResult) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(clonedVoiceResult.metadata.audioBlobUrl);
      audioPlayerRef.current.onended = () => setCloneAudioPlaying(false);
    }

    if (cloneAudioPlaying) {
      audioPlayerRef.current.pause();
      setCloneAudioPlaying(false);
    } else {
      audioPlayerRef.current.currentTime = 0;
      void audioPlayerRef.current.play();
      setCloneAudioPlaying(true);
    }
  };

  const handleTestClonedVoiceSpeech = () => {
    if (!clonedVoiceResult) return;
    const testLine = `Hello! I am ${name || "your companion"}, and this is my newly calibrated voice.`;
    setCloneAudioPlaying(true);
    playSampleSpeech(
      testLine,
      clonedVoiceResult.metadata.pitchEstimateHz,
      () => setCloneAudioPlaying(true),
      () => setCloneAudioPlaying(false)
    );
  };

  const handlePreviewPresetVoice = (voice: typeof PRESET_VOICES[0]) => {
    setPlayingVoiceId(voice.id);
    playSampleSpeech(
      voice.sampleText,
      voice.pitchHz,
      () => setPlayingVoiceId(voice.id),
      () => setPlayingVoiceId(null)
    );
  };

  const handleSelectRolePreset = (index: number) => {
    setSelectedRoleIndex(index);
    const role = ROLE_PRESETS[index];
    setTagline(role.tagline);
    setSuggestedPrompt(role.icebreaker);
    setSelectedTraits(role.traits);
  };

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      if (selectedTraits.length < 5) {
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  const handleFinalCreate = () => {
    if (!consentAcknowledged || !name.trim()) return;

    const chosenVoice = PRESET_VOICES.find((v) => v.id === selectedVoiceId);
    const voiceStyleText =
      voiceMode === "clone" && clonedVoiceResult
        ? `Custom Cloned Voice (${clonedVoiceResult.metadata.isExtractedFromVideo ? "Video Track" : "Audio Track"}: ${clonedVoiceResult.metadata.fileName}, ${clonedVoiceResult.metadata.pitchEstimateHz}Hz)`
        : chosenVoice?.name || "Gentle & Calming";

    const customId = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

    const newPersona: Persona = {
      id: customId,
      name: name.trim(),
      tagline: tagline.trim() || "A thoughtful AI companion",
      description:
        description.trim() ||
        `${name} is a custom fictional companion designed to offer warm, attentive conversation.`,
      voiceStyle: voiceStyleText,
      suggestedPrompt:
        suggestedPrompt.trim() ||
        `Hey ${name}, I'd love to chat through what's on my mind right now.`,
      traits: selectedTraits.length > 0 ? selectedTraits : ["Calm", "Reflective"],
      avatarGradient: PRESET_AVATARS[selectedAvatarIndex].gradient,
      photoUrl: avatarMode === "photo" && photoPreviewUrl ? photoPreviewUrl : undefined,
      isCustom: true,
      clonedVoice: voiceMode === "clone" && clonedVoiceResult ? clonedVoiceResult.metadata : undefined,
      disclosure: `${name} is a fictional AI-created character. Not a real person, therapist, or emergency service.`,
    };

    setCreatedPersona(newPersona);
    onCreated?.(newPersona);
  };

  // Render Step Content
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        flex: 1,
        backgroundColor: tokens.colors.canvas,
      }}
    >
      <AppHeader
        title={createdPersona ? "Persona Ready!" : "Create Persona"}
        showBack={!createdPersona}
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
          } else {
            onBack();
          }
        }}
        rightAction={
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: tokens.colors.lavenderPrimary,
              backgroundColor: tokens.colors.surfaceLavenderTint,
              padding: "4px 10px",
              borderRadius: tokens.radii.full,
              border: `1px solid ${tokens.colors.borderLavender}`,
            }}
          >
            {createdPersona ? "✨ Ready" : `Step ${currentStep} of 6`}
          </span>
        }
      />

      {/* Progress Segment Bar */}
      {!createdPersona && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            padding: "8px 20px 4px",
            backgroundColor: tokens.colors.surface,
            borderBottom: `1px solid ${tokens.colors.borderSubtle}`,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((stepNumber) => (
            <div
              key={stepNumber}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                backgroundColor:
                  stepNumber <= currentStep
                    ? tokens.colors.lavenderPrimary
                    : tokens.colors.borderSubtle,
                transition: "background-color 0.25s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Form Body */}
      <div
        style={{
          padding: `${tokens.spacing.lg} ${tokens.spacing.xl} 32px`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
          flex: 1,
        }}
      >
        {/* ============================================================ */}
        {/* STEP 1: CHARACTER NAME */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Question 1 of 5
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                What's your character's name?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Give your companion a distinct name to address them in conversation.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xs }}>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Robin, Zara, Kaia…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: tokens.radii.lg,
                  border: `2px solid ${name ? tokens.colors.lavenderPrimary : tokens.colors.border}`,
                  fontSize: "18px",
                  fontWeight: 600,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                  boxShadow: tokens.shadows.subtle,
                  transition: "border-color 0.2s ease",
                }}
              />
            </div>

            {/* Suggested Name Pills */}
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: tokens.colors.textTertiary,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Popular inspiration:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {SUGGESTED_NAMES.map((sugName) => (
                  <button
                    key={sugName}
                    type="button"
                    onClick={() => setName(sugName)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: tokens.radii.full,
                      backgroundColor: name === sugName ? tokens.colors.lavenderSubtle : tokens.colors.surface,
                      border: `1px solid ${name === sugName ? tokens.colors.lavenderPrimary : tokens.colors.border}`,
                      color: name === sugName ? tokens.colors.lavenderPrimary : tokens.colors.textSecondary,
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    + {sugName}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ROLE & ONE-LINE PROMISE */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Question 2 of 5
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                What is {name || "your character"}'s emotional promise?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Choose an inspiration template or write a custom one-line description.
              </p>
            </div>

            {/* Inspiration Role Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ROLE_PRESETS.map((role, idx) => (
                <div
                  key={role.title}
                  onClick={() => handleSelectRolePreset(idx)}
                  role="button"
                  tabIndex={0}
                  style={{
                    padding: "12px 16px",
                    borderRadius: tokens.radii.lg,
                    backgroundColor:
                      selectedRoleIndex === idx
                        ? tokens.colors.surfaceLavenderTint
                        : tokens.colors.surface,
                    border: `1.5px solid ${
                      selectedRoleIndex === idx
                        ? tokens.colors.lavenderPrimary
                        : tokens.colors.border
                    }`,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    boxShadow: tokens.shadows.subtle,
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{role.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                      {role.title}
                    </h4>
                    <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                      {role.tagline}
                    </p>
                  </div>
                  {selectedRoleIndex === idx && (
                    <span style={{ color: tokens.colors.lavenderPrimary, fontWeight: 700 }}>✓</span>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Tagline Input */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.textSecondary,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Or customize the tagline:
              </label>
              <input
                type="text"
                placeholder="e.g. A comforting companion who listens deeply"
                value={tagline}
                onChange={(e) => {
                  setTagline(e.target.value);
                  setSelectedRoleIndex(null);
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: tokens.radii.md,
                  border: `1.5px solid ${tokens.colors.border}`,
                  fontSize: "14px",
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: VISUAL PORTRAIT / AVATAR */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Question 3 of 5
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                How should {name || "your character"} look?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Choose an illustrated aesthetic or upload a custom character image.
              </p>
            </div>

            {/* Avatar Preview */}
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background:
                    avatarMode === "photo" && photoPreviewUrl
                      ? "transparent"
                      : `linear-gradient(135deg, ${PRESET_AVATARS[selectedAvatarIndex].gradient.start} 0%, ${PRESET_AVATARS[selectedAvatarIndex].gradient.end} 100%)`,
                  border: "4px solid #FFFFFF",
                  boxShadow: `0 8px 24px ${PRESET_AVATARS[selectedAvatarIndex].gradient.glow}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontSize: "40px",
                  fontWeight: 700,
                  overflow: "hidden",
                }}
              >
                {avatarMode === "photo" && photoPreviewUrl ? (
                  <img
                    src={photoPreviewUrl}
                    alt={name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span>{(name || "E").charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Mode Switcher */}
            <div
              style={{
                display: "flex",
                backgroundColor: tokens.colors.canvasMuted,
                padding: "4px",
                borderRadius: tokens.radii.full,
              }}
            >
              <button
                type="button"
                onClick={() => setAvatarMode("preset")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: tokens.radii.full,
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: avatarMode === "preset" ? tokens.colors.surface : "transparent",
                  color:
                    avatarMode === "preset"
                      ? tokens.colors.lavenderPrimary
                      : tokens.colors.textSecondary,
                  boxShadow: avatarMode === "preset" ? tokens.shadows.subtle : "none",
                }}
              >
                🎨 Color Themes
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode("photo")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: tokens.radii.full,
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: avatarMode === "photo" ? tokens.colors.surface : "transparent",
                  color:
                    avatarMode === "photo"
                      ? tokens.colors.lavenderPrimary
                      : tokens.colors.textSecondary,
                  boxShadow: avatarMode === "photo" ? tokens.shadows.subtle : "none",
                }}
              >
                📷 Upload Photo
              </button>
            </div>

            {/* Avatar Selector Options */}
            {avatarMode === "preset" ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                }}
              >
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarIndex(idx);
                      setPhotoPreviewUrl(null);
                    }}
                    style={{
                      padding: "12px 8px",
                      borderRadius: tokens.radii.lg,
                      backgroundColor: tokens.colors.surface,
                      border: `2px solid ${
                        selectedAvatarIndex === idx
                          ? tokens.colors.lavenderPrimary
                          : tokens.colors.border
                      }`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: tokens.shadows.subtle,
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${av.gradient.start} 0%, ${av.gradient.end} 100%)`,
                      }}
                    />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: tokens.colors.textSecondary }}>
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                style={{
                  border: `2px dashed ${tokens.colors.borderLavender}`,
                  borderRadius: tokens.radii.card,
                  padding: "24px 16px",
                  textAlign: "center",
                  backgroundColor: tokens.colors.surfaceLavenderTint,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  style={{ display: "none" }}
                />
                <span style={{ fontSize: "32px" }}>📸</span>
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.lavenderPrimary }}>
                    {photoPreviewUrl ? "Change selected photo" : "Select a portrait image"}
                  </span>
                  <p style={{ fontSize: "12px", color: tokens.colors.textTertiary, marginTop: "2px" }}>
                    Supports PNG, JPG, WebP (character art or illustration)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4: VOICE & VOICE CLONING (AUDIO / VIDEO EXTRACTION) */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Question 4 of 5
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                How should {name || "your character"} speak?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Select a curated AI voice style or upload a video/audio file to clone the voice.
              </p>
            </div>

            {/* Voice Mode Selector */}
            <div
              style={{
                display: "flex",
                backgroundColor: tokens.colors.canvasMuted,
                padding: "4px",
                borderRadius: tokens.radii.full,
              }}
            >
              <button
                type="button"
                onClick={() => setVoiceMode("preset")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: tokens.radii.full,
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: voiceMode === "preset" ? tokens.colors.surface : "transparent",
                  color:
                    voiceMode === "preset"
                      ? tokens.colors.lavenderPrimary
                      : tokens.colors.textSecondary,
                  boxShadow: voiceMode === "preset" ? tokens.shadows.subtle : "none",
                }}
              >
                🎙️ Curated Voices
              </button>
              <button
                type="button"
                onClick={() => setVoiceMode("clone")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: tokens.radii.full,
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: voiceMode === "clone" ? tokens.colors.surface : "transparent",
                  color:
                    voiceMode === "clone"
                      ? tokens.colors.peachPrimary
                      : tokens.colors.textSecondary,
                  boxShadow: voiceMode === "clone" ? tokens.shadows.subtle : "none",
                }}
              >
                🎬 Clone from Video / Audio
              </button>
            </div>

            {/* Mode A: Curated Voices */}
            {voiceMode === "preset" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {PRESET_VOICES.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVoiceId(v.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: tokens.radii.lg,
                      backgroundColor:
                        selectedVoiceId === v.id
                          ? tokens.colors.surfaceLavenderTint
                          : tokens.colors.surface,
                      border: `1.5px solid ${
                        selectedVoiceId === v.id
                          ? tokens.colors.lavenderPrimary
                          : tokens.colors.border
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      boxShadow: tokens.shadows.subtle,
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                          {v.name}
                        </h4>
                        {selectedVoiceId === v.id && (
                          <span style={{ fontSize: "11px", color: tokens.colors.lavenderPrimary, fontWeight: 700 }}>
                            ● Active
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                        {v.description}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewPresetVoice(v);
                      }}
                      leftIcon={playingVoiceId === v.id ? "🔊" : "▶"}
                    >
                      {playingVoiceId === v.id ? "Playing…" : "Listen"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              /* Mode B: Voice Clone from Video or Audio */
              <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
                {/* Media Dropzone */}
                <div
                  onClick={() => voiceMediaInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  style={{
                    border: `2px dashed ${
                      clonedVoiceResult ? tokens.colors.borderPeach : tokens.colors.borderLavender
                    }`,
                    borderRadius: tokens.radii.card,
                    padding: "20px 16px",
                    textAlign: "center",
                    backgroundColor: clonedVoiceResult
                      ? tokens.colors.surfacePeachTint
                      : tokens.colors.surfaceLavenderTint,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <input
                    ref={voiceMediaInputRef}
                    type="file"
                    accept="video/*,audio/*,.mp4,.mov,.webm,.mkv,.mp3,.wav,.m4a,.ogg"
                    onChange={handleVoiceMediaFileChange}
                    style={{ display: "none" }}
                  />

                  <span style={{ fontSize: "32px" }}>
                    {isExtractingVoice ? "⚡" : clonedVoiceResult ? "✨" : "🎬"}
                  </span>

                  <div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                      {clonedVoiceResult
                        ? "Upload a different video/audio clip"
                        : "Upload Video or Audio to Clone Voice"}
                    </span>
                    <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                      Upload any MP4, MOV, WebM, MP3, WAV or M4A (10s – 2m recommended).
                    </p>
                  </div>
                </div>

                {/* Extraction Progress Indicator */}
                {isExtractingVoice && (
                  <div
                    style={{
                      padding: "14px",
                      borderRadius: tokens.radii.md,
                      backgroundColor: tokens.colors.surfaceLavenderTint,
                      border: `1px solid ${tokens.colors.borderLavender}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                      <span style={{ color: tokens.colors.lavenderPrimary }}>{extractionStage}</span>
                      <span style={{ color: tokens.colors.textSecondary }}>{extractionProgress}%</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: tokens.colors.borderSubtle, borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${extractionProgress}%`,
                          height: "100%",
                          backgroundColor: tokens.colors.lavenderPrimary,
                          transition: "width 0.25s ease",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {cloneError && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      borderRadius: tokens.radii.md,
                      backgroundColor: tokens.colors.statusErrorBg,
                      color: tokens.colors.statusError,
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    ⚠️ {cloneError}
                  </div>
                )}

                {/* Extracted Voice Profile Card */}
                {clonedVoiceResult && !isExtractingVoice && (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: tokens.radii.card,
                      backgroundColor: tokens.colors.surface,
                      border: `1.5px solid ${tokens.colors.borderPeach}`,
                      boxShadow: tokens.shadows.card,
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px" }}>
                          {clonedVoiceResult.metadata.isExtractedFromVideo ? "🎬" : "🎵"}
                        </span>
                        <div>
                          <h4 style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                            {clonedVoiceResult.metadata.isExtractedFromVideo ? "Extracted Video Audio" : "Voice Sample"}
                          </h4>
                          <span style={{ fontSize: "11px", color: tokens.colors.textTertiary }}>
                            {clonedVoiceResult.metadata.fileName} ({clonedVoiceResult.metadata.durationSeconds}s)
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: "#D1FAE5",
                          color: "#059669",
                          padding: "3px 8px",
                          borderRadius: tokens.radii.full,
                        }}
                      >
                        ✓ Voice Calibrated
                      </span>
                    </div>

                    {/* Waveform Visualization Bars */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        height: "36px",
                        padding: "4px 8px",
                        backgroundColor: tokens.colors.canvasMuted,
                        borderRadius: tokens.radii.md,
                      }}
                    >
                      {clonedVoiceResult.waveformData.map((amp, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            height: `${Math.round(amp * 28)}px`,
                            backgroundColor: cloneAudioPlaying ? tokens.colors.peachPrimary : tokens.colors.lavenderPrimary,
                            borderRadius: "2px",
                            opacity: 0.8,
                            transition: "height 0.15s ease, background-color 0.2s ease",
                          }}
                        />
                      ))}
                    </div>

                    {/* Extracted Metrics */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "6px",
                        textAlign: "center",
                        fontSize: "11px",
                      }}
                    >
                      <div style={{ padding: "6px", backgroundColor: tokens.colors.canvasMuted, borderRadius: tokens.radii.sm }}>
                        <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Pitch Estimate</span>
                        <strong style={{ color: tokens.colors.textPrimary }}>{clonedVoiceResult.metadata.pitchEstimateHz} Hz</strong>
                      </div>
                      <div style={{ padding: "6px", backgroundColor: tokens.colors.canvasMuted, borderRadius: tokens.radii.sm }}>
                        <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Sample Rate</span>
                        <strong style={{ color: tokens.colors.textPrimary }}>{Math.round(clonedVoiceResult.metadata.sampleRate / 1000)} kHz</strong>
                      </div>
                      <div style={{ padding: "6px", backgroundColor: tokens.colors.canvasMuted, borderRadius: tokens.radii.sm }}>
                        <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Vocal Quality</span>
                        <strong style={{ color: "#059669" }}>{clonedVoiceResult.metadata.clarityPercent}%</strong>
                      </div>
                    </div>

                    {/* Test Audio Controls */}
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        style={{ flex: 1 }}
                        onClick={handleToggleClonePlayback}
                        leftIcon={cloneAudioPlaying ? "⏸" : "▶"}
                      >
                        {cloneAudioPlaying ? "Pause Extracted Audio" : "Play Extracted Audio"}
                      </Button>

                      <Button
                        size="sm"
                        variant="peach"
                        style={{ flex: 1 }}
                        onClick={handleTestClonedVoiceSpeech}
                        leftIcon="🎙️"
                      >
                        Test Voice Line
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 5: PERSONALITY & PROMPT */}
        {/* ============================================================ */}
        {currentStep === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Question 5 of 5
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                What is {name || "your character"}'s personality?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Pick traits and choose a suggested icebreaker question.
              </p>
            </div>

            {/* Trait Selection Pills */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.textSecondary,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Select up to 5 personality traits:
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {ALL_TRAITS.map((t) => {
                  const isSelected = selectedTraits.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrait(t)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: tokens.radii.full,
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor: isSelected ? tokens.colors.lavenderPrimary : tokens.colors.surface,
                        color: isSelected ? tokens.colors.textInverse : tokens.colors.textSecondary,
                        border: `1px solid ${isSelected ? tokens.colors.lavenderPrimary : tokens.colors.border}`,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {isSelected ? `✓ ${t}` : `+ ${t}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggested Icebreaker Input */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.textSecondary,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Suggested Icebreaker Question
              </label>
              <input
                type="text"
                value={suggestedPrompt}
                onChange={(e) => setSuggestedPrompt(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: tokens.radii.md,
                  border: `1.5px solid ${tokens.colors.border}`,
                  fontSize: "14px",
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                }}
              />
            </div>

            {/* Additional Story / Boundaries Textarea */}
            <div>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.textSecondary,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Character Background & Story (Optional)
              </label>
              <textarea
                rows={2}
                placeholder={`Describe ${name || "the character"}'s backstory, conversational boundaries, or specific perspective…`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: tokens.radii.md,
                  border: `1.5px solid ${tokens.colors.border}`,
                  fontSize: "14px",
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 6: REVIEW & CONSENT */}
        {/* ============================================================ */}
        {currentStep === 6 && !createdPersona && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.lg }}>
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.lavenderPrimary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Final Review
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                Ready to create {name}?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodyRegular.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Review your character profile and confirm the AI character policy.
              </p>
            </div>

            {/* Summary Review Card */}
            <div
              style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.radii.card,
                border: `1.5px solid ${tokens.colors.border}`,
                padding: tokens.spacing.lg,
                boxShadow: tokens.shadows.card,
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacing.md,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
                <PersonaAvatar
                  persona={{
                    id: "preview",
                    name: name || "Echo Companion",
                    tagline: tagline || "A thoughtful companion",
                    description: description || "Custom character",
                    voiceStyle: "",
                    suggestedPrompt: "",
                    traits: selectedTraits,
                    avatarGradient: PRESET_AVATARS[selectedAvatarIndex].gradient,
                    photoUrl: avatarMode === "photo" && photoPreviewUrl ? photoPreviewUrl : undefined,
                    disclosure: "",
                  }}
                  size="md"
                />

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                    {name || "Unnamed Persona"}
                  </h3>
                  <p style={{ fontSize: "13px", color: tokens.colors.lavenderPrimary, fontWeight: 600 }}>
                    {tagline || "Custom Companion"}
                  </p>
                </div>
              </div>

              {/* Voice & Traits Badges */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  paddingTop: tokens.spacing.xs,
                  borderTop: `1px solid ${tokens.colors.borderSubtle}`,
                }}
              >
                <span
                  style={{
                    backgroundColor: voiceMode === "clone" ? tokens.colors.surfacePeachTint : tokens.colors.surfaceLavenderTint,
                    color: voiceMode === "clone" ? tokens.colors.peachPrimary : tokens.colors.lavenderPrimary,
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: tokens.radii.full,
                  }}
                >
                  {voiceMode === "clone"
                    ? `🎬 Cloned Voice (${clonedVoiceResult?.metadata.fileName || "Custom Track"})`
                    : `🎙️ ${PRESET_VOICES.find((v) => v.id === selectedVoiceId)?.name}`}
                </span>

                {selectedTraits.map((t) => (
                  <span
                    key={t}
                    style={{
                      backgroundColor: tokens.colors.canvasMuted,
                      color: tokens.colors.textSecondary,
                      fontSize: "12px",
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: tokens.radii.full,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Suggested Prompt Preview */}
              <div
                style={{
                  backgroundColor: tokens.colors.canvasMuted,
                  borderRadius: tokens.radii.md,
                  padding: "10px 12px",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 700, color: tokens.colors.textTertiary, textTransform: "uppercase" }}>
                  First Question
                </span>
                <p style={{ fontSize: "13px", fontStyle: "italic", color: tokens.colors.textPrimary, marginTop: "2px" }}>
                  “{suggestedPrompt}”
                </p>
              </div>
            </div>

            {/* Mandatory Safety & Consent Checkbox */}
            <div
              style={{
                backgroundColor: tokens.colors.surfacePeachTint,
                border: `1.5px solid ${tokens.colors.borderPeach}`,
                borderRadius: tokens.radii.card,
                padding: tokens.spacing.md,
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <input
                id="consent-box"
                type="checkbox"
                checked={consentAcknowledged}
                onChange={(e) => setConsentAcknowledged(e.target.checked)}
                style={{
                  marginTop: "3px",
                  width: "20px",
                  height: "20px",
                  accentColor: tokens.colors.lavenderPrimary,
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="consent-box"
                style={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: tokens.colors.textSecondary,
                  cursor: "pointer",
                }}
              >
                <strong>Fictional Character & Voice Consent:</strong> I confirm this is a fictional AI persona. Project Echo strictly prohibits non-consensual voice cloning or impersonation of real living people.
              </label>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 7: CELEBRATION / SUCCESS SCREEN */}
        {/* ============================================================ */}
        {createdPersona && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: tokens.spacing.lg,
              margin: "auto 0",
            }}
          >
            <div style={{ fontSize: "56px" }}>🎉</div>

            <PersonaAvatar persona={createdPersona} size="lg" />

            <div>
              <h2 style={{ fontSize: tokens.typography.headingLarge.fontSize, fontWeight: 700, color: tokens.colors.textPrimary }}>
                Meet {createdPersona.name}!
              </h2>
              <p style={{ fontSize: tokens.typography.bodyRegular.fontSize, color: tokens.colors.lavenderPrimary, fontWeight: 600, marginTop: "2px" }}>
                {createdPersona.tagline}
              </p>
              <p style={{ fontSize: "13px", color: tokens.colors.textSecondary, marginTop: "8px", maxWidth: "280px" }}>
                Your custom AI persona is ready for a real-time voice call.
              </p>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: tokens.spacing.sm, marginTop: tokens.spacing.md }}>
              <Button
                size="lg"
                variant="primary"
                fullWidth
                onClick={() => onStartCallWithNewPersona?.(createdPersona)}
                leftIcon="📞"
              >
                Start Call with {createdPersona.name}
              </Button>

              <Button
                size="md"
                variant="secondary"
                fullWidth
                onClick={onBack}
              >
                Back to Home
              </Button>
            </div>
          </div>
        )}

        {/* Step Navigation Actions */}
        {!createdPersona && (
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              gap: tokens.spacing.sm,
              paddingTop: tokens.spacing.md,
            }}
          >
            {currentStep > 1 && (
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                ← Back
              </Button>
            )}

            {currentStep < 6 ? (
              <Button
                type="button"
                size="lg"
                variant="primary"
                style={{ flex: 1 }}
                disabled={currentStep === 1 && !name.trim()}
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                Continue →
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                variant="primary"
                style={{ flex: 1 }}
                disabled={!consentAcknowledged || !name.trim()}
                onClick={handleFinalCreate}
              >
                ✨ Create {name || "Persona"}
              </Button>
            )}
          </div>
        )}
      </div>

      <SafetyDisclosure />
    </div>
  );
};
