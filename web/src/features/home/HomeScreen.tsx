import React from "react";
import type { PersonaId } from "../../types/call.js";
import { getAllPersonas } from "../persona/personasData.js";
import { AppHeader } from "../../components/AppHeader.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { tokens } from "../../styles/tokens.js";

type HomeScreenProps = {
  onSelectPersona: (personaId: PersonaId | string) => void;
  onQuickCall: (personaId: PersonaId | string) => void;
  onCreatePersona: () => void;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPersona,
  onQuickCall,
  onCreatePersona,
}) => {
  const personas = getAllPersonas();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
      {/* Top Minimal Cursive Brand Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "16px 22px 4px",
        }}
      >
        <span
          style={{
            fontFamily: "'Dancing Script', 'Great Vibes', 'Pacifico', 'Brush Script MT', 'Caveat', cursive",
            fontSize: "32px",
            fontWeight: 700,
            color: "#312E81",
            letterSpacing: "0.02em",
            textShadow: "0 2px 10px rgba(139, 92, 246, 0.22)",
            lineHeight: 1.1,
          }}
        >
          Echo
        </span>
      </div>

      <div
        style={{
          padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
          flex: 1,
        }}
      >
        {/* Hero Section */}
        <section style={{ textAlign: "left" }}>
          <h2
            style={{
              fontSize: "22px",
              lineHeight: 1.25,
              fontWeight: 800,
              color: tokens.colors.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            Who would you like to talk with?
          </h2>
        </section>

        {/* Persona Cards List (2-Column Grid) */}
        {personas.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "14px",
            }}
          >
            {personas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => onSelectPersona(persona.id as PersonaId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onSelectPersona(persona.id as PersonaId);
                  }
                }}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.65)",
                  borderRadius: "26px",
                  border: "1.5px solid rgba(255, 255, 255, 0.88)",
                  padding: "20px 12px 18px",
                  boxShadow: "0 10px 24px rgba(100, 65, 211, 0.08)",
                  backdropFilter: "blur(20px) saturate(140%)",
                  WebkitBackdropFilter: "blur(20px) saturate(140%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                }}
              >
                {/* 1. Squircle Avatar (Continuous Superellipse) */}
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "32px",
                    overflow: "hidden",
                    boxShadow: "0 8px 20px rgba(100, 65, 211, 0.14)",
                    border: "3px solid rgba(255, 255, 255, 0.95)",
                    backgroundColor: persona.avatarGradient?.start || "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {persona.photoUrl ? (
                    <img
                      src={persona.photoUrl}
                      alt={persona.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(135deg, ${persona.avatarGradient?.start || "#818CF8"} 0%, ${persona.avatarGradient?.end || "#C084FC"} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "38px",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          textShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        {persona.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Centered Name */}
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "#312E81",
                    marginTop: "12px",
                    marginBottom: "0px",
                    textAlign: "center",
                    letterSpacing: "-0.01em",
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {persona.name}
                </h3>

                {/* 3. Glowing Round Lavender/Purple Call Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onQuickCall(persona.id as PersonaId);
                  }}
                  aria-label={`Call ${persona.name}`}
                  style={{
                    marginTop: "12px",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #C084FC 0%, #818CF8 100%)",
                    border: "2px solid rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 0 20px rgba(192, 132, 252, 0.5), 0 6px 14px rgba(129, 140, 248, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#FFFFFF",
                    transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 3.97c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.59c0-.55-.45-1-.99-1z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Luxury Glassmorphism Create Persona Banner */}
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
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 244, 235, 0.65) 100%)",
            borderRadius: "28px",
            border: "1.5px solid rgba(255, 255, 255, 0.95)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            cursor: "pointer",
            backdropFilter: "blur(24px) saturate(150%)",
            WebkitBackdropFilter: "blur(24px) saturate(150%)",
            boxShadow: "0 14px 32px rgba(244, 162, 97, 0.12), 0 2px 8px rgba(0, 0, 0, 0.03)",
            marginTop: "4px",
            transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease",
          }}
        >
          {/* Glowing Peach/Coral Squircle Icon */}
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(244, 162, 97, 0.4)",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <h4
              style={{
                fontSize: "17px",
                fontWeight: 800,
                color: "#312E81",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Create AI Persona
            </h4>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#8B86A8",
                marginTop: "2px",
                margin: 0,
              }}
            >
              Custom 3D avatar & voice clone
            </p>
          </div>

          {/* Sleek Right Action Pill */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              border: "1.5px solid rgba(244, 162, 97, 0.35)",
              color: "#E76F51",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(244, 162, 97, 0.15)",
              flexShrink: 0,
            }}
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
};
