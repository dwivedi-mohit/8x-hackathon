import React, { useState, useEffect } from "react";
import type { CallUiProps, CallStatus } from "../../types/call.js";
import { getPersonaById } from "../persona/personasData.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { ThreeAvatar3D } from "../../components/ThreeAvatar3D.js";
import { StatusBadge } from "../../components/StatusBadge.js";
import { CallVisualizer } from "../../components/CallVisualizer.js";
import { TimerDisplay } from "../../components/TimerDisplay.js";
import { CallControls } from "../../components/CallControls.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { VoiceboxService } from "../../services/voice/VoiceboxService.js";
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

  // Speak natural greeting using cloned Voicebox voice model
  useEffect(() => {
    const greetingText = `Hello! I am ${persona.name}. I am right here with you.`;
    const voiceProfile = persona.clonedVoice
      ? {
          fundamentalPitchHz: persona.clonedVoice.pitchEstimateHz,
          pitchShiftFactor: persona.clonedVoice.pitchEstimateHz / 175,
        }
      : undefined;

    const timer = setTimeout(() => {
      VoiceboxService.speakWithVoicebox(
        greetingText,
        voiceProfile,
        () => {
          if (!controller) setInternalStatus("speaking");
        },
        () => {
          if (!controller) setInternalStatus("listening");
        }
      );
    }, 600);

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [persona.id]);

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
        height: "100%",
        flex: 1,
        backgroundColor: "transparent",
        justifyContent: "space-between",
        paddingTop: "20px",
        paddingBottom: "36px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top-Right Champagne Gold Sunlight Glow Accent */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 230, 168, 0.4) 0%, rgba(255, 253, 248, 0.15) 50%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Central Persona Avatar (3D Hologram + Name) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "16px",
          marginBottom: "auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <ThreeAvatar3D
          photoUrl={persona.photoUrl}
          personaName={persona.name}
          gradientStart={persona.avatarGradient?.start}
          gradientEnd={persona.avatarGradient?.end}
          size={340}
          isSpeaking={status === "speaking"}
          isListening={status === "listening"}
          status={status}
        />

        <h2
          style={{
            fontSize: "26px",
            fontWeight: 800,
            color: "#312E81",
            textShadow: "0 2px 12px rgba(139, 92, 246, 0.25), 0 1px 3px rgba(255, 255, 255, 0.6)",
            marginTop: "12px",
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        >
          {persona.name}
        </h2>
      </div>

      {/* Bottom Controls pinned at the very bottom dock */}
      <div style={{ width: "100%", marginTop: "auto", paddingBottom: "12px" }}>
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
    </div>
  );
};
