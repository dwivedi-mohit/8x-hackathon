import React, { useState } from "react";
import { AppHeader } from "../../components/AppHeader.js";
import { SafetyDisclosure } from "../../components/SafetyDisclosure.js";
import { Button } from "../../components/Button.js";
import { tokens } from "../../styles/tokens.js";

type CreatePersonaScreenProps = {
  onBack: () => void;
  onCreated?: () => void;
};

export const CreatePersonaScreen: React.FC<CreatePersonaScreenProps> = ({
  onBack,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("Gentle & Calming");
  const [description, setDescription] = useState("");
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentAcknowledged || !name.trim()) return;

    setIsCreatedSuccess(true);
    setTimeout(() => {
      onCreated?.();
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", flex: 1 }}>
      <AppHeader
        title="Create Persona"
        showBack
        onBack={onBack}
        rightAction={<SafetyDisclosure compact text="Fictional Only" />}
      />

      <form
        onSubmit={handleCreate}
        style={{
          padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.lg,
          flex: 1,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: tokens.typography.headingMedium.fontSize,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
            }}
          >
            Design a custom character
          </h2>
          <p
            style={{
              fontSize: tokens.typography.bodySmall.fontSize,
              color: tokens.colors.textSecondary,
              marginTop: "2px",
            }}
          >
            Create a unique fictional AI companion with a distinct personality.
          </p>
        </div>

        {/* Photo Upload Placeholder Dropzone */}
        <div
          style={{
            border: `2px dashed ${tokens.colors.borderLavender}`,
            borderRadius: tokens.radii.card,
            padding: `${tokens.spacing.lg} ${tokens.spacing.md}`,
            textAlign: "center",
            backgroundColor: tokens.colors.surfaceLavenderTint,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: tokens.colors.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              boxShadow: tokens.shadows.subtle,
            }}
          >
            🎨
          </div>
          <div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: tokens.colors.lavenderPrimary }}>
              Upload a fictional portrait
            </span>
            <p style={{ fontSize: "11px", color: tokens.colors.textTertiary, marginTop: "2px" }}>
              PNG or JPG (AI-generated or illustrated avatar)
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.md }}>
          <div>
            <label
              htmlFor="persona-name"
              style={{
                display: "block",
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textSecondary,
                marginBottom: "4px",
              }}
            >
              Character Name *
            </label>
            <input
              id="persona-name"
              type="text"
              required
              placeholder="e.g. Robin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: tokens.radii.md,
                border: `1.5px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.bodyRegular.fontSize,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="persona-tagline"
              style={{
                display: "block",
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textSecondary,
                marginBottom: "4px",
              }}
            >
              One-Line Promise / Tagline
            </label>
            <input
              id="persona-tagline"
              type="text"
              placeholder="e.g. An adventurous creative partner"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: tokens.radii.md,
                border: `1.5px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.bodyRegular.fontSize,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.textPrimary,
              }}
            />
          </div>

          <div>
            <label
              htmlFor="persona-voice"
              style={{
                display: "block",
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textSecondary,
                marginBottom: "4px",
              }}
            >
              Voice Tone & Cadence
            </label>
            <select
              id="persona-voice"
              value={voiceStyle}
              onChange={(e) => setVoiceStyle(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: tokens.radii.md,
                border: `1.5px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.bodyRegular.fontSize,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.textPrimary,
              }}
            >
              <option value="Gentle & Calming">Gentle & Calming (Maya-like)</option>
              <option value="Direct & Practical">Direct & Practical (Arjun-like)</option>
              <option value="Poetic & Hopeful">Poetic & Hopeful (Luna-like)</option>
              <option value="Energetic & Inquisitive">Energetic & Inquisitive</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="persona-desc"
              style={{
                display: "block",
                fontSize: tokens.typography.caption.fontSize,
                fontWeight: 700,
                color: tokens.colors.textSecondary,
                marginBottom: "4px",
              }}
            >
              Personality & Background
            </label>
            <textarea
              id="persona-desc"
              rows={3}
              placeholder="Describe how this character thinks, speaks, and responds…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: tokens.radii.md,
                border: `1.5px solid ${tokens.colors.border}`,
                fontSize: tokens.typography.bodyRegular.fontSize,
                backgroundColor: tokens.colors.surface,
                color: tokens.colors.textPrimary,
                resize: "vertical",
              }}
            />
          </div>
        </div>

        {/* Mandatory Safety Notice Checkbox */}
        <div
          style={{
            backgroundColor: tokens.colors.surfacePeachTint,
            border: `1px solid ${tokens.colors.borderPeach}`,
            borderRadius: tokens.radii.md,
            padding: tokens.spacing.md,
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
          }}
        >
          <input
            id="safety-consent"
            type="checkbox"
            checked={consentAcknowledged}
            onChange={(e) => setConsentAcknowledged(e.target.checked)}
            style={{
              marginTop: "3px",
              width: "18px",
              height: "18px",
              accentColor: tokens.colors.lavenderPrimary,
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="safety-consent"
            style={{
              fontSize: "12px",
              lineHeight: "18px",
              color: tokens.colors.textSecondary,
              cursor: "pointer",
            }}
          >
            <strong>Fictional Character Consent:</strong> I confirm this is an AI-generated fictional persona. Project Echo strictly prohibits impersonation or voice cloning of real living people.
          </label>
        </div>

        {/* Submit / Action Button */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: tokens.spacing.sm }}>
          <Button
            type="submit"
            size="lg"
            variant="primary"
            fullWidth
            disabled={!consentAcknowledged || !name.trim()}
          >
            {isCreatedSuccess ? "✓ Profile Created!" : "Preview Character Profile"}
          </Button>

          <Button
            type="button"
            size="md"
            variant="ghost"
            fullWidth
            onClick={onBack}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
