# Echo Web UI Layer

A light-theme, mobile-first responsive web client for **Project Echo**.

## Architecture & Features

- **Warm Light Aesthetic**: Off-white canvas (`#FAF8F5`) paired with soft lavender (`#7C3AED` / `#A78BFA`) and warm peach (`#F4A261`) accents.
- **390 × 844 Mobile-First Frame**: Optimized for one-handed mobile use with touch targets ≥ 44×44 pt.
- **5 Core Screens**:
  1. **Home / Persona Selection**: Browse Maya, Arjun, and Luna with distinct traits and icebreaker previews.
  2. **Persona Detail**: Rich character profiles, voice cadence notes, and one-tap call initiation.
  3. **Live Call Screen**: Interactive voice call interface with status pill, ambient visualizer, audio duration timer, mute control, and end call button. Includes mock state simulator for rapid QA.
  4. **Ended Call Screen**: Session closure summary, duration indicator, privacy disclosure, and quick-retry options.
  5. **Create Persona Placeholder**: Character design form with upload dropzone and mandatory fictional-character consent acknowledgment.
- **Shared Integration Interface (`CallUiProps`)**: Ready for seamless connection to OpenCode's real WebRTC engine (`useRealtimeCall`).
- **Accessibility & Motion**: WCAG AAA text contrast, keyboard focus indicators, and `@media (prefers-reduced-motion: reduce)` support.

## Scripts

- `npm run typecheck`: Run TypeScript type verification.
- `npm run test`: Run Vitest unit tests.
