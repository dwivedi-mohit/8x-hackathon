import React, { useEffect } from "react";
import { useRealtimeCall } from "../../../hooks/useRealtimeCall";
import type { PersonaId } from "../../../types/call";

/**
 * Minimal integration example showing how CallUiProps connects to useRealtimeCall.
 *
 * This is NOT a styled UI component — it demonstrates the wiring only.
 * The Emergent UI team should adapt these prop mappings to their own components.
 */

type CallUiProps = {
  personaId: PersonaId;
  personaName: string;
  onCallEnd?: () => void;
};

export function IntegrationExample({ personaId, personaName, onCallEnd }: CallUiProps) {
  const call = useRealtimeCall();

  useEffect(() => {
    return () => call.disconnect();
  }, []);

  const handleCall = () => call.connect(personaId);

  const handleEnd = () => {
    call.disconnect();
    onCallEnd?.();
  };

  const handleRetry = () => call.retry();

  const handleToggleMute = () => call.setMuted(!call.muted);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h2>Call {personaName}</h2>

      {/* Error banner */}
      {call.errorMessage && (
        <div role="alert" style={{ color: "#FF6B6B", marginBottom: 12 }}>
          {call.errorMessage}
        </div>
      )}

      {/* Status */}
      <p>
        Status: <strong>{call.status}</strong>
      </p>
      <p>
        Quality: <strong>{call.connectionQuality}</strong>
      </p>

      {/* Elapsed */}
      {call.status !== "idle" && call.status !== "ended" && call.status !== "error" && (
        <p>Elapsed: {call.elapsedSeconds}s</p>
      )}

      {/* Controls */}
      {call.status === "idle" && (
        <button onClick={handleCall}>Call {personaName}</button>
      )}

      {call.status === "connecting" && <p>Connecting…</p>}

      {(call.status === "listening" || call.status === "thinking" || call.status === "speaking") && (
        <>
          <button onClick={handleToggleMute}>
            {call.muted ? "Unmute" : "Mute"}
          </button>
          <button onClick={handleEnd} style={{ marginLeft: 8 }}>
            End Call
          </button>
        </>
      )}

      {call.status === "reconnecting" && <p>Reconnecting…</p>}

      {call.status === "error" && (
        <button onClick={handleRetry}>Retry</button>
      )}

      {call.status === "ended" && (
        <p>Call ended.</p>
      )}
    </div>
  );
}
