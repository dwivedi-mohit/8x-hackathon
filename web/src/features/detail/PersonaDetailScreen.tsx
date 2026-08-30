import React from "react";
import type { PersonaId } from "../../types/call.js";
import { getPersonaById } from "../persona/personasData.js";
import { AppHeader } from "../../components/AppHeader.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { tokens } from "../../styles/tokens.js";

type PersonaDetailScreenProps = {
  personaId: PersonaId;
  onBack: () => void;
  onStartCall: (personaId: PersonaId) => void;
};

export const PersonaDetailScreen: React.FC<PersonaDetailScreenProps> = ({
  personaId,
  onBack,
  onStartCall,
}) => {
  const persona = getPersonaById(personaId);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
      <AppHeader
        title={persona.name}
        showBack
        onBack={onBack}
        rightAction={<SafetyDisclosure compact text="Fictional AI" />}
      />

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
        {/* Large Portrait Section */}
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
            {persona.name}
          </h2>
          <p
            style={{
              fontSize: tokens.typography.bodyRegular.fontSize,
              color: tokens.colors.lavenderPrimary,
              fontWeight: 600,
              marginTop: "2px",
            }}
          >
            {persona.tagline}
          </p>

          {/* Traits Badges */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: tokens.spacing.xs,
              marginTop: tokens.spacing.sm,
            }}
          >
            {persona.traits.map((trait) => (
              <span
                key={trait}
                style={{
                  backgroundColor: tokens.colors.surfaceLavenderTint,
                  border: `1px solid ${tokens.colors.borderLavender}`,
                  color: tokens.colors.lavenderPrimary,
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: tokens.radii.full,
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Bio & Voice Style Card */}
        <div
          style={{
            width: "100%",
            backgroundColor: tokens.colors.surface,
            borderRadius: tokens.radii.card,
            border: `1.5px solid ${tokens.colors.border}`,
            padding: tokens.spacing.lg,
            boxShadow: tokens.shadows.subtle,
            display: "flex",
            flexDirection: "column",
            gap: tokens.spacing.md,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textTertiary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              About {persona.name}
            </h3>
            <p
              style={{
                fontSize: tokens.typography.bodyRegular.fontSize,
                lineHeight: "24px",
                color: tokens.colors.textSecondary,
              }}
            >
              {persona.description}
            </p>
          </div>

          <div style={{ paddingTop: tokens.spacing.sm, borderTop: `1px solid ${tokens.colors.borderSubtle}` }}>
            <h4
              style={{
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textTertiary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "4px",
              }}
            >
              Voice & Speaking Cadence
            </h4>
            <p
              style={{
                fontSize: tokens.typography.bodySmall.fontSize,
                color: tokens.colors.textSecondary,
              }}
            >
              🎙️ {persona.voiceStyle}
            </p>
          </div>
        </div>

        {/* Suggested Icebreaker Prompt Card */}
        <div
          style={{
            width: "100%",
            backgroundColor: tokens.colors.surfacePeachTint,
            borderRadius: tokens.radii.card,
            border: `1.5px solid ${tokens.colors.borderPeach}`,
            padding: tokens.spacing.lg,
          }}
        >
          <span
            style={{
              fontSize: tokens.typography.caption.fontSize,
              fontWeight: 700,
              color: tokens.colors.peachPrimary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Suggested Icebreaker
          </span>
          <p
            style={{
              fontSize: tokens.typography.bodyRegular.fontSize,
              fontStyle: "italic",
              color: tokens.colors.textPrimary,
              lineHeight: "22px",
            }}
          >
            “{persona.suggestedPrompt}”
          </p>
        </div>

        {/* Primary Call Action */}
        <div style={{ width: "100%", marginTop: "auto", display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
          <Button
            size="lg"
            variant="primary"
            fullWidth
            onClick={() => onStartCall(persona.id)}
            leftIcon="📞"
          >
            Start Call with {persona.name}
          </Button>

          <p
            style={{
              fontSize: "12px",
              textAlign: "center",
              color: tokens.colors.textTertiary,
            }}
          >
            {persona.disclosure}
          </p>
        </div>
      </div>
    </div>
  );
};
