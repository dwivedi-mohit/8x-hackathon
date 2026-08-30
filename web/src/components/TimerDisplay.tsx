import React from "react";
import { tokens } from "../styles/tokens.js";

type TimerDisplayProps = {
  seconds: number;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      aria-label={`Call duration: ${seconds} seconds`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: tokens.typography.subheading.fontSize,
        fontWeight: 600,
        color: tokens.colors.textSecondary,
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "0.05em",
        padding: "4px 12px",
        borderRadius: tokens.radii.full,
        backgroundColor: tokens.colors.canvasMuted,
        border: `1px solid ${tokens.colors.borderSubtle}`,
      }}
    >
      <span>⏱</span>
      <span>{formatTime(seconds)}</span>
    </div>
  );
};
