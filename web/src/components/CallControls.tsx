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
        padding: `${tokens.spacing.md} ${tokens.spacing.xl} ${tokens.spacing.xl}`,
        backgroundColor: tokens.colors.surface,
        borderTop: `1px solid ${tokens.colors.borderSubtle}`,
      }}
    >
      {/* Main Action Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.spacing.lg,
        }}
      >
        {/* Mute Button */}
        <button
          onClick={onToggleMute}
          disabled={!isLive}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: muted ? tokens.colors.peachSubtle : tokens.colors.canvasMuted,
            border: `1.5px solid ${muted ? tokens.colors.peachPrimary : tokens.colors.border}`,
            color: muted ? tokens.colors.peachPrimary : tokens.colors.textPrimary,
            fontSize: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: !isLive ? "not-allowed" : "pointer",
            opacity: !isLive ? 0.4 : 1,
            transition: "all 0.18s ease",
            boxShadow: tokens.shadows.subtle,
          }}
        >
          <span>{muted ? "🔇" : "🎙️"}</span>
        </button>

        {/* End Call Button */}
        <button
          onClick={onEndCall}
          aria-label="End call"
          style={{
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            backgroundColor: tokens.colors.destructive,
            color: tokens.colors.textInverse,
            border: `2px solid ${tokens.colors.destructive}`,
            fontSize: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(239, 68, 68, 0.35)",
            cursor: "pointer",
            transition: "transform 0.15s ease, background-color 0.15s ease",
          }}
        >
          <span>📞</span>
        </button>

        {/* Retry / Speaker / Helper Button */}
        {isError && onRetry ? (
          <button
            onClick={onRetry}
            aria-label="Retry connection"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: tokens.colors.lavenderSubtle,
              border: `1.5px solid ${tokens.colors.lavenderPrimary}`,
              color: tokens.colors.lavenderPrimary,
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: tokens.shadows.subtle,
            }}
          >
            <span>🔄</span>
          </button>
        ) : (
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: tokens.colors.canvasMuted,
              border: `1px solid ${tokens.colors.borderSubtle}`,
              color: tokens.colors.textTertiary,
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Audio speaker active"
          >
            <span>🔊</span>
          </div>
        )}
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
