import React from "react";
import type { CallStatus } from "../types/call.js";
import { tokens } from "../styles/tokens.js";

type StatusBadgeProps = {
  status: CallStatus;
  size?: "sm" | "md" | "lg";
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "connecting":
        return {
          label: "Connecting…",
          color: tokens.colors.statusConnecting,
          bg: tokens.colors.statusConnectingBg,
          dotPulse: true,
        };
      case "listening":
        return {
          label: "Listening",
          color: tokens.colors.statusListening,
          bg: tokens.colors.statusListeningBg,
          dotPulse: true,
        };
      case "thinking":
        return {
          label: "Thinking…",
          color: tokens.colors.statusThinking,
          bg: tokens.colors.statusThinkingBg,
          dotPulse: true,
        };
      case "speaking":
        return {
          label: "Speaking",
          color: tokens.colors.statusSpeaking,
          bg: tokens.colors.statusSpeakingBg,
          dotPulse: true,
        };
      case "reconnecting":
        return {
          label: "Reconnecting…",
          color: tokens.colors.statusReconnecting,
          bg: tokens.colors.statusReconnectingBg,
          dotPulse: true,
        };
      case "error":
        return {
          label: "Connection Error",
          color: tokens.colors.statusError,
          bg: tokens.colors.statusErrorBg,
          dotPulse: false,
        };
      case "ended":
        return {
          label: "Call Ended",
          color: tokens.colors.statusEnded,
          bg: tokens.colors.statusEndedBg,
          dotPulse: false,
        };
      case "idle":
      default:
        return {
          label: "Ready to Call",
          color: tokens.colors.lavenderPrimary,
          bg: tokens.colors.lavenderSoft,
          dotPulse: false,
        };
    }
  };

  const config = getStatusConfig();
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "6px" : "8px",
        backgroundColor: config.bg,
        border: `1px solid ${config.color}33`,
        color: config.color,
        padding: isSmall ? "4px 10px" : isLarge ? "8px 18px" : "6px 14px",
        borderRadius: tokens.radii.full,
        fontSize: isSmall ? "12px" : isLarge ? "15px" : "13px",
        fontWeight: 600,
        boxShadow: tokens.shadows.subtle,
      }}
    >
      <span
        style={{
          width: isSmall ? "6px" : "8px",
          height: isSmall ? "6px" : "8px",
          borderRadius: "50%",
          backgroundColor: config.color,
          display: "inline-block",
        }}
      />
      <span>{config.label}</span>
    </div>
  );
};
