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
    setGenerationProgress(18);
    setGenerationStage("Sculpting facial geometry…");

    if (!name && defaultName) {
      setName(defaultName);
    }

    setTimeout(() => {
      setGenerationProgress(52);
      setGenerationStage("Generating 3D volumetric mesh…");
    }, 400);

    setTimeout(() => {
      setGenerationProgress(85);
      setGenerationStage("Calibrating lighting & animation rig…");
    }, 850);

    setTimeout(() => {
      setGenerationProgress(100);
      setGenerationStage("3D Character Ready!");
      setIsGenerating3D(false);
      setIs3DModelReady(true);
    }, 1250);
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
    setExtractionStage("Reading audio track…");

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
      tagline: tagline.trim() || "A thoughtful 3D companion",
      description: `${name} is a custom 3D companion generated from photo and calibrated voice.`,
      voiceStyle: clonedVoiceResult
        ? `Cloned (${clonedVoiceResult.metadata.isExtractedFromVideo ? "Video Audio" : "Audio"}: ${clonedVoiceResult.metadata.fileName}, ${clonedVoiceResult.metadata.pitchEstimateHz}Hz)`
        : "Gentle & Calming",
      suggestedPrompt: `Hey ${name}, I'm glad to see you in 3D. How are you feeling today?`,
      traits: ["Interactive 3D", "Cloned Voice", "Present"],
      avatarGradient: {
        start: "#A78BFA",
        end: "#F4A261",
        glow: "rgba(167, 139, 250, 0.35)",
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
      }}
    >
      {/* Humanistic Glass Header */}
      <AppHeader
        title={createdPersona ? "Companion Ready" : "Craft Companion"}
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
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.colors.lavenderPrimary,
              backgroundColor: "rgba(100, 65, 211, 0.08)",
              padding: "4px 12px",
              borderRadius: "20px",
              border: "1px solid rgba(100, 65, 211, 0.15)",
            }}
          >
            {createdPersona ? "✨ Ready" : `Step ${currentStep} of 3`}
          </span>
        }
      />

      {/* Subtle Progress Bar */}
      {!createdPersona && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px 24px 6px",
          }}
        >
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "2px",
                backgroundColor:
                  stepNum <= currentStep ? tokens.colors.lavenderPrimary : "rgba(31, 29, 43, 0.08)",
                transition: "background-color 0.3s ease",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Scrollable Body with generous bottom spacing */}
      <div
        style={{
          padding: `${tokens.spacing.md} ${tokens.spacing.lg} 130px`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
          flex: 1,
        }}
      >
        {/* ============================================================ */}
        {/* STEP 1: PHOTO TO 3D CHARACTER */}
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
                  letterSpacing: "0.06em",
                }}
              >
                Face & Appearance
              </span>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                  letterSpacing: "-0.02em",
                }}
              >
                Bring a friendly face to life
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                  lineHeight: "18px",
                }}
              >
                Upload a portrait or select one below to sculpt an interactive 3D character.
              </p>
            </div>

            {/* 3D Model Display or Upload Surface */}
            {photoUrl ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "28px",
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 12px 30px rgba(100, 65, 211, 0.08), 0 2px 8px rgba(0, 0, 0, 0.03)",
                  position: "relative",
                }}
              >
                <ThreeAvatar3D
                  photoUrl={photoUrl}
                  size={230}
                  scanEffect={isGenerating3D}
                  isSpeaking={is3DModelReady}
                />

                {isGenerating3D && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "8px 12px",
                      borderRadius: "14px",
                      backgroundColor: "rgba(100, 65, 211, 0.08)",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 600, color: tokens.colors.lavenderPrimary }}>
                      ⚡ {generationStage} ({generationProgress}%)
                    </span>
                  </div>
                )}

                {is3DModelReady && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        backgroundColor: "#D1FAE5",
                        color: "#059669",
                        padding: "3px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      ✓ 3D Model Active
                    </span>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      style={{
                        fontSize: "12px",
                        color: tokens.colors.lavenderPrimary,
                        fontWeight: 600,
                        background: "none",
                        border: 0,
                        cursor: "pointer",
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
                  border: "2px dashed rgba(100, 65, 211, 0.28)",
                  borderRadius: "24px",
                  padding: "32px 16px",
                  textAlign: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(100, 65, 211, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                  }}
                >
                  📸
                </div>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                    Upload a portrait photo
                  </h4>
                  <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                    JPG, PNG, or WebP. Automatically generates 3D character mesh.
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

            {/* Instant Sample Companions */}
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
                  Or pick a sample companion:
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
                        padding: "10px 6px",
                        borderRadius: "18px",
                        backgroundColor: "rgba(255, 255, 255, 0.65)",
                        border: "1px solid rgba(255, 255, 255, 0.8)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      }}
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                        }}
                      />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name Input */}
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
                Companion's Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Robin, Elena, Marcus…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(31, 29, 43, 0.12)",
                  fontSize: "15px",
                  fontWeight: 600,
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  color: tokens.colors.textPrimary,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: VIDEO/AUDIO VOICE CLONING */}
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
                  letterSpacing: "0.06em",
                }}
              >
                Voice & Presence
              </span>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                  letterSpacing: "-0.02em",
                }}
              >
                Calibrate {name || "your companion"}'s voice
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                  lineHeight: "18px",
                }}
              >
                Drop a video clip or voice note. We will extract the timbre and calibrate the cloned speech model.
              </p>
            </div>

            {/* Video / Audio Dropzone */}
            <div
              onClick={() => voiceMediaInputRef.current?.click()}
              role="button"
              tabIndex={0}
              style={{
                border: "2px dashed rgba(244, 162, 97, 0.4)",
                borderRadius: "24px",
                padding: "30px 16px",
                textAlign: "center",
                backgroundColor: clonedVoiceResult ? "rgba(244, 162, 97, 0.1)" : "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
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

              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(244, 162, 97, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                }}
              >
                {isExtractingVoice ? "⚡" : clonedVoiceResult ? "🎙️" : "🎬"}
              </div>

              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                  {clonedVoiceResult
                    ? "Upload another video/audio clip"
                    : "Select Video (.mp4, .mov) or Audio (.mp3, .m4a)"}
                </h4>
                <p style={{ fontSize: "12px", color: tokens.colors.textSecondary, marginTop: "2px" }}>
                  Video audio tracks are demuxed and calibrated in-browser automatically.
                </p>
              </div>
            </div>

            {/* Extraction Progress */}
            {isExtractingVoice && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "16px",
                  backgroundColor: "rgba(100, 65, 211, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 600 }}>
                  <span style={{ color: tokens.colors.lavenderPrimary }}>{extractionStage}</span>
                  <span style={{ color: tokens.colors.textSecondary }}>{extractionProgress}%</span>
                </div>
                <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(31,29,43,0.08)", borderRadius: "2px", overflow: "hidden" }}>
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
                  borderRadius: "24px",
                  backgroundColor: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 8px 24px rgba(244, 162, 97, 0.08)",
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
                        {clonedVoiceResult.metadata.isExtractedFromVideo ? "Extracted Video Audio" : "Voice Note Sample"}
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
                      borderRadius: "20px",
                    }}
                  >
                    ✓ Calibrated
                  </span>
                </div>

                {/* Waveform */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    height: "36px",
                    padding: "4px 8px",
                    backgroundColor: "rgba(31, 29, 43, 0.04)",
                    borderRadius: "12px",
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

                {/* Controls */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    size="sm"
                    variant="secondary"
                    style={{ flex: 1 }}
                    onClick={handleToggleClonePlayback}
                    leftIcon={cloneAudioPlaying ? "⏸" : "▶"}
                  >
                    {cloneAudioPlaying ? "Pause Audio" : "Play Extracted Audio"}
                  </Button>

                  <Button
                    size="sm"
                    variant="peach"
                    style={{ flex: 1 }}
                    onClick={handleTestClonedVoiceLine}
                    leftIcon="🎙️"
                  >
                    Test 3D Speech
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW & TALK */}
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
                  letterSpacing: "0.06em",
                }}
              >
                Connection
              </span>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: tokens.colors.textPrimary,
                  marginTop: "2px",
                  letterSpacing: "-0.02em",
                }}
              >
                Ready to talk with {name}?
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: tokens.colors.textSecondary,
                  marginTop: "4px",
                  lineHeight: "18px",
                }}
              >
                Your 3D character and calibrated voice model are ready for a real-time call.
              </p>
            </div>

            {/* 3D Preview Card */}
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.72)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "28px",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                padding: tokens.spacing.md,
                boxShadow: "0 12px 30px rgba(100, 65, 211, 0.08)",
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
                {name || "Companion"}
              </h3>
              <p style={{ fontSize: "12px", color: tokens.colors.lavenderPrimary, fontWeight: 600 }}>
                {clonedVoiceResult ? `🎙️ Cloned Voice (${clonedVoiceResult.metadata.fileName})` : "🎙️ Gentle AI Voice"}
              </p>
            </div>

            {/* Consent Checkbox */}
            <div
              style={{
                backgroundColor: "rgba(244, 162, 97, 0.12)",
                border: "1px solid rgba(244, 162, 97, 0.3)",
                borderRadius: "20px",
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
                  width: "18px",
                  height: "18px",
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
                <strong>3D Companion Policy:</strong> I acknowledge this is an AI-created fictional companion. Project Echo prohibits impersonation of living individuals.
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
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: tokens.colors.textPrimary }}>
                {createdPersona.name} is ready!
              </h2>
              <p style={{ fontSize: "13px", color: tokens.colors.lavenderPrimary, fontWeight: 600, marginTop: "2px" }}>
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

        {/* Action Button Area */}
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
