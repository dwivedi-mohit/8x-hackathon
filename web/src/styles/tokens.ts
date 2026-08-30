/**
 * Project Echo — Design Tokens
 * Light warm off-white theme with soft lavender and peach accents.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces (Warm Light Off-White)
    canvas: "rgba(255, 251, 248, 0.20)",
    canvasMuted: "rgba(255, 255, 255, 0.34)",
    surface: "rgba(255, 255, 255, 0.42)",
    surfaceRaised: "rgba(255, 255, 255, 0.50)",
    surfaceHover: "rgba(255, 255, 255, 0.58)",
    surfaceSubtle: "rgba(255, 255, 255, 0.28)",
    surfaceLavenderTint: "rgba(238, 229, 255, 0.42)",
    surfacePeachTint: "rgba(255, 239, 225, 0.44)",

    // Borders & Dividers
    border: "rgba(255, 255, 255, 0.68)",
    borderSubtle: "rgba(255, 255, 255, 0.46)",
    borderStrong: "rgba(201, 185, 219, 0.56)",
    borderLavender: "rgba(221, 214, 254, 0.74)",
    borderPeach: "rgba(254, 215, 170, 0.76)",

    // Typography
    textPrimary: "#1F1D2B",
    textSecondary: "#5F5B73",
    textTertiary: "#8C88A0",
    textInverse: "#FFFFFF",

    // Primary Accents (Lavender / Violet)
    lavenderPrimary: "rgba(100, 65, 211, 0.80)",
    lavenderHover: "rgba(86, 49, 190, 0.88)",
    lavenderLight: "#A78BFA",
    lavenderSoft: "#DDD6FE",
    lavenderSubtle: "#EDE9FE",

    // Secondary Accents (Peach / Amber Warmth)
    peachPrimary: "rgba(224, 103, 43, 0.82)",
    peachHover: "rgba(205, 79, 25, 0.90)",
    peachWarm: "rgba(236, 137, 82, 0.74)",
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
    destructive: "rgba(218, 61, 72, 0.80)",
    destructiveHover: "rgba(201, 43, 54, 0.90)",
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
    subtle: "0 3px 12px rgba(91, 74, 117, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
    card: "0 10px 28px rgba(104, 79, 135, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.65)",
    cardHover: "0 14px 34px rgba(124, 58, 237, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.70)",
    elevated: "0 16px 40px rgba(104, 79, 135, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.70)",
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
