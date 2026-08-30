export type CallStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "reconnecting"
  | "error"
  | "ended";

export type ConnectionQuality = "good" | "degraded" | "unknown";

export type PersonaId = "maya" | "arjun" | "luna";

export type RealtimeCallController = {
  status: CallStatus;
  muted: boolean;
  elapsedSeconds: number;
  errorMessage?: string;
  connectionQuality: ConnectionQuality;
  connect(personaId: PersonaId): Promise<void>;
  disconnect(): void;
  setMuted(muted: boolean): void;
  retry(): Promise<void>;
};

export type CallBackendRequest = { personaId: PersonaId; sdp: string };
export type CallBackendResponse = { sdp: string };

/** Shared boundary between the visual call screen and the live call controller. */
export type CallUiProps = {
  personaId: PersonaId | string;
  personaName: string;
  onCallEnd?: () => void;
  controller?: RealtimeCallController;
};
