export type CallStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "reconnecting"
  | "error"
  | "ended";

export type PersonaId = "maya" | "arjun" | "luna";

export type RealtimeCallController = {
  status: CallStatus;
  muted: boolean;
  elapsedSeconds: number;
  errorMessage?: string;
  connect(personaId: PersonaId): Promise<void>;
  disconnect(): void;
  setMuted(muted: boolean): void;
  retry(): Promise<void>;
};

export type CallBackendRequest = {
  personaId: PersonaId;
  sdp: string;
};

export type CallBackendResponse = {
  sdp: string;
};
