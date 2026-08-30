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
        return "8px 16px";
      case "lg":
        return "16px 28px";
      case "md":
      default:
        return "12px 22px";
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
          background: "linear-gradient(135deg, #F4A261 0%, #E76F51 100%)",
          color: tokens.colors.textInverse,
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 6px 18px rgba(244, 162, 97, 0.35)",
        };
      case "secondary":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          color: tokens.colors.textPrimary,
          border: "1px solid rgba(31, 29, 43, 0.1)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
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
          background: "linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #F97316 100%)",
          color: tokens.colors.textInverse,
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 8px 24px rgba(124, 58, 237, 0.32), inset 0 1px 2px rgba(255, 255, 255, 0.35)",
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
        borderRadius: "24px",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        userSelect: "none",
        backdropFilter: "blur(18px) saturate(150%)",
        WebkitBackdropFilter: "blur(18px) saturate(150%)",
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
