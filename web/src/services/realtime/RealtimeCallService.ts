import type { CallStatus, PersonaId, CallBackendRequest, CallBackendResponse } from "../../types/call";
import { AudioManager } from "../../lib/audio/AudioManager";

const ICE_GATHERING_TIMEOUT_MS = 5000;
const RECONNECT_DELAY_MS = 2000;

type CallServiceCallbacks = {
  onStatusChange: (status: CallStatus) => void;
  onErrorMessage: (message: string | undefined) => void;
  onElapsedChange: (seconds: number) => void;
};

export class RealtimeCallService {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioManager = new AudioManager();

  private status: CallStatus = "idle";
  private elapsedSeconds = 0;
  private elapsedInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private lastPersonaId: PersonaId | null = null;
  private connecting = false;

  private callbacks: CallServiceCallbacks;

  constructor(callbacks: CallServiceCallbacks) {
    this.callbacks = callbacks;
  }

  getMuted(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    return track ? !track.enabled : false;
  }

  setMuted(muted: boolean): void {
    const track = this.localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !muted;
    }
  }

  getStatus(): CallStatus {
    return this.status;
  }

  getElapsed(): number {
    return this.elapsedSeconds;
  }

  async connect(personaId: PersonaId): Promise<void> {
    if (this.connecting || this.status === "connecting" || this.status === "reconnecting") {
      return;
    }

    this.connecting = true;
    this.lastPersonaId = personaId;
    this.setStatus("connecting");
    this.setErrorMessage(undefined);

    try {
      await this.establishConnection(personaId);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.connecting = false;
    }
  }

  disconnect(): void {
    this.cleanup();
    this.setStatus("ended");
  }

  async retry(): Promise<void> {
    if (!this.lastPersonaId) return;
    if (this.status === "connecting" || this.status === "reconnecting") return;

    this.cleanup();
    await this.connect(this.lastPersonaId);
  }

  dispose(): void {
    this.cleanup();
  }

  private async establishConnection(personaId: PersonaId): Promise<void> {
    // 1. Get microphone
    let localStream: MediaStream;
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new CallError("Microphone access denied. Enable it in Settings.", "mic-denied");
    }
    this.localStream = localStream;

    // 2. Create peer connection
    const pc = new RTCPeerConnection({
      iceTransportPolicy: "all",
    });
    this.pc = pc;

    // 3. Add local audio track
    for (const track of localStream.getAudioTracks()) {
      pc.addTrack(track, localStream);
    }

    // 4. Handle remote audio
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        this.audioManager.attach(event.streams[0]);
      }
    };

    // 5. Handle data channel (optional, graceful degradation)
    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel);
    };

    // Also create a data channel from our side in case server expects it
    try {
      const dc = pc.createDataChannel("session");
      this.setupDataChannel(dc);
    } catch {
      // Data channel creation failed — continue without it
    }

    // 6. Handle connection state changes
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "failed" || state === "closed") {
        if (this.status !== "ended" && this.status !== "error") {
          if (this.status === "connecting") {
            this.handleError(new CallError("Connection failed.", "connection-failed"));
          } else {
            this.setStatus("reconnecting");
            this.scheduleReconnect();
          }
        }
      } else if (state === "disconnected") {
        if (this.status !== "ended" && this.status !== "error" && this.status !== "connecting") {
          this.setStatus("reconnecting");
          this.scheduleReconnect();
        }
      }
    };

    // 7. Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // 8. Wait for ICE gathering to complete
    await this.waitForIceGathering(pc);

    const sdp = pc.localDescription?.sdp;
    if (!sdp) {
      throw new CallError("Failed to create offer.", "offer-failed");
    }

    // 9. Exchange SDP with backend
    let response: CallBackendResponse;
    try {
      const res = await fetch("/api/realtime/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, sdp } satisfies CallBackendRequest),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null) as { error?: string } | null;
        throw new CallError(
          errorBody?.error ?? `Unable to start the voice call (server ${res.status}).`,
          "server-error",
        );
      }

      response = await res.json();
    } catch (err) {
      if (err instanceof CallError) throw err;
      throw new CallError("Network error. Check your connection.", "network-error");
    }

    if (!response.sdp) {
      throw new CallError("Invalid server response.", "invalid-response");
    }

    // 10. Set remote answer
    await pc.setRemoteDescription({ type: "answer", sdp: response.sdp });

    // 11. Connected — transition to listening
    this.setStatus("listening");
    this.startElapsedTimer();
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    if (this.dc) return; // Already have one
    this.dc = channel;

    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleDataChannelMessage(data);
      } catch {
        // Non-JSON message — ignore
      }
    };

    channel.onclose = () => {
      this.dc = null;
    };
  }

  private handleDataChannelMessage(data: Record<string, unknown>): void {
    const type = data.type as string | undefined;
    if (!type) return;

    switch (type) {
      case "input_audio_buffer.speech_started":
        this.setStatus("listening");
        break;
      case "input_audio_buffer.speech_stopped":
        // Speech ended, AI will start thinking/responding
        break;
      case "response.created":
        this.setStatus("thinking");
        break;
      case "response.audio.delta":
        if (this.status !== "speaking") {
          this.setStatus("speaking");
        }
        break;
      case "response.audio.done":
        break;
      case "response.done":
        this.setStatus("listening");
        break;
      default:
        break;
    }
  }

  private handleError(err: unknown): void {
    const message = err instanceof CallError ? err.message : "An unexpected error occurred.";
    this.setStatus("error");
    this.setErrorMessage(message);
  }

  private cleanup(): void {
    // Stop reconnect timer
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Stop elapsed timer
    this.stopElapsedTimer();

    // Close data channel
    if (this.dc) {
      try { this.dc.close(); } catch { /* already closed */ }
      this.dc = null;
    }

    // Stop local tracks
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }
      this.localStream = null;
    }

    // Close peer connection
    if (this.pc) {
      try { this.pc.close(); } catch { /* already closed */ }
      this.pc = null;
    }

    // Remove audio element
    this.audioManager.detach();
  }

  private waitForIceGathering(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        pc.onicegatheringstatechange = null;
        resolve(); // Resolve anyway — proceed with whatever candidates we have
      }, ICE_GATHERING_TIMEOUT_MS);

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          pc.onicegatheringstatechange = null;
          resolve();
        }
      };
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.lastPersonaId && (this.status === "reconnecting" || this.status === "error")) {
        this.connecting = false;
        this.connect(this.lastPersonaId);
      }
    }, RECONNECT_DELAY_MS);
  }

  private startElapsedTimer(): void {
    this.stopElapsedTimer();
    this.elapsedSeconds = 0;
    this.elapsedInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.callbacks.onElapsedChange(this.elapsedSeconds);
    }, 1000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
    this.elapsedSeconds = 0;
  }

  private setStatus(status: CallStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.callbacks.onStatusChange(status);
  }

  private setErrorMessage(message: string | undefined): void {
    this.callbacks.onErrorMessage(message);
  }
}

class CallError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "CallError";
    this.code = code;
  }
}
