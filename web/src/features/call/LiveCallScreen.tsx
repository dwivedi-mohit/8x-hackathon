import React, { useState, useEffect } from "react";
import type { CallUiProps, CallStatus } from "../../types/call.js";
import { getPersonaById } from "../persona/personasData.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { CallVisualizer } from "../../components/CallVisualizer.js";
import { TimerDisplay } from "../../components/TimerDisplay.js";
import { CallControls } from "../../components/CallControls.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { tokens } from "../../styles/tokens.js";

export const LiveCallScreen: React.FC<CallUiProps> = ({
  personaId,
  personaName,
  onCallEnd,
  controller,
}) => {
  const persona = getPersonaById(personaId);

  // Internal mock state when no external controller is passed
  const [internalStatus, setInternalStatus] = useState<CallStatus>("listening");
  const [internalMuted, setInternalMuted] = useState<boolean>(false);
  const [internalSeconds, setInternalSeconds] = useState<number>(0);
  const [internalError, setInternalError] = useState<string | undefined>(undefined);

  // Use controller if provided, otherwise fallback to internal state
  const status = controller ? controller.status : internalStatus;
  const muted = controller ? controller.muted : internalMuted;
  const elapsedSeconds = controller ? controller.elapsedSeconds : internalSeconds;
  const errorMessage = controller ? controller.errorMessage : internalError;

  // Timer simulation for mock mode
  useEffect(() => {
    if (controller) return;

    if (status === "listening" || status === "thinking" || status === "speaking") {
      const interval = setInterval(() => {
        setInternalSeconds((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, controller]);

  const handleToggleMute = () => {
    if (controller) {
      controller.setMuted(!controller.muted);
    } else {
      setInternalMuted((prev) => !prev);
    }
  };

  const handleEndCall = () => {
    if (controller) {
      controller.disconnect();
    } else {
      setInternalStatus("ended");
    }
    onCallEnd?.();
  };

  const handleRetry = () => {
    if (controller) {
      controller.retry();
    } else {
      setInternalError(undefined);
      setInternalStatus("connecting");
      setTimeout(() => setInternalStatus("listening"), 1200);
    }
  };

  const handleSelectMockState = (newStatus: CallStatus) => {
    if (newStatus === "error") {
      setInternalError("Microphone connection timed out. Check permissions.");
    } else {
      setInternalError(undefined);
    }
    setInternalStatus(newStatus);

    if (newStatus === "ended") {
      onCallEnd?.();
    }
  };

  const getSubtitleByStatus = () => {
    switch (status) {
      case "connecting":
        return "Establishing secure voice session…";
      case "listening":
        return muted ? "Microphone is muted" : "Speak naturally — Maya is listening";
      case "thinking":
        return "Reflecting on your thoughts…";
      case "speaking":
        return "Speaking with you…";
      case "reconnecting":
        return "Re-establishing audio connection…";
      case "error":
        return "Connection interrupted";
      case "ended":
        return "Call finished";
      case "idle":
      default:
        return "Ready";
    }
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
      {/* Top Call Navigation Bar */}
      <header
        style={{
          padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: tokens.colors.surface,
          borderBottom: `1px solid ${tokens.colors.borderSubtle}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: tokens.colors.lavenderPrimary,
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "16px", color: tokens.colors.textPrimary }}>
            {personaName || persona.name}
          </span>
        </div>

        <TimerDisplay seconds={elapsedSeconds} />
      </header>

      {/* Main Call Viewport */}
      <div
        style={{
          padding: `${tokens.spacing.xl} ${tokens.spacing.xl} ${tokens.spacing.md}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          flex: 1,
          gap: tokens.spacing.lg,
        }}
      >
        {/* Status Indicator */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <StatusBadge status={status} size="lg" />
          <span style={{ fontSize: tokens.typography.caption.fontSize, color: tokens.colors.textSecondary }}>
            {getSubtitleByStatus()}
          </span>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: tokens.radii.md,
              backgroundColor: tokens.colors.statusErrorBg,
              border: `1px solid ${tokens.colors.statusError}44`,
              color: tokens.colors.statusError,
              fontSize: "13px",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Central Persona Avatar & Aura */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto 0",
          }}
        >
          <PersonaAvatar
            persona={persona}
            size="call"
            isSpeaking={status === "speaking"}
            isListening={status === "listening"}
          />

          <h2
            style={{
              fontSize: tokens.typography.headingLarge.fontSize,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              marginTop: tokens.spacing.lg,
            }}
          >
            {persona.name}
          </h2>

          <p
            style={{
              fontSize: tokens.typography.bodySmall.fontSize,
              color: tokens.colors.textSecondary,
              marginTop: "2px",
            }}
          >
            {persona.tagline}
          </p>

          {persona.clonedVoice && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: tokens.colors.peachPrimary,
                backgroundColor: tokens.colors.surfacePeachTint,
                border: `1px solid ${tokens.colors.borderPeach}`,
                padding: "2px 10px",
                borderRadius: tokens.radii.full,
                marginTop: "6px",
              }}
            >
              🎬 Cloned Voice: {persona.clonedVoice.fileName} ({persona.clonedVoice.pitchEstimateHz}Hz)
            </span>
          )}

          {/* Dynamic Audio Visualizer */}
          <div style={{ marginTop: tokens.spacing.md }}>
            <CallVisualizer status={status} accentColor={persona.avatarGradient?.start || tokens.colors.lavenderPrimary} />
          </div>
        </div>

        {/* Ambient Prompt Cue / Helper */}
        <div
          style={{
            width: "100%",
            backgroundColor: tokens.colors.surfaceLavenderTint,
            border: `1px solid ${tokens.colors.borderLavender}`,
            borderRadius: tokens.radii.lg,
            padding: "10px 14px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: tokens.colors.textSecondary,
              fontStyle: "italic",
            }}
          >
            {status === "speaking"
              ? "Tip: You can interrupt at any time simply by speaking."
              : `“${persona.suggestedPrompt}”`}
          </p>
        </div>
      </div>

      {/* Bottom Controls & Mock Switcher */}
      <CallControls
        status={status}
        muted={muted}
        onToggleMute={handleToggleMute}
        onEndCall={handleEndCall}
        onRetry={handleRetry}
        onSelectMockState={handleSelectMockState}
        isMockMode={!controller}
      />
    </div>
  );
};
