import React from "react";
import type { Persona } from "../types/persona.js";
import { tokens } from "../styles/tokens.js";

type PersonaAvatarProps = {
  persona: Persona;
  size?: "sm" | "md" | "lg" | "call";
  isSpeaking?: boolean;
  isListening?: boolean;
};

export const PersonaAvatar: React.FC<PersonaAvatarProps> = ({
  persona,
  size = "md",
  isSpeaking = false,
  isListening = false,
}) => {
  const getDimensions = () => {
    switch (size) {
      case "sm":
        return { size: 40, font: 16, ring: 2 };
      case "md":
        return { size: 56, font: 22, ring: 3 };
      case "lg":
        return { size: 88, font: 36, ring: 4 };
      case "call":
      default:
        return { size: 140, font: 56, ring: 6 };
    }
  };

  const dim = getDimensions();

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer ambient glow halo for call screen or active speaking/listening */}
      {(size === "call" || isSpeaking || isListening) && (
        <div
          className={isSpeaking ? "anim-ambient-pulse" : isListening ? "anim-listening-glow" : ""}
          style={{
            position: "absolute",
            width: `${dim.size + 36}px`,
            height: `${dim.size + 36}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${persona.avatarGradient?.glow || "rgba(167, 139, 250, 0.35)"} 0%, rgba(250, 248, 245, 0) 70%)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}

      {/* Main Avatar Circle */}
      <div
        style={{
          width: `${dim.size}px`,
          height: `${dim.size}px`,
          borderRadius: "50%",
          background: persona.photoUrl
            ? "transparent"
            : `linear-gradient(135deg, ${persona.avatarGradient?.start || "#A78BFA"} 0%, ${persona.avatarGradient?.end || "#F4A261"} 100%)`,
          border: `${dim.ring}px solid ${tokens.colors.surface}`,
          boxShadow: `0 8px 24px ${persona.avatarGradient?.glow || "rgba(167, 139, 250, 0.3)"}, 0 2px 8px rgba(31, 29, 43, 0.08)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.colors.textInverse,
          fontSize: `${dim.font}px`,
          fontWeight: 700,
          overflow: "hidden",
          zIndex: 1,
          userSelect: "none",
        }}
      >
        {persona.photoUrl ? (
          <img
            src={persona.photoUrl}
            alt={persona.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span>{persona.name.charAt(0)}</span>
        )}
      </div>
    </div>
  );
};
