# Echo Web

Mobile-first light-theme UI and browser WebRTC call client for Project Echo.

## Run locally

```bash
npm install
npm run dev
```

The browser runs at `http://localhost:5173`. During development, Vite proxies `/api` requests to the backend at `http://localhost:3001`.

## Demo mode

Use UI-only mock call states without requesting microphone access:

```bash
VITE_DEMO_MODE=true npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Live-call contract

The browser sends an SDP offer to `POST /api/realtime/calls`; the backend returns the answer as `{ "sdp": "..." }`. Permanent API keys remain in `server/.env`, never in this app.
