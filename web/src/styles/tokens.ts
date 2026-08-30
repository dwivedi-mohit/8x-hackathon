/**
 * Project Echo — Design Tokens
 * Light warm off-white theme with soft lavender and peach accents.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces (Warm Light Off-White)
    canvas: "#FAF8F5",
    canvasMuted: "#F3EFEA",
    surface: "#FFFFFF",
    surfaceRaised: "#FCFAF7",
    surfaceHover: "#F7F3EE",
    surfaceSubtle: "#F4EFEB",
    surfaceLavenderTint: "#F4F0FD",
    surfacePeachTint: "#FFF5ED",

    // Borders & Dividers
    border: "#EBE5DC",
    borderSubtle: "#F0ECE6",
    borderStrong: "#D8D0C5",
    borderLavender: "#DDD6FE",
    borderPeach: "#FED7AA",

    // Typography
    textPrimary: "#1F1D2B",
    textSecondary: "#5F5B73",
    textTertiary: "#8C88A0",
    textInverse: "#FFFFFF",

    // Primary Accents (Lavender / Violet)
    lavenderPrimary: "#7C3AED",
    lavenderHover: "#6D28D9",
    lavenderLight: "#A78BFA",
    lavenderSoft: "#DDD6FE",
    lavenderSubtle: "#EDE9FE",

    // Secondary Accents (Peach / Amber Warmth)
    peachPrimary: "#F97316",
    peachHover: "#EA580C",
    peachWarm: "#F4A261",
    peachLight: "#FED7AA",
    peachSubtle: "#FFEDD5",

    // Status Colors
    statusConnecting: "#D97706",
    statusConnectingBg: "#FEF3C7",
    statusListening: "#7C3AED",
    statusListeningBg: "#EDE9FE",
    statusThinking: "#D97706",
    statusThinkingBg: "#FEF3C7",
    statusSpeaking: "#059669",
    statusSpeakingBg: "#D1FAE5",
    statusReconnecting: "#EA580C",
    statusReconnectingBg: "#FFEDD5",
    statusError: "#DC2626",
    statusErrorBg: "#FEE2E2",
    statusEnded: "#4B5563",
    statusEndedBg: "#F3F4F6",

    // Destructive
    destructive: "#EF4444",
    destructiveHover: "#DC2626",
    destructiveBg: "#FEE2E2",
  },

  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: {
      fontSize: "30px",
      lineHeight: "36px",
      fontWeight: "700",
      letterSpacing: "-0.02em",
    },
    headingLarge: {
      fontSize: "24px",
      lineHeight: "30px",
      fontWeight: "700",
      letterSpacing: "-0.015em",
    },
    headingMedium: {
      fontSize: "20px",
      lineHeight: "26px",
      fontWeight: "600",
      letterSpacing: "-0.01em",
    },
    subheading: {
      fontSize: "17px",
      lineHeight: "23px",
      fontWeight: "600",
    },
    bodyLarge: {
      fontSize: "16px",
      lineHeight: "24px",
      fontWeight: "400",
    },
    bodyRegular: {
      fontSize: "15px",
      lineHeight: "22px",
      fontWeight: "400",
    },
    bodySmall: {
      fontSize: "13px",
      lineHeight: "18px",
      fontWeight: "400",
    },
    caption: {
      fontSize: "12px",
      lineHeight: "16px",
      fontWeight: "500",
      letterSpacing: "0.01em",
    },
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    xxl: "24px",
    xxxl: "32px",
    huge: "48px",
  },

  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    card: "24px",
    full: "9999px",
  },

  shadows: {
    subtle: "0 1px 3px rgba(31, 29, 43, 0.04), 0 1px 2px rgba(31, 29, 43, 0.02)",
    card: "0 4px 16px rgba(31, 29, 43, 0.05), 0 1px 4px rgba(31, 29, 43, 0.03)",
    cardHover: "0 8px 24px rgba(124, 58, 237, 0.08), 0 2px 6px rgba(31, 29, 43, 0.04)",
    elevated: "0 12px 32px rgba(31, 29, 43, 0.08), 0 4px 12px rgba(31, 29, 43, 0.04)",
    glowLavender: "0 0 32px rgba(167, 139, 250, 0.35)",
    glowPeach: "0 0 32px rgba(244, 162, 97, 0.35)",
    glowGreen: "0 0 28px rgba(16, 185, 129, 0.3)",
  },

  dimensions: {
    mobileWidth: "390px",
    mobileHeight: "844px",
    minTouchTarget: "44px",
  },
} as const;
