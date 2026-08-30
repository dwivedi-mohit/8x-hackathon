import React from "react";
import type { PersonaId } from "../../types/call.js";
import { AppHeader } from "../../components/AppHeader.js";
import { PersonaAvatar } from "../../components/PersonaAvatar.js";
import { getPersonaById } from "../persona/personasData.js";
import { tokens } from "../../styles/tokens.js";

type CallHistoryScreenProps = {
  lastCall?: { personaId: PersonaId; durationSeconds: number };
};

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds < 60) return "Less than a minute";
  return `${Math.floor(totalSeconds / 60)} min`;
};

export const CallHistoryScreen: React.FC<CallHistoryScreenProps> = ({ lastCall }) => {
  const persona = lastCall ? getPersonaById(lastCall.personaId) : null;

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <AppHeader title="Call history" />
      <section style={{ padding: `${tokens.spacing.xxl} ${tokens.spacing.xl}`, flex: 1 }}>
        <p style={{ margin: "0 0 20px", color: tokens.colors.textSecondary, fontSize: tokens.typography.bodyRegular.fontSize, lineHeight: tokens.typography.bodyRegular.lineHeight }}>
          Your recent moments of connection stay private to this device.
        </p>

        {persona && lastCall ? (
          <article style={{ display: "flex", gap: tokens.spacing.md, alignItems: "center", padding: tokens.spacing.lg, borderRadius: tokens.radii.card, background: "rgba(255,255,255,0.42)", border: `1px solid ${tokens.colors.border}`, boxShadow: tokens.shadows.card, backdropFilter: "blur(18px) saturate(145%)", WebkitBackdropFilter: "blur(18px) saturate(145%)" }}>
            <PersonaAvatar persona={persona} size="sm" />
            <div>
              <p style={{ margin: 0, color: tokens.colors.textPrimary, fontWeight: 700 }}>{persona.name}</p>
              <p style={{ margin: "4px 0 0", color: tokens.colors.textSecondary, fontSize: tokens.typography.bodySmall.fontSize }}>
                Just now · {formatDuration(lastCall.durationSeconds)}
              </p>
            </div>
          </article>
        ) : (
          <div style={{ padding: "36px 20px", borderRadius: tokens.radii.card, background: "rgba(255,255,255,0.36)", border: `1px solid ${tokens.colors.border}`, textAlign: "center", backdropFilter: "blur(18px) saturate(145%)", WebkitBackdropFilter: "blur(18px) saturate(145%)" }}>
            <div style={{ color: tokens.colors.lavenderPrimary, fontSize: "30px", lineHeight: 1 }}>◷</div>
            <h2 style={{ margin: "12px 0 8px", color: tokens.colors.textPrimary, fontSize: tokens.typography.headingMedium.fontSize }}>No calls yet</h2>
            <p style={{ margin: 0, color: tokens.colors.textSecondary, fontSize: tokens.typography.bodySmall.fontSize, lineHeight: tokens.typography.bodySmall.lineHeight }}>When you finish a conversation, its duration will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
};
