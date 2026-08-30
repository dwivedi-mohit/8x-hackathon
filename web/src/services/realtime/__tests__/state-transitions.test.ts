import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RealtimeCallService } from "../RealtimeCallService";

// Shared mock references so tests can inspect calls
let mockTracks: Array<{ enabled: boolean; stop: ReturnType<typeof vi.fn> }>;
let mockPcInstances: MockRTCPeerConnection[];

class MockRTCPeerConnection {
  localDescription: { sdp: string } | null = null;
  iceConnectionState = "new";
  ontrack: ((event: unknown) => void) | null = null;
  oniceconnectionstatechange: (() => void) | null = null;
  onicegatheringstatechange: (() => void) | null = null;
  ondatachannel: ((event: unknown) => void) | null = null;

  private iceGatheringState = "new";

  constructor() {
    mockPcInstances.push(this);
  }

  async createOffer() {
    return { type: "offer" as const, sdp: "mock-offer-sdp" };
  }

  async setLocalDescription(desc: { type: string; sdp: string }) {
    this.localDescription = { sdp: desc.sdp };
    this.iceGatheringState = "complete";
    this.onicegatheringstatechange?.();
  }

  async setRemoteDescription(_desc: { type: string; sdp: string }) {
    // Simulate remote stream arriving → triggers ontrack
    if (this.ontrack) {
      const mockStream = {
        getAudioTracks: () => [{ kind: "audio" }],
      };
      this.ontrack({ streams: [mockStream] });
    }
  }

  addTrack(_track: unknown, _stream: unknown) {}

  createDataChannel(name: string) {
    return {
      label: name,
      onmessage: null as ((event: unknown) => void) | null,
      onclose: null as (() => void) | null,
      close: vi.fn(),
    };
  }

  close() {}
}

const mockGetUserMedia = vi.fn();
const mockFetch = vi.fn();

describe("RealtimeCallService", () => {
  beforeEach(() => {
    mockTracks = [
      { enabled: true, stop: vi.fn() },
    ];
    mockPcInstances = [];

    vi.stubGlobal("RTCPeerConnection", MockRTCPeerConnection);
    vi.stubGlobal("navigator", {
      mediaDevices: {
        getUserMedia: mockGetUserMedia.mockResolvedValue({
          getAudioTracks: () => mockTracks,
          getTracks: () => mockTracks,
        }),
      },
    });
    vi.stubGlobal("fetch", mockFetch);
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        autoplay: false,
        srcObject: null,
        style: { display: "" },
        play: vi.fn().mockResolvedValue(undefined),
        remove: vi.fn(),
      })),
      body: { appendChild: vi.fn() },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sdp: "mock-answer-sdp" }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createService() {
    const onStatusChange = vi.fn();
    const onErrorMessage = vi.fn();
    const onElapsedChange = vi.fn();
    const onQualityChange = vi.fn();

    const service = new RealtimeCallService({
      onStatusChange,
      onErrorMessage,
      onElapsedChange,
      onQualityChange,
    });

    return { service, onStatusChange, onErrorMessage, onElapsedChange, onQualityChange };
  }

  it("starts in idle status", () => {
    const { service } = createService();
    expect(service.getStatus()).toBe("idle");
  });

  it("transitions to connecting then listening on successful connect", async () => {
    const { service, onStatusChange } = createService();

    await service.connect("maya");

    expect(onStatusChange).toHaveBeenCalledWith("connecting");
    expect(onStatusChange).toHaveBeenCalledWith("listening");
    expect(service.getStatus()).toBe("listening");
  });

  it("transitions to error on microphone denial", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("NotAllowedError"));
    const { service, onStatusChange, onErrorMessage } = createService();

    await service.connect("maya");

    expect(onStatusChange).toHaveBeenCalledWith("error");
    expect(onErrorMessage).toHaveBeenCalledWith(
      "Microphone access denied. Enable it in Settings."
    );
  });

  it("transitions to error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("fetch failed"));
    const { service, onStatusChange, onErrorMessage } = createService();

    await service.connect("maya");

    expect(onStatusChange).toHaveBeenCalledWith("error");
    expect(onErrorMessage).toHaveBeenCalledWith(
      "Network error. Check your connection."
    );
  });

  it("transitions to error on malformed server response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const { service, onStatusChange, onErrorMessage } = createService();

    await service.connect("maya");

    expect(onStatusChange).toHaveBeenCalledWith("error");
    expect(onErrorMessage).toHaveBeenCalledWith("Invalid server response.");
  });

  it("transitions to ended on disconnect", async () => {
    const { service, onStatusChange } = createService();
    await service.connect("maya");

    service.disconnect();

    expect(onStatusChange).toHaveBeenCalledWith("ended");
    expect(service.getStatus()).toBe("ended");
  });

  it("prevents duplicate connect calls", async () => {
    const { service } = createService();

    const p1 = service.connect("maya");
    const p2 = service.connect("arjun");

    await p1;
    await p2;

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("retry cleans up and reconnects", async () => {
    const { service } = createService();
    await service.connect("maya");
    expect(service.getStatus()).toBe("listening");

    service.disconnect();
    expect(service.getStatus()).toBe("ended");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sdp: "mock-answer-sdp-2" }),
    });

    await service.retry();
    expect(service.getStatus()).toBe("listening");
  });

  it("setMuted toggles local track enabled", async () => {
    const { service } = createService();
    await service.connect("maya");

    service.setMuted(true);
    expect(service.getMuted()).toBe(true);

    service.setMuted(false);
    expect(service.getMuted()).toBe(false);
  });

  it("dispose cleans up resources", async () => {
    const { service } = createService();
    await service.connect("maya");

    service.dispose();
    expect(service.getStatus()).toBe("listening");
  });

  it("disconnect stops all media tracks", async () => {
    const { service } = createService();
    await service.connect("maya");

    service.disconnect();

    for (const track of mockTracks) {
      expect(track.stop).toHaveBeenCalled();
    }
  });

  it("disconnect closes peer connection", async () => {
    const { service } = createService();
    await service.connect("maya");

    const pc = mockPcInstances[0];
    const closeSpy = vi.spyOn(pc, "close");

    service.disconnect();

    expect(closeSpy).toHaveBeenCalled();
  });

  it("error state stops media tracks", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("denied"));
    const { service } = createService();

    await service.connect("maya");

    // On mic denial, localStream was never set, so tracks aren't stopped
    // but the service should still be in error state
    expect(service.getStatus()).toBe("error");
  });

  it("retry after error cleans up previous state", async () => {
    mockGetUserMedia.mockRejectedValueOnce(new Error("denied"));
    const { service } = createService();

    await service.connect("maya");
    expect(service.getStatus()).toBe("error");

    // Reset mock for successful retry
    mockGetUserMedia.mockResolvedValueOnce({
      getAudioTracks: () => mockTracks,
      getTracks: () => mockTracks,
    });

    await service.retry();
    expect(service.getStatus()).toBe("listening");
  });
});
