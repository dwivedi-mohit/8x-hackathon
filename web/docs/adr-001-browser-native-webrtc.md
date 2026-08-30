# ADR-001: Browser-native WebRTC over managed SDK

## Status

Accepted

## Context

Project Echo needs a browser-based WebRTC call service that connects to OpenAI Realtime via a backend proxy. The two main approaches are:

1. **Browser-native `RTCPeerConnection`** — direct use of Web APIs
2. **Managed SDK** (e.g., Twilio, Daily, Agora) — third-party abstraction

## Decision

Use browser-native `RTCPeerConnection` with `navigator.mediaDevices.getUserMedia`.

## Consequences

### Positive

- Zero third-party dependencies for the connection layer
- No SDK vendor lock-in or pricing tier concerns
- Full control over ICE policy, SDP format, and data channel behavior
- Smaller bundle size — no SDK runtime
- Easier to debug — standard WebRTC APIs, no abstraction leaks

### Negative

- Must handle ICE gathering, reconnection, and error states manually
- No built-in TURN server coordination (backend must provide STUN/TURN if needed)
- Browser autoplay policy handling required for remote audio
- More test surface — must mock `RTCPeerConnection` in unit tests

### Mitigations

- Exponential backoff and health monitoring handle reconnection
- Audio element autoplay policy handled with gesture-based fallback
- Mock `RTCPeerConnection` class in tests covers the full lifecycle
- Backend owns TURN server configuration if needed

## Alternatives Considered

- **Twilio WebRTC SDK**: Adds dependency and pricing. Overkill for a hackathon MVP.
- **Simple Peer**: Wrapper around `RTCPeerConnection`. Adds abstraction without meaningful simplification.
- **Socket.IO signaling**: Adds server complexity. SDP exchange is simple enough for POST.
