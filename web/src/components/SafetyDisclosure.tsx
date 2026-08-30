import React from "react";
import { tokens } from "../styles/tokens.js";

type SafetyDisclosureProps = {
  compact?: boolean;
  text?: string;
};

export const SafetyDisclosure: React.FC<SafetyDisclosureProps> = ({
  compact = false,
  text = "AI-created conversations. Not a real person.",
}) => {
  if (compact) {
    return (
      <div
        role="note"
        aria-label="AI disclosure"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          backgroundColor: tokens.colors.surfaceSubtle,
          border: `1px solid ${tokens.colors.borderSubtle}`,
          borderRadius: tokens.radii.full,
          padding: "4px 10px",
          fontSize: tokens.typography.caption.fontSize,
          color: tokens.colors.textSecondary,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: tokens.colors.lavenderPrimary,
          }}
        />
        <span>{text}</span>
      </div>
    );
  }

  return (
    <footer
      role="contentinfo"
      style={{
        padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
        textAlign: "center",
        borderTop: `1px solid ${tokens.colors.borderSubtle}`,
        backgroundColor: tokens.colors.canvasMuted,
      }}
    >
      <p
        style={{
          fontSize: tokens.typography.bodySmall.fontSize,
          lineHeight: tokens.typography.bodySmall.lineHeight,
          color: tokens.colors.textTertiary,
        }}
      >
        Echo uses fictional AI personas for mindful presence. Never a replacement for real human connection, medical care, or emergency services.
      </p>
    </footer>
  );
};
