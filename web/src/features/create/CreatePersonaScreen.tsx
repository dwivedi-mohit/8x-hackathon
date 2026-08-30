import React, { useState, useRef } from "react";
import type { Persona } from "../../types/persona.js";
import { AppHeader } from "../../components/AppHeader.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { ThreeAvatar3D } from "../../components/ThreeAvatar3D.js";
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

const SAMPLE_PORTRAITS = [
  {
    name: "Alex",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    tagline: "Warm, empathetic and mindful",
    pitch: 165,
  },
  {
    name: "Elena",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    tagline: "Direct, insightful, and practical",
    pitch: 175,
  },
  {
    name: "Marcus",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    tagline: "Grounded, calm, and reassuring",
    pitch: 120,
  },
];

export const CreatePersonaScreen: React.FC<CreatePersonaScreenProps> = ({
  onBack,
  onCreated,
  onStartCallWithNewPersona,
}) => {
  // Step navigation: 1 = Photo to 3D Model, 2 = Video/Audio Voice Clone, 3 = Review & Talk
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Character Identity & Photo State
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generationStage, setGenerationStage] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [is3DModelReady, setIs3DModelReady] = useState(false);

  // Voice Clone State
  const [isExtractingVoice, setIsExtractingVoice] = useState(false);
  const [extractionStage, setExtractionStage] = useState("");
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [clonedVoiceResult, setClonedVoiceResult] = useState<ExtractedVoiceResult | null>(null);
  const [cloneAudioPlaying, setCloneAudioPlaying] = useState(false);
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Final Review & Consent
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [createdPersona, setCreatedPersona] = useState<Persona | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const voiceMediaInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Trigger 3D Model Generation Pipeline
  const processPhotoFor3D = (imageUrl: string, defaultName?: string) => {
    setPhotoUrl(imageUrl);
    setIsGenerating3D(true);
    setIs3DModelReady(false);
    setGenerationProgress(15);
    setGenerationStage("Scanning facial geometry & contours…");

    if (!name && defaultName) {
      setName(defaultName);
    }

    setTimeout(() => {
      setGenerationProgress(45);
      setGenerationStage("Generating 3D volumetric face mesh…");
    }, 450);

    setTimeout(() => {
      setGenerationProgress(80);
      setGenerationStage("Mapping realistic lighting & facial rig…");
    }, 900);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage("3D Character Model Generated!");
      setIsGenerating3D(false);
      setIs3DModelReady(true);
    }, 1300);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      processPhotoFor3D(url);
    }
  };

  // Video / Audio Voice Extraction
  const handleVoiceMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCloneError(null);
    setIsExtractingVoice(true);
    setExtractionProgress(15);
    setExtractionStage("Reading media track…");

    try {
      const result = await extractVoiceFromMediaFile(file, (stage, percent) => {
        setExtractionStage(stage);
        setExtractionProgress(percent);
      });

      setClonedVoiceResult(result);
    } catch (err) {
      console.error("Voice extraction failed:", err);
      setCloneError("Could not decode audio from this file. Please select a valid video or audio clip.");
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

  const handleTestClonedVoiceLine = () => {
    const testLine = `Hello! I am ${name || "your companion"}, and this is my calibrated voice. I'm ready to talk with you.`;
    setCloneAudioPlaying(true);
    playSampleSpeech(
      testLine,
      clonedVoiceResult ? clonedVoiceResult.metadata.pitchEstimateHz : 155,
      () => setCloneAudioPlaying(true),
      () => setCloneAudioPlaying(false)
    );
  };

  const handleFinishAndCreate = () => {
    if (!name.trim() || !consentAcknowledged) return;

    const customId = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;

    const newPersona: Persona = {
      id: customId,
      name: name.trim(),
      tagline: tagline.trim() || "A custom 3D AI companion",
      description: `${name} is an interactive 3D AI companion generated from user photo and cloned voice.`,
      voiceStyle: clonedVoiceResult
        ? `Cloned (${clonedVoiceResult.metadata.isExtractedFromVideo ? "Video Audio" : "Audio"}: ${clonedVoiceResult.metadata.fileName}, ${clonedVoiceResult.metadata.pitchEstimateHz}Hz)`
        : "Gentle & Calming",
      suggestedPrompt: `Hey ${name}, I'm so glad to see you in 3D. How are you doing today?`,
      traits: ["Interactive 3D", "Cloned Voice", "Present"],
      avatarGradient: {
        start: "#A78BFA",
        end: "#F4A261",
        glow: "rgba(167, 139, 250, 0.4)",
        ring: "#DDD6FE",
      },
      photoUrl: photoUrl || undefined,
      isCustom: true,
      clonedVoice: clonedVoiceResult?.metadata,
      disclosure: `${name} is an AI-generated 3D persona. Not a real person, therapist, or emergency service.`,
    };

    setCreatedPersona(newPersona);
    onCreated?.(newPersona);
  };

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
        title={createdPersona ? "3D Persona Ready!" : "Create 3D Persona"}
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
            {createdPersona ? "✨ 3D Ready" : `Step ${currentStep} of 3`}
          </span>
        }
      />

      {/* Progress Line */}
      {!createdPersona && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            padding: "8px 20px 4px",
            backgroundColor: tokens.colors.surface,
            borderBottom: `1px solid ${tokens.colors.borderSubtle}`,
          }}
        >
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                backgroundColor:
                  stepNum <= currentStep ? tokens.colors.lavenderPrimary : tokens.colors.borderSubtle,
                transition: "background-color 0.25s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Content Area */}
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
        {/* STEP 1: PHOTO UPLOAD -> 3D MODEL GENERATION */}
        {/* ============================================================ */}
        {currentStep === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
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
                Step 1: 3D Face Generation
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                Upload Photo to Generate 3D Model
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodySmall.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Upload any portrait photo. We will generate a responsive, animated 3D character mesh.
              </p>
            </div>

            {/* 3D Model Viewer or Upload Dropzone */}
            {photoUrl ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: tokens.radii.card,
                  backgroundColor: tokens.colors.surface,
                  border: `2px solid ${tokens.colors.borderLavender}`,
                  boxShadow: tokens.shadows.card,
                  position: "relative",
                }}
              >
                <ThreeAvatar3D
                  photoUrl={photoUrl}
                  size={240}
                  scanEffect={isGenerating3D}
                  isSpeaking={is3DModelReady}
                />

                {isGenerating3D && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: "12px",
                      padding: "10px",
                      borderRadius: tokens.radii.md,
                      backgroundColor: tokens.colors.surfaceLavenderTint,
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: tokens.colors.lavenderPrimary }}>
                      ⚡ {generationStage} ({generationProgress}%)
                    </span>
                  </div>
                )}

                {is3DModelReady && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        backgroundColor: "#D1FAE5",
                        color: "#059669",
                        padding: "4px 12px",
                        borderRadius: tokens.radii.full,
                      }}
                    >
                      ✓ 3D Model Generated & Active
                    </span>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        fontSize: "12px",
                        color: tokens.colors.lavenderPrimary,
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      Change Photo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => photoInputRef.current?.click()}
                role="button"
                tabIndex={0}
                style={{
                  border: `2px dashed ${tokens.colors.borderLavender}`,
                  borderRadius: tokens.radii.card,
                  padding: "36px 16px",
                  textAlign: "center",
                  backgroundColor: tokens.colors.surfaceLavenderTint,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "40px" }}>📸</span>
                <div>
                  <h4 style={{ fontSize: "16px", fontWeight: 700, color: tokens.colors.lavenderPrimary }}>
                    Click to Upload a Portrait Photo
                  </h4>
                  <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "4px" }}>
                    JPG, PNG, or WebP. Automatically generates interactive 3D face mesh.
                  </p>
                </div>
              </div>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />

            {/* Quick Sample Photos */}
            {!photoUrl && (
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
                  Or try with an instant sample character:
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                  {SAMPLE_PORTRAITS.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => {
                        setName(sample.name);
                        setTagline(sample.tagline);
                        processPhotoFor3D(sample.url, sample.name);
                      }}
                      style={{
                        padding: "8px",
                        borderRadius: tokens.radii.md,
                        backgroundColor: tokens.colors.surface,
                        border: `1px solid ${tokens.colors.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Character Name Input */}
            <div style={{ marginTop: "4px" }}>
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: tokens.colors.textSecondary,
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Character Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Robin, Elena, Marcus…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: tokens.radii.md,
                  border: `1.5px solid ${name ? tokens.colors.lavenderPrimary : tokens.colors.border}`,
                  fontSize: "15px",
                  fontWeight: 600,
                  backgroundColor: tokens.colors.surface,
                  color: tokens.colors.textPrimary,
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: VIDEO / AUDIO UPLOAD -> VOICE CLONING */}
        {/* ============================================================ */}
        {currentStep === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
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
                Step 2: Video/Audio Voice Clone
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                Upload Video or Audio to Clone Voice
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodySmall.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Upload a video clip (MP4/WebM) or audio track. We will extract the voice, calibrate pitch, and clone it for {name || "your persona"}.
              </p>
            </div>

            {/* Video / Audio Dropzone */}
            <div
              onClick={() => voiceMediaInputRef.current?.click()}
              role="button"
              tabIndex={0}
              style={{
                border: `2px dashed ${
                  clonedVoiceResult ? tokens.colors.borderPeach : tokens.colors.borderLavender
                }`,
                borderRadius: tokens.radii.card,
                padding: "28px 16px",
                textAlign: "center",
                backgroundColor: clonedVoiceResult
                  ? tokens.colors.surfacePeachTint
                  : tokens.colors.surfaceLavenderTint,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                ref={voiceMediaInputRef}
                type="file"
                accept="video/*,audio/*,.mp4,.mov,.webm,.mkv,.mp3,.wav,.m4a,.ogg"
                onChange={handleVoiceMediaUpload}
                style={{ display: "none" }}
              />

              <span style={{ fontSize: "36px" }}>
                {isExtractingVoice ? "⚡" : clonedVoiceResult ? "🎙️" : "🎬"}
              </span>

              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                  {clonedVoiceResult
                    ? "Upload another video/audio file"
                    : "Select Video (.mp4, .mov, .webm) or Audio (.mp3, .m4a)"}
                </h4>
                <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                  If video is uploaded, the audio track will be extracted and converted automatically.
                </p>
              </div>
            </div>

            {/* Extraction Progress */}
            {isExtractingVoice && (
              <div
                style={{
                  padding: "14px",
                  borderRadius: tokens.radii.md,
                  backgroundColor: tokens.colors.surfaceLavenderTint,
                  border: `1px solid ${tokens.colors.borderLavender}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
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
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              </div>
            )}

            {/* Cloned Voice Card */}
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
                    <span style={{ fontSize: "22px" }}>
                      {clonedVoiceResult.metadata.isExtractedFromVideo ? "🎬" : "🎵"}
                    </span>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                        {clonedVoiceResult.metadata.isExtractedFromVideo ? "Extracted from Video" : "Audio Sample"}
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
                    ✓ Cloned & Ready
                  </span>
                </div>

                {/* Waveform visualizer */}
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
                      }}
                    />
                  ))}
                </div>

                {/* Metrics */}
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
                    <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Pitch</span>
                    <strong>{clonedVoiceResult.metadata.pitchEstimateHz} Hz</strong>
                  </div>
                  <div style={{ padding: "6px", backgroundColor: tokens.colors.canvasMuted, borderRadius: tokens.radii.sm }}>
                    <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Clarity</span>
                    <strong style={{ color: "#059669" }}>{clonedVoiceResult.metadata.clarityPercent}%</strong>
                  </div>
                  <div style={{ padding: "6px", backgroundColor: tokens.colors.canvasMuted, borderRadius: tokens.radii.sm }}>
                    <span style={{ color: tokens.colors.textTertiary, display: "block" }}>Duration</span>
                    <strong>{clonedVoiceResult.metadata.durationSeconds}s</strong>
                  </div>
                </div>

                {/* Audio Tests */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onClick={handleToggleClonePlayback}
                    leftIcon={cloneAudioPlaying ? "⏸" : "▶"}
                  >
                    {cloneAudioPlaying ? "Pause Source Audio" : "Play Extracted Audio"}
                  </Button>

                  <Button
                    size="sm"
                    variant="peach"
                    style={{ flex: 1 }}
                    onClick={handleTestClonedVoiceLine}
                    leftIcon="🎙️"
                  >
                    Test 3D Speaking Line
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW & LAUNCH LIVE 3D VOICE CALL */}
        {/* ============================================================ */}
        {currentStep === 3 && !createdPersona && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
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
                Step 3: Review & Connect
              </span>
              <h2
                style={{
                  fontSize: tokens.typography.headingLarge.fontSize,
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                }}
              >
                Ready to talk with {name}?
              </h2>
              <p
                style={{
                  fontSize: tokens.typography.bodySmall.fontSize,
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                }}
              >
                Your 3D model and voice are calibrated. Start a live interactive voice call.
              </p>
            </div>

            {/* Interactive 3D Preview Card */}
            <div
              style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.radii.card,
                border: `1.5px solid ${tokens.colors.border}`,
                padding: tokens.spacing.md,
                boxShadow: tokens.shadows.card,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ThreeAvatar3D
                photoUrl={photoUrl || undefined}
                size={180}
                isSpeaking={false}
              />

              <h3 style={{ fontSize: "18px", fontWeight: 700, color: tokens.colors.textPrimary, marginTop: "8px" }}>
                {name || "3D Companion"}
              </h3>
              <p style={{ fontSize: "12px", color: tokens.colors.lavenderPrimary, fontWeight: 600 }}>
                {clonedVoiceResult ? `🎙️ Cloned Voice (${clonedVoiceResult.metadata.fileName})` : "🎙️ Gentle AI Voice"}
              </p>
            </div>

            {/* Consent Checkbox */}
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
                id="consent-box-3d"
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
                htmlFor="consent-box-3d"
                style={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  color: tokens.colors.textSecondary,
                  cursor: "pointer",
                }}
              >
                <strong>3D Persona & Voice Consent:</strong> I confirm this is an AI-generated fictional persona. Project Echo strictly prohibits impersonation or non-consensual voice cloning of living persons.
              </label>
            </div>
          </div>
        )}

        {/* Celebration / Launch Screen */}
        {createdPersona && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: tokens.spacing.md,
              margin: "auto 0",
            }}
          >
            <ThreeAvatar3D
              photoUrl={createdPersona.photoUrl}
              size={220}
              isSpeaking={true}
            />

            <div>
              <h2 style={{ fontSize: tokens.typography.headingLarge.fontSize, fontWeight: 700, color: tokens.colors.textPrimary }}>
                {createdPersona.name} is ready!
              </h2>
              <p style={{ fontSize: tokens.typography.bodySmall.fontSize, color: tokens.colors.lavenderPrimary, fontWeight: 600, marginTop: "2px" }}>
                3D Character Mesh & Cloned Voice Calibrated
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
                Start 3D Voice Call with {createdPersona.name}
              </Button>

              <Button
                size="md"
                variant="secondary"
                fullWidth
                onClick={onBack}
              >
                Return to Home
              </Button>
            </div>
          </div>
        )}

        {/* Step Navigation Controls */}
        {!createdPersona && (
          <div style={{ marginTop: "auto", display: "flex", gap: tokens.spacing.sm, paddingTop: tokens.spacing.md }}>
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

            {currentStep < 3 ? (
              <Button
                type="button"
                size="lg"
                variant="primary"
                style={{ flex: 1 }}
                disabled={currentStep === 1 && !name.trim()}
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                Continue to {currentStep === 1 ? "Voice Clone →" : "Connect & Talk →"}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                variant="primary"
                style={{ flex: 1 }}
                disabled={!consentAcknowledged || !name.trim()}
                onClick={handleFinishAndCreate}
                leftIcon="✨"
              >
                Generate 3D Persona & Talk
              </Button>
            )}
          </div>
        )}
      </div>

      <SafetyDisclosure />
    </div>
  );
};
