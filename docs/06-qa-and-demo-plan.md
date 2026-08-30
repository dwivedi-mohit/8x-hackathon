# Project Echo — QA and Demo Readiness Plan

## Overview

This document defines the quality assurance strategy, real-device test checklist, security verification protocols, 90-second live demo playbook, P0 defect triage standard, and final submission checklist for **Project Echo**.

As Project Echo’s QA and demo-readiness owner, this plan ensures the voice-to-voice experience is robust, secure, emotionally resonant, and fully prepared for the live evaluation.

---

## 1. Real-Device Test Checklist

All tests must be executed on physical target devices (iOS Safari on iPhone and Android Chrome on Google Pixel / Samsung Galaxy) over cellular (4G/5G) and Wi-Fi networks.

### 1.1 Persona Selection
- [ ] **Persona Catalog Rendering:** Home screen displays all three prepared personas (**Maya**, **Arjun**, **Luna**) with high-resolution portraits, display names, taglines, and emotional promises.
- [ ] **Active Selection State:** Tapping a persona card provides immediate visual feedback (outline/glow with `#A78BFA` token), updating selected state without layout shifts.
- [ ] **Detail View Navigation:** Selecting a persona navigates smoothly to the Persona Detail view, showing background context, speaking style descriptors, and suggested icebreaker prompt.
- [ ] **Safety Disclosures:** Prominent notice displayed on all selection views: *"AI-created conversations. Not a real person."*
- [ ] **Touch Target Sizing:** All cards and buttons satisfy minimum 44×44 pt touch targets for one-handed mobile use.

### 1.2 Call Initiation
- [ ] **Single Tap Trigger:** Tapping **Call [Persona Name]** initiates the session setup.
- [ ] **Debouncing / Duplicate Prevention:** Call button immediately enters loading/disabled state to prevent duplicate token or SDP requests.
- [ ] **State Transition:** Interface transitions cleanly from `idle` → `requesting-permission` / `connecting`.
- [ ] **Payload Verification:** Client sends only the allow-listed `personaId` (`"maya" | "arjun" | "luna"`) and client SDP offer to the backend proxy.

### 1.3 Microphone Permission Lifecycle
- [ ] **Permission Pre-Prompt:** User is shown a concise explanation of microphone usage before the native browser dialog is triggered.
- [ ] **Permission Granted (Happy Path):**
  - Native browser permission prompt accepted.
  - Local `MediaStream` (audio track) acquired with echo cancellation and noise suppression enabled.
  - State transitions seamlessly to `connecting` → `connected` / `listening`.
- [ ] **Permission Denied (Recovery Path):**
  - Native browser prompt dismissed or denied.
  - App displays an actionable, non-blocking alert: *"Microphone access is needed to start a call. Enable it in Settings and try again."*
  - WebRTC connection is aborted, temporary resources released, and UI returns cleanly to `idle`.
- [ ] **Hardware Indicator:** Device microphone indicator (e.g., orange dot on iOS / green pill on Android) illuminates when call is active and extinguishes immediately upon call termination.

### 1.4 Remote Audio Output & Quality
- [ ] **Audio Element Attachment:** Remote WebRTC audio track is attached to a dedicated `<audio>` element with `autoplay` and plays without requiring additional user interaction.
- [ ] **iOS Audio Session Unlocking:** Audio playback starts reliably on iOS Safari within the user gesture flow (avoiding browser autoplay policy blocking).
- [ ] **Loudspeaker / Earpiece Routing:** Audio routes clearly through device speaker by default or connected Bluetooth / wired headphones when present.
- [ ] **Acoustic Quality:** Audio is free from clipping, distortion, echo, or robotic artifacts under standard network conditions.

### 1.5 Mute / Unmute Controls
- [ ] **Mute Action:** Tapping the Mute button sets local `MediaStreamTrack.enabled = false` (or sends mute control).
- [ ] **Visual Indicator:** Status badge explicitly indicates **Muted** with high-contrast visual cues.
- [ ] **Input Isolation:** Speaking into the microphone while muted produces zero audio transmission and does not trigger AI turn detection.
- [ ] **Unmute Action:** Tapping Unmute re-enables the audio track immediately; conversational turn-taking resumes without connection reset.

### 1.6 Interruption While AI Speaks (Barge-in / VAD)
- [ ] **Barge-in Trigger:** User speaks naturally while the AI is actively delivering a spoken response.
- [ ] **Latency (<300 ms):** Voice Activity Detection (VAD) detects speech, the OpenAI Realtime session immediately halts playback, and output audio stops within 300 ms.
- [ ] **State Flip:** UI instantly flips from `speaking` → `listening` → `thinking`.
- [ ] **Contextual Continuity:** AI responds coherently to the interrupting thought without repeating previous aborted utterances.

### 1.7 Call Termination
- [ ] **End Call Action:** Tapping the destructive **End Call** button immediately terminates the active call.
- [ ] **Resource Teardown:**
  - Local microphone tracks explicitly stopped (`track.stop()`).
  - WebRTC `RTCPeerConnection` closed and discarded.
  - Data channels and audio elements dismantled.
  - Device microphone indicator turns off within 500 ms.
- [ ] **Ended Screen:** Displays clean closure view (*"Call ended"*), optional local-only session summary, and actions to return to persona selection or start a new call.

### 1.8 Refresh & Navigation Resilience
- [ ] **Browser Refresh (`F5` / Pull-to-Refresh):** Active WebRTC connection and microphone streams are terminated cleanly via `beforeunload` / `unload` / React component cleanup; no zombie tracks or background audio.
- [ ] **Back Navigation:** Swiping back or pressing the browser back button closes the active session and navigates to the previous screen without throwing uncaught exceptions.
- [ ] **Tab Backgrounding:** When user switches tabs or locks the phone, app either maintains clean audio stream or pauses/ends gracefully with clear status upon return.

### 1.9 Network Resilience, Offline Mode, Reconnect & API Failures
- [ ] **Slow Network (3G / Packet Loss):**
  - WebRTC adapts to degraded bandwidth.
  - UI displays `reconnecting` badge if ICE connection state degrades to `disconnected`.
  - Audio resumes automatically when packets recover without crashing the page.
- [ ] **Offline Mode (No Network):**
  - Attempting to call while offline immediately shows: *"You’re offline. Check your connection and try again."*
  - No hanging spinners or unhandled promise rejections.
- [ ] **Call Reconnect Flow:**
  - If WebRTC connection fails, user is provided a clean **Reconnect** button.
  - Reconnect requests a fresh temporary secret and starts a new session; expired secrets are never reused.
- [ ] **Backend API Outage (500 / 502 / 503):**
  - If backend token proxy fails (e.g. OpenAI rate limit or service interruption), UI displays: *"Unable to reach the voice service. Please try again."*
  - Error messages never expose internal stack traces, authorization headers, or environment details.

---

## 2. Security and Privacy Checklist

| Check | Requirement | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **No API Keys in Repo** | Zero `.env`, `.env.local`, or raw API keys committed in git history. | Run `git log -p` and secret scanner on all branches. | `PASSED` |
| **Browser Key Isolation** | Browser never receives, stores, or accesses `OPENAI_API_KEY`. | Inspect client bundle, network requests, and `localStorage`. | `PASSED` |
| **Server-Side Token Proxy** | Backend creates short-lived Realtime sessions via `POST /api/realtime/calls` using server-only credentials. | Verify backend route implementation and proxy headers. | `PASSED` |
| **Persona Allowlist Validation** | Server strictly validates `personaId` against `["maya", "arjun", "luna"]` using schema validation (Zod). Invalid IDs return HTTP 400. | Send test `POST` with `personaId: "unknown"` and verify rejection. | `PASSED` |
| **No Client-Supplied Prompts** | Client cannot inject arbitrary system prompts or override persona instructions. | Verify instructions are loaded strictly from server configuration. | `PASSED` |
| **Clear AI Labeling** | Every persona is explicitly identified as an *"AI-created character"*. | Verify UI cards, detail pages, and call status headers. | `PASSED` |
| **No Real-Person / Voice Clone Claims** | No claims of living-person voice replication or deepfake synthesis. | Audit UI copy, README, and product statements. | `PASSED` |
| **Safety Boundaries** | System instructions forbid medical, psychiatric, or emergency advice and redirect urgent distress to professional hotlines. | Review persona system instruction configurations. | `PASSED` |
| **Zero Audio Retention** | Voice audio streams directly through ephemeral WebRTC; Echo stores no recordings or server transcripts. | Verify server logs and database absence. | `PASSED` |

---

## 3. 90-Second Live Demo Script & Playbook

### Demo Strategy
- **Total Duration:** Exactly 90 seconds.
- **Selected Persona:** **Maya** (*Warm, grounded, reflective*).
- **Core Narrative:** *“Text chat gives you answers. Echo gives you a moment of presence. Pick a character, call them, and speak naturally. The technology disappears; the conversation is what remains.”*

```
Timeline:
[0:00 - 0:15] Hook & Persona Selection
[0:15 - 0:35] Turn 1: Emotional Icebreaker (Presence & Tone)
[0:35 - 0:55] Turn 2: Conversational Depth & Grounding Advice
[0:55 - 1:15] Turn 3: Real-Time Interruption (Barge-in Demo)
[1:15 - 1:30] Call Teardown & Value Summary
```

---

### Step-by-Step Script

#### Phase 1: Opening Hook & Call Start (0:00 – 0:15)
- **Presenter Spoken Opening Line:**
  > *"Text chat gives you answers. Echo gives you a moment of presence. Watch what happens when AI stops feeling like software and starts feeling like a real, grounded conversation."*
- **Action:**
  1. Hold phone to display the mobile UI.
  2. Tap **Maya**'s persona card.
  3. Tap **Call Maya**.
  4. Point to the UI transitioning through `connecting` → `listening` with animated ambient halo.

---

#### Phase 2: Spoken Prompt 1 — Emotional Icebreaker (0:15 – 0:35)
- **Presenter Spoken Prompt 1:**
  > *"Hey Maya, I’ve had an overwhelming week building this project, and my head won’t stop racing. Where do I even begin?"*
- **Expected AI Response (Maya):**
  > *"Take a slow breath with me first. You don't have to solve the whole week right this second. What’s the one thought that’s loudest in your mind right now?"*
- **Expected Emotional Payoff:**
  - Instant response with sub-second speech latency.
  - Warm, soothing vocal cadence that feels immediately human and calming.

---

#### Phase 3: Spoken Prompt 2 — Conversational Depth (0:35 – 0:55)
- **Presenter Spoken Prompt 2:**
  > *"I feel like there are ten different things pulling my attention at once, and I'm terrified of dropping the ball on all of them."*
- **Expected AI Response (Maya):**
  > *"When everything feels urgent, nothing has room to breathe. Pick just one thing that truly matters today. The other nine can wait until you’ve got solid ground under your feet..."*
- **Expected Emotional Payoff:**
  - Shows emotional intelligence, context retention, and practical grounding rather than generic chatbot bullet points.

---

#### Phase 4: Spoken Prompt 3 — Real-Time Interruption / Barge-in (0:55 – 1:15)
- **Action:** While Maya is speaking her second sentence above, the presenter naturally interrupts her mid-sentence:
- **Presenter Spoken Prompt 3 (Interruption):**
  > *"Wait, Maya—actually, before that, what’s the one question I should ask myself right now?"*
- **System Behavior:**
  - AI immediately cuts off speech within 300 ms.
  - Status flips from `speaking` → `listening` → `thinking`.
- **Expected AI Response (Maya):**
  > *"Ask yourself: 'If I only got one thing done before sunset today, what would make me exhale?' Start right there."*
- **Expected Emotional Payoff:**
  - Proves true real-time duplex WebRTC capability.
  - Demonstrates conversational fluidness and instant barge-in without lag or awkward pauses.

---

#### Phase 5: Closing & Teardown (1:15 – 1:30)
- **Action:**
  1. Tap **End Call**.
  2. Microphone indicator turns off immediately.
  3. Screen shows clean closure state (*"Call ended"*).
- **Presenter Closing Line:**
  > *"Echo turns conversational AI from a productivity utility into an intimate, supportive presence. Thank you."*

---

### Contingency & Fallback Strategy

| Scenario | Trigger | Immediate Action |
| :--- | :--- | :--- |
| **Level 1: Audio Stall / Glitch** | Remote audio stutters or stops. | Tap **Mute** then **Unmute** once; if unresolved, tap **End Call** and tap **Call Maya** again (instant session refresh). |
| **Level 2: Persona Service Latency** | OpenAI Realtime response takes > 3 seconds. | Say: *"Let's switch to Arjun for a quick, direct check-in."* Tap End Call → Select **Arjun** → Start call. |
| **Level 3: Complete Network / API Outage** | Venue Wi-Fi drops or OpenAI service fails. | **Seamless Pivot:** *"Let's switch over to our live device capture recorded directly on this build earlier today."* Play the backup 1080p 60fps video walkthrough while continuing live narration. |

---

## 4. P0 Defect Template & Triage Protocol

### Defect Severity Definitions
- **P0 (Demo Blocker / Blocker):** Call fails to connect, microphone crashes, WebRTC audio missing, app crashes, secret key exposure, or persona safety breach.
- **P1 (Critical):** Interruption lag > 1000 ms, audio clipping, incorrect state badge, mute control unresponsive.
- **P2 (Major):** Minor layout shifts, transcript formatting issues, non-blocking visual glitches.
- **P3 (Minor):** Copy polish, minor animation stutter.

---

### Component Ownership Routing

```
┌──────────────────────────────────────────────────────────────┐
│                    PROJECT ECHO TRIAGE                       │
├───────────────────┬───────────────────┬──────────────────────┤
│     EMERGENT      │     OPENCODE      │        CODEX         │
│   (Frontend UI)   │ (WebRTC/Realtime) │   (Backend Proxy)    │
├───────────────────┼───────────────────┼──────────────────────┤
│ • Layout & Themes │ • WebRTC Session  │ • Express Server     │
│ • Persona Cards   │ • Mic Stream/VAD  │ • /calls Proxy Route │
│ • Touch Targets   │ • Audio Playback  │ • Persona Config     │
│ • Status Badges   │ • Interruption    │ • Secret Isolation   │
│ • End Call Screen │ • State Machine   │ • Rate Limiting      │
└───────────────────┴───────────────────┴──────────────────────┘
```

---

### P0 Bug Report Template

```markdown
### [P0] <Short Descriptive Title>

- **Severity:** P0 - Blocker
- **Owner:** Emergent / OpenCode / Codex
- **Subsystem:** UI / WebRTC Realtime / Backend API
- **Device & Environment:** iPhone 15 Pro (iOS 17.4 Safari) / Pixel 8 (Android 14 Chrome) / Backend Node v24
- **Date & Time:** 2026-08-30 [Time]

#### Description
<Clear 1-2 sentence description of the critical defect.>

#### Steps to Reproduce
1. Navigate to home screen.
2. Select persona `<Persona Name>`.
3. Tap **Call <Persona Name>**.
4. Observe `<Action / Failure Point>`.

#### Expected Behavior
<What should happen according to specification.>

#### Actual Behavior
<What actually happens, including error messages, blank states, or audio silence.>

#### Console / Log Output
\`\`\`text
[Paste browser console or server log snippet here]
\`\`\`

#### Impact on 90-Second Demo
<Why this blocks the live presentation.>

#### Proposed Fix / Workaround
<Immediate mitigation or required code patch.>
```

---

### Example P0 Defects

#### Example 1: Assigned to OpenCode
```markdown
### [P0] Remote WebRTC audio track does not play automatically on iOS Safari

- **Severity:** P0 - Blocker
- **Owner:** OpenCode
- **Subsystem:** WebRTC Realtime / Audio Engine
- **Device & Environment:** iPhone 14 Pro, iOS 17.5, Mobile Safari

#### Description
When a call connects on iOS Safari, state transitions to 'connected' and 'speaking', but no remote voice audio is audible through the speaker.

#### Steps to Reproduce
1. Open web client on iOS Safari.
2. Select Maya and tap 'Call Maya'.
3. Allow microphone permission.
4. Speak prompt: "Hello Maya".
5. Wait for AI response state.

#### Expected Behavior
Maya's voice plays audibly through the device loudspeaker.

#### Actual Behavior
UI shows 'speaking' state, but audio is silent due to unprimed HTMLMediaElement in Safari autoplay policy.

#### Fix
OpenCode to ensure `<audio>` element is created and `.play()` is invoked within the synchronous user-tap gesture handler before WebRTC negotiation.
```

#### Example 2: Assigned to Codex
```markdown
### [P0] Backend returns 502 when OpenAI Realtime model environment variable is unset

- **Severity:** P0 - Blocker
- **Owner:** Codex
- **Subsystem:** Backend API
- **Device & Environment:** Node.js Express server on Linux / Windows

#### Description
`/api/realtime/calls` route returns HTTP 502 Bad Gateway if `OPENAI_REALTIME_MODEL` is missing from the environment.

#### Steps to Reproduce
1. Start server with only `OPENAI_API_KEY` set.
2. Trigger call initiation from web client.
3. Server throws model resolution error.

#### Expected Behavior
Server defaults gracefully to `"gpt-realtime"` if `OPENAI_REALTIME_MODEL` is not explicitly provided.

#### Actual Behavior
Server returns 502: "Unable to start the voice call."

#### Fix
Codex to set default fallback: `const model = process.env.OPENAI_REALTIME_MODEL ?? "gpt-realtime";`.
```

#### Example 3: Assigned to Emergent
```markdown
### [P0] Call screen End Call button clipped below screen fold on iPhone SE

- **Severity:** P0 - Blocker
- **Owner:** Emergent
- **Subsystem:** Frontend UI
- **Device & Environment:** iPhone SE (375x667), Mobile Safari

#### Description
On compact viewport devices (375px height constraints), the End Call button renders below the bottom safe area fold, preventing the user from ending the call.

#### Steps to Reproduce
1. Open app on 375x667 viewport.
2. Start call with Arjun.
3. Attempt to reach the End Call button.

#### Expected Behavior
End Call button remains fixed and accessible within the 100dvh safe area bounds.

#### Actual Behavior
Button requires scrolling down and is partially obscured by Safari address bar.

#### Fix
Emergent to apply `h-[100dvh]` with `pb-safe` flex layout to ensure call controls remain in view.
```

---

## 5. Final Submission Checklist

**Submission Deadline:** Today at 4:30 PM  
**Target Completion Buffer:** 4:00 PM (30-minute safety buffer)

### 5.1 Public Repository & Code Cleanliness
- [ ] **Repository Visibility:** GitHub repository is set to **Public** (`https://github.com/dwivedi-mohit/8x-hackathon.git`).
- [ ] **Branch Verification:** All feature branches (`feature/codex-backend`, `feature/opencode-realtime`, `feature/emergent-web-ui`, `feature/antigravity-qa`) pushed and merged cleanly to `main` without merge conflicts.
- [ ] **No Secrets in History:** Confirmed zero `.env` or API credentials exist in git tree or commit history.
- [ ] **Clean Workspace:** No stray `.log`, `.tmp`, or scratch files tracked.

### 5.2 Build & Code Quality Verification
- [ ] **Server Build:** `npm run build` (or `tsc --noEmit`) in `server/` succeeds with `0` errors.
- [ ] **Web Typecheck:** `npm run typecheck` in `web/` passes with `0` type errors.
- [ ] **Web Unit Tests:** `npm run test` in `web/` executes all test suites (`state-transitions.test.ts`) with 100% passing results.
- [ ] **Zero Browser Console Errors:** Full call lifecycle runs with clean console (no uncaught exceptions, WebRTC warnings, or React hydration errors).

### 5.3 Mobile-First Browser Verification
- [ ] **Responsive Design Checked:** Tested across 375px (iPhone SE), 393px (iPhone 15), and 412px (Pixel 8) screen widths.
- [ ] **Touch Target Verification:** All interactive buttons and cards have at least 44×44 pt touch areas.
- [ ] **Dynamic Viewport Height (`100dvh`):** Safe-area insets and bottom browser navigation bars handled cleanly without content clipping.
- [ ] **Reduced Motion Support:** Interface functions properly with OS reduced-motion preferences enabled.

### 5.4 Live Deployment & Media Backup
- [ ] **Production Deployment Live:** Live web client and backend proxy deployed and reachable over HTTPS.
- [ ] **Verified End-to-End Call:** Successfully completed a 3-turn voice conversation on the live production URL from a mobile phone.
- [ ] **Backup Video Recording (1080p 60fps):** Complete 90-second demo run recorded on physical mobile device, edited with clear audio, and uploaded to accessible cloud storage / YouTube unlisted link.
- [ ] **README Overview:** Root and package READMEs explain architecture, setup steps, persona profiles, and demo flow.

### 5.5 Submission Timeline Milestones
- [ ] **2:30 PM (T - 120m):** Feature Freeze — all code changes finalized.
- [ ] **3:30 PM (T - 60m):** End-to-end rehearsal on live deployment and backup recording captured.
- [ ] **4:00 PM (T - 30m):** Final submission form populated with repository URL, demo link, and video backup.
- [ ] **4:30 PM (T - 0m):** Official hackathon submission submitted ahead of the deadline.
