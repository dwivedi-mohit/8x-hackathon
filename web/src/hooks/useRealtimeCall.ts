import { useState, useRef, useCallback, useEffect } from "react";
import { RealtimeCallService } from "../services/realtime/RealtimeCallService";
import type { CallStatus, ConnectionQuality, PersonaId, RealtimeCallController } from "../types/call";

export function useRealtimeCall(): RealtimeCallController {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [muted, setMutedState] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("unknown");

  const serviceRef = useRef<RealtimeCallService | null>(null);

  // Lazily create the service
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new RealtimeCallService({
        onStatusChange: (s) => setStatus(s),
        onErrorMessage: (m) => setErrorMessage(m),
        onElapsedChange: (e) => setElapsedSeconds(e),
        onQualityChange: (q) => setConnectionQuality(q),
      });
    }
    return serviceRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceRef.current?.dispose();
      serviceRef.current = null;
    };
  }, []);

  const connect = useCallback(async (personaId: PersonaId) => {
    setElapsedSeconds(0);
    setErrorMessage(undefined);
    await getService().connect(personaId);
  }, [getService]);

  const disconnect = useCallback(() => {
    getService().disconnect();
    setMutedState(false);
  }, [getService]);

  const setMuted = useCallback((value: boolean) => {
    getService().setMuted(value);
    setMutedState(value);
  }, [getService]);

  const retry = useCallback(async () => {
    setErrorMessage(undefined);
    setElapsedSeconds(0);
    await getService().retry();
  }, [getService]);

  return {
    status,
    muted,
    elapsedSeconds,
    errorMessage,
    connectionQuality,
    connect,
    disconnect,
    setMuted,
    retry,
  };
}
