import React from "react";
import type { PersonaId } from "../../types/call.js";
import { getPersonaById } from "../persona/personasData.js";
import { AppHeader } from "../../components/AppHeader.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { tokens } from "../../styles/tokens.js";

type EndedCallScreenProps = {
  personaId: PersonaId | string;
  durationSeconds: number;
  onCallAgain: (personaId: PersonaId | string) => void;
  onChooseAnother: () => void;
  onGoHome: () => void;
};

export const EndedCallScreen: React.FC<EndedCallScreenProps> = ({
  personaId,
  durationSeconds,
  onCallAgain,
  onChooseAnother,
  onGoHome,
}) => {
  const persona = getPersonaById(personaId);

  const formatDuration = (totalSecs: number) => {
    if (totalSecs <= 0) return "< 1 minute";
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
      <AppHeader title="Call Ended" showBack onBack={onGoHome} />

      <div
        style={{
          padding: `${tokens.spacing.xl} ${tokens.spacing.xl}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: tokens.spacing.xl,
          flex: 1,
        }}
      >
        {/* Completion Avatar & Badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <PersonaAvatar persona={persona} size="lg" />

          <h2
            style={{
              fontSize: tokens.typography.headingLarge.fontSize,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              marginTop: tokens.spacing.md,
            }}
          >
            Call with {persona.name}
          </h2>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: tokens.spacing.sm,
              padding: "4px 12px",
              backgroundColor: tokens.colors.canvasMuted,
              borderRadius: tokens.radii.full,
              fontSize: "13px",
              fontWeight: 600,
              color: tokens.colors.textSecondary,
            }}
          >
            <span>⏱ Duration: {formatDuration(durationSeconds)}</span>
          </div>
        </div>

        {/* Reflection & Privacy Card */}
        <div
          style={{
            width: "100%",
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.radii.card,
            border: `1.5px solid ${tokens.colors.border}`,
            padding: tokens.spacing.lg,
            boxShadow: tokens.shadows.subtle,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🌿</span>
          <h3
            style={{
              fontSize: tokens.typography.subheading.fontSize,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              marginBottom: "6px",
            }}
          >
            A moment of presence
          </h3>
          <p
            style={{
              fontSize: tokens.typography.bodySmall.fontSize,
              lineHeight: "22px",
              color: tokens.colors.textSecondary,
            }}
          >
            Take a breath and carry this clarity with you. For your privacy, call audio and temporary session tokens were discarded immediately upon ending the call.
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            width: "100%",
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.sm,
          }}
        >
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onClick={() => onCallAgain(persona.id)}
            leftIcon="📞"
          >
            Call {persona.name} Again
          </Button>

          <Button
            size="md"
            variant="secondary"
            fullWidth
            onClick={onChooseAnother}
          >
            Choose Another Persona
          </Button>

          <Button
            size="md"
            variant="ghost"
            fullWidth
            onClick={onGoHome}
          >
            Return to Home
          </Button>
        </div>
      </div>

      <SafetyDisclosure />
    </div>
  );
};
