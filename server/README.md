# Echo server

Minimal server-side proxy for Project Echo's browser WebRTC call setup.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `OPENAI_API_KEY` only in `server/.env`. Never add it to browser code, Git, or a frontend environment file.

## API contract

`POST /api/realtime/calls`

```json
{
  "personaId": "maya",
  "sdp": "browser WebRTC SDP offer"
}
```

Success response (`201`):

```json
{
  "sdp": "OpenAI WebRTC SDP answer"
}
```

Only `maya`, `arjun`, and `luna` are accepted. Persona instructions are server-owned and are never accepted from the browser.

The call route is rate-limited to 10 attempts per IP per minute by default. Override `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` for local testing if necessary.
