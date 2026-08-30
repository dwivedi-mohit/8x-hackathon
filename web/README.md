# Project Echo — Browser Realtime Connection Layer

## Overview

This package provides a browser-native WebRTC call service for Project Echo's light-theme UI. It manages the full WebRTC lifecycle — microphone capture, SDP exchange with the backend, remote audio playback, data channel events, and state transitions — without touching UI components.

## Setup

### Prerequisites

- Node.js 18+
- A backend implementing `POST /api/realtime/calls` (see Backend Contract below)

### Install

```bash
cd web
npm install
```

### TypeScript Check

```bash
npx tsc --noEmit
```

### Run Tests

```bash
npx vitest run
```

## Backend Contract

### `POST /api/realtime/calls`

The backend proxies the SDP exchange with OpenAI Realtime. It must:

1. Receive the browser's WebRTC offer SDP and persona ID
2. Create its own `RTCPeerConnection` with OpenAI Realtime
3. Return the answer SDP

**Request:**

```json
{
  "personaId": "maya" | "arjun" | "luna",
  "sdp": "<offer SDP string>"
}
```

**Response:**

```json
{
  "sdp": "<answer SDP string>"
}
```

**Important:** The browser never contacts OpenAI directly. All API keys remain server-side.

## File Map

```
web/src/
├── types/
│   └── call.ts                          # CallStatus, PersonaId, RealtimeCallController, backend types
├── services/
│   └── realtime/
│       ├── RealtimeCallService.ts        # Core WebRTC service class
│       ├── index.ts                      # Barrel export
│       ├── __tests__/
│       │   └── state-transitions.test.ts # Unit tests for status transitions
│       └── example/
│           └── IntegrationExample.tsx     # Minimal wiring example
├── hooks/
│   └── useRealtimeCall.ts                # React hook exposing RealtimeCallController
└── lib/
    └── audio/
        ├── AudioManager.ts               # Programmatic <audio> element management
        └── index.ts                      # Barrel export
```

## Usage

### React Hook

```tsx
import { useRealtimeCall } from "./hooks/useRealtimeCall";

function MyComponent() {
  const call = useRealtimeCall();

  // call.status       → CallStatus
  // call.muted        → boolean
  // call.elapsedSeconds → number
  // call.errorMessage → string | undefined
  // call.connect(personaId) → Promise<void>
  // call.disconnect()       → void
  // call.setMuted(muted)    → void
  // call.retry()            → Promise<void>
}
```

### Direct Service Usage

```tsx
import { RealtimeCallService } from "./services/realtime";

const service = new RealtimeCallService({
  onStatusChange: (status) => console.log(status),
  onErrorMessage: (msg) => console.error(msg),
  onElapsedChange: (sec) => console.log(`${sec}s`),
});

await service.connect("maya");
// ...
service.disconnect();
service.dispose();
```

## State Machine

```
idle ──connect()──▶ connecting ──ontrack──▶ listening
                        │                      │
                        │                  (data channel)
                        │              speech_started → thinking
                        │              audio.delta → speaking
                        │              response.done → listening
                        │
                   getUserMedia denied ──▶ error
                   fetch failed ──▶ error
                   malformed response ──▶ error
                   ICE failed ──▶ error
                        │
                   unexpected disconnect ──▶ reconnecting ──retry──▶ connecting
                        │
                   user disconnect ──▶ ended
```

## Error Handling

| Trigger | Status | errorMessage |
|---------|--------|-------------|
| Microphone denied | `error` | Microphone access denied. Enable it in Settings. |
| Fetch fails | `error` | Network error. Check your connection. |
| Response missing `sdp` | `error` | Invalid server response. |
| ICE connection fails | `error` | Connection failed. |
| Unexpected disconnect | `reconnecting` | — (auto-retry after 2s) |
| Reconnect fails | `error` | Connection failed. |

## Cleanup Guarantees

The service cleans up on every exit path:

- `disconnect()` — user ended call
- `retry()` — cleans up before reconnecting
- `dispose()` — called on component unmount
- `useEffect` cleanup in `useRealtimeCall`

All of: media tracks stopped, peer connection closed, data channel closed, audio element removed, timers cleared.

## What This Does NOT Do

- No UI components, CSS, or design tokens
- No server code
- No API key management
- No authentication or database
- No persona data — just the `personaId` string passed to the backend
