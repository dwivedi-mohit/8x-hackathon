import React from "react";
import { tokens } from "../styles/tokens.js";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "peach";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (size) {
      case "sm":
        return "8px 14px";
      case "lg":
        return "16px 24px";
      case "md":
      default:
        return "12px 20px";
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return tokens.typography.bodySmall.fontSize;
      case "lg":
        return tokens.typography.subheading.fontSize;
      case "md":
      default:
        return tokens.typography.bodyRegular.fontSize;
    }
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "destructive":
        return {
          backgroundColor: tokens.colors.destructive,
          color: tokens.colors.textInverse,
          border: `1px solid ${tokens.colors.destructive}`,
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
        };
      case "peach":
        return {
          backgroundColor: tokens.colors.peachWarm,
          color: tokens.colors.textInverse,
          border: `1px solid ${tokens.colors.peachPrimary}`,
          boxShadow: "0 4px 12px rgba(244, 162, 97, 0.25)",
        };
      case "secondary":
        return {
          backgroundColor: tokens.colors.surfaceRaised,
          color: tokens.colors.textPrimary,
          border: `1px solid ${tokens.colors.border}`,
          boxShadow: tokens.shadows.subtle,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: tokens.colors.lavenderPrimary,
          border: `1.5px solid ${tokens.colors.lavenderLight}`,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: tokens.colors.textSecondary,
          border: "1px solid transparent",
        };
      case "primary":
      default:
        return {
          backgroundColor: tokens.colors.lavenderPrimary,
          color: tokens.colors.textInverse,
          border: `1px solid ${tokens.colors.lavenderPrimary}`,
          boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
        };
    }
  };

  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: tokens.spacing.sm,
        minHeight: tokens.dimensions.minTouchTarget,
        padding: getPadding(),
        fontSize: getFontSize(),
        fontWeight: 600,
        borderRadius: tokens.radii.lg,
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.18s ease-in-out",
        userSelect: "none",
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {leftIcon && <span style={{ display: "inline-flex" }}>{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span style={{ display: "inline-flex" }}>{rightIcon}</span>}
    </button>
  );
};
