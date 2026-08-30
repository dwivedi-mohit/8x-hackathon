import React from "react";
import { tokens } from "../styles/tokens.js";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = "Echo",
  subtitle,
  onBack,
  showBack = false,
  rightAction,
}) => {
  return (
    <header
      style={{
        padding: `${tokens.spacing.lg} ${tokens.spacing.xl} ${tokens.spacing.md}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${tokens.colors.borderSubtle}`,
        backgroundColor: tokens.colors.surface,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}>
        {showBack && onBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            style={{
              minWidth: tokens.dimensions.minTouchTarget,
              minHeight: tokens.dimensions.minTouchTarget,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: tokens.radii.full,
              backgroundColor: tokens.colors.canvasMuted,
              color: tokens.colors.textPrimary,
              border: `1px solid ${tokens.colors.border}`,
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            ←
          </button>
        )}
        <div>
          <h1
            style={{
              fontSize: showBack ? tokens.typography.headingMedium.fontSize : tokens.typography.headingLarge.fontSize,
              fontWeight: 700,
              color: tokens.colors.textPrimary,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {!showBack && (
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: tokens.colors.lavenderPrimary,
                  display: "inline-block",
                  boxShadow: `0 0 10px ${tokens.colors.lavenderLight}`,
                }}
              />
            )}
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: tokens.typography.caption.fontSize,
                color: tokens.colors.textSecondary,
                marginTop: "2px",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && <div>{rightAction}</div>}
    </header>
  );
};
