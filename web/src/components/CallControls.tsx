import React from "react";
import type { CallStatus } from "../types/call.js";
import { tokens } from "../styles/tokens.js";
import { Button } from "./Button.js";

type CallControlsProps = {
  status: CallStatus;
  muted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  onRetry?: () => void;
  onSelectMockState?: (status: CallStatus) => void;
  isMockMode?: boolean;
};

export const CallControls: React.FC<CallControlsProps> = ({
  status,
  muted,
  onToggleMute,
  onEndCall,
  onRetry,
  onSelectMockState,
  isMockMode = true,
}) => {
  const isLive = status === "listening" || status === "thinking" || status === "speaking";
  const isConnecting = status === "connecting" || status === "reconnecting";
  const isError = status === "error";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacing.md,
        width: "100%",
        padding: "16px 24px 34px",
        backgroundColor: "transparent",
        borderTop: "none",
      }}
    >
      {/* Main Floating Glass Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {/* Mute Microphone Button (Left, 62px) */}
        <button
          onClick={onToggleMute}
          disabled={!isLive}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          style={{
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            backgroundColor: muted ? "rgba(251, 146, 60, 0.3)" : "rgba(255, 255, 255, 0.58)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: `1.5px solid ${muted ? tokens.colors.peachPrimary : "rgba(255, 255, 255, 0.95)"}`,
            color: muted ? tokens.colors.peachPrimary : "#8B86A8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !isLive ? "not-allowed" : "pointer",
            opacity: !isLive ? 0.4 : 1,
            transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "0 8px 20px rgba(139, 92, 246, 0.12)",
          }}
        >
          {muted ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.14 1.76-.46 2.53-.93L19.73 21 21 19.73 4.27 3z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>

        {/* End Call Button (Center, 78px, Coral-Red #FF3B30 / #FF5A5F) */}
        <button
          onClick={onEndCall}
          aria-label="End call"
          style={{
            width: "78px",
            height: "78px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FF3B30 0%, #FF5A5F 50%, #FF7A7A 100%)",
            color: "#FFFFFF",
            border: "2px solid rgba(255, 255, 255, 0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 28px rgba(255, 59, 48, 0.5), 0 12px 24px rgba(239, 68, 68, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.75)",
            cursor: "pointer",
            transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <svg viewBox="0 0 24 24" width="34" height="34" fill="#FFFFFF" style={{ transform: "rotate(135deg)" }}>
            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 3.97c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.59c0-.55-.45-1-.99-1z" />
          </svg>
        </button>

        {/* Camera / Speaker Button (Right, 62px) */}
        <button
          onClick={onRetry}
          aria-label="Camera options"
          style={{
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.58)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(255, 255, 255, 0.95)",
            color: "#8B86A8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(139, 92, 246, 0.12)",
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
          </svg>
        </button>
      </div>

      {/* Mock State Selector Bar (for UI testing & demonstration) */}
      {isMockMode && onSelectMockState && (
        <div
          style={{
            marginTop: tokens.spacing.sm,
            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
            backgroundColor: tokens.colors.canvasMuted,
            borderRadius: tokens.radii.md,
            border: `1px dashed ${tokens.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: tokens.colors.textTertiary,
              marginBottom: "4px",
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Mock State Simulator (QA / Dev)
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              justifyContent: "center",
            }}
          >
            {(
              [
                "connecting",
                "listening",
                "thinking",
                "speaking",
                "reconnecting",
                "error",
                "ended",
              ] as CallStatus[]
            ).map((mockStatus) => (
              <button
                key={mockStatus}
                onClick={() => onSelectMockState(mockStatus)}
                style={{
                  padding: "3px 8px",
                  fontSize: "11px",
                  fontWeight: status === mockStatus ? 700 : 500,
                  borderRadius: tokens.radii.sm,
                  backgroundColor:
                    status === mockStatus
                      ? tokens.colors.lavenderPrimary
                      : tokens.colors.surface,
                  color:
                    status === mockStatus
                      ? tokens.colors.textInverse
                      : tokens.colors.textSecondary,
                  border: `1px solid ${
                    status === mockStatus
                      ? tokens.colors.lavenderPrimary
                      : tokens.colors.borderSubtle
                  }`,
                }}
              >
                {mockStatus}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
