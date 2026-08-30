import React from "react";
import type { CallStatus } from "../types/call.js";
import { tokens } from "../styles/tokens.js";

type CallVisualizerProps = {
  status: CallStatus;
  accentColor?: string;
};

export const CallVisualizer: React.FC<CallVisualizerProps> = ({
  status,
  accentColor = tokens.colors.lavenderPrimary,
}) => {
  const isSpeaking = status === "speaking";
  const isListening = status === "listening";
  const isThinking = status === "thinking";

  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "44px",
        padding: "0 16px",
      }}
    >
      {[0.4, 0.7, 1.0, 0.6, 0.9, 0.5, 0.8, 0.3].map((heightMultiplier, index) => {
        let barHeight = 8;
        let opacity = 0.4;
        let animationStyle: React.CSSProperties = {};

        if (isSpeaking) {
          barHeight = 12 + Math.floor(heightMultiplier * 26);
          opacity = 0.9;
          animationStyle = {
            animation: `speakingWave ${0.8 + (index % 3) * 0.3}s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
          };
        } else if (isListening) {
          barHeight = 10 + Math.floor(heightMultiplier * 14);
          opacity = 0.7;
        } else if (isThinking) {
          barHeight = 12;
          opacity = 0.5 + (index % 2) * 0.4;
        }

        return (
          <div
            key={index}
            style={{
              width: "4px",
              height: `${barHeight}px`,
              borderRadius: "4px",
              backgroundColor: isSpeaking ? tokens.colors.statusSpeaking : accentColor,
              opacity,
              transition: "height 0.25s ease, opacity 0.25s ease, background-color 0.25s ease",
              ...animationStyle,
            }}
          />
        );
      })}
    </div>
  );
};
