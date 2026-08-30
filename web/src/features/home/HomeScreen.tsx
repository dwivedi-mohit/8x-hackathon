import React from "react";
import type { PersonaId } from "../../types/call.js";
import { preparedPersonas } from "../persona/personasData.js";
import { AppHeader } from "../../components/AppHeader.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { tokens } from "../../styles/tokens.js";

type HomeScreenProps = {
  onSelectPersona: (personaId: PersonaId) => void;
  onQuickCall: (personaId: PersonaId) => void;
  onCreatePersona: () => void;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPersona,
  onQuickCall,
  onCreatePersona,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
      <AppHeader
        title="Echo"
        subtitle="A conversation that feels personal"
        rightAction={<SafetyDisclosure compact text="AI Characters" />}
      />

      <div
        style={{
          padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
          flex: 1,
        }}
      >
        {/* Hero Section */}
        <section style={{ textAlign: "left", marginBottom: tokens.spacing.xs }}>
          <h2
            style={{
              fontSize: tokens.typography.headingMedium.fontSize,
              lineHeight: tokens.typography.headingMedium.lineHeight,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
            }}
          >
            Who would you like to talk with?
          </h2>
          <p
            style={{
              fontSize: tokens.typography.bodyRegular.fontSize,
              lineHeight: tokens.typography.bodyRegular.lineHeight,
              color: tokens.colors.textSecondary,
              marginTop: "4px",
            }}
          >
            Choose a thoughtful AI persona for a real-time voice call.
          </p>
        </section>

        {/* Persona Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
          {preparedPersonas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectPersona(persona.id);
                }
              }}
              style={{
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.radii.card,
                border: `1.5px solid ${tokens.colors.border}`,
                padding: tokens.spacing.lg,
                boxShadow: tokens.shadows.card,
                backdropFilter: "blur(18px) saturate(145%)",
                WebkitBackdropFilter: "blur(18px) saturate(145%)",
                display: "flex",
                flexDirection: "column",
                gap: tokens.spacing.md,
                cursor: "pointer",
                transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
                <PersonaAvatar persona={persona} size="md" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3
                      style={{
                        fontSize: tokens.typography.subheading.fontSize,
                        fontWeight: 700,
                        color: tokens.colors.textPrimary,
                      }}
                    >
                      {persona.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "12px",
                        color: tokens.colors.lavenderPrimary,
                        fontWeight: 600,
                      }}
                    >
                      Details →
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: tokens.typography.bodySmall.fontSize,
                      color: tokens.colors.textSecondary,
                      marginTop: "2px",
                    }}
                  >
                    {persona.tagline}
                  </p>
                </div>
              </div>

              <p
                style={{
                  fontSize: tokens.typography.bodySmall.fontSize,
                  lineHeight: "20px",
                  color: tokens.colors.textSecondary,
                }}
              >
                {persona.description}
              </p>

              {/* Trait Tags & Call Action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: tokens.spacing.xs,
                  borderTop: `1px solid ${tokens.colors.borderSubtle}`,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {persona.traits.slice(0, 2).map((trait) => (
                    <span
                      key={trait}
                      style={{
                        backgroundColor: tokens.colors.canvasMuted,
                        color: tokens.colors.textSecondary,
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: tokens.radii.sm,
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickCall(persona.id);
                  }}
                  leftIcon="📞"
                >
                  Call {persona.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Custom Persona Card Placeholder */}
        <div
          onClick={onCreatePersona}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onCreatePersona();
            }
          }}
          style={{
            backgroundColor: tokens.colors.surfacePeachTint,
            borderRadius: tokens.radii.card,
            border: `1.5px dashed ${tokens.colors.borderPeach}`,
            padding: tokens.spacing.lg,
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.md,
            cursor: "pointer",
            backdropFilter: "blur(18px) saturate(145%)",
            WebkitBackdropFilter: "blur(18px) saturate(145%)",
            marginTop: tokens.spacing.xs,
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: tokens.colors.peachWarm,
              color: tokens.colors.textInverse,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
            }}
          >
            ✨
          </div>
          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: tokens.typography.subheading.fontSize,
                fontWeight: 700,
                color: tokens.colors.textPrimary,
              }}
            >
              Create a fictional persona
            </h4>
            <p
              style={{
                fontSize: tokens.typography.bodySmall.fontSize,
                color: tokens.colors.textSecondary,
                marginTop: "2px",
              }}
            >
              Design a custom character with photo and personality.
            </p>
          </div>
          <span style={{ fontSize: "20px", color: tokens.colors.peachPrimary }}>+</span>
        </div>
      </div>

      <SafetyDisclosure />
    </div>
  );
};
