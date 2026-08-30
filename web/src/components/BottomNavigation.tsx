import React from "react";
import { tokens } from "../styles/tokens.js";

type NavigationItem = "create" | "home" | "history";

type BottomNavigationProps = {
  active: NavigationItem;
  onHome: () => void;
  onCreate: () => void;
  onHistory: () => void;
};

const HomeIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
    <path d="M9 21v-6h6v6" />
  </svg>
);

const HistoryIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

const SparkIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" />
    <path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6L19 16Z" />
  </svg>
);

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ active, onHome, onCreate, onHistory }) => {
  const itemStyle = (item: NavigationItem): React.CSSProperties => ({
    minWidth: tokens.dimensions.minTouchTarget,
    minHeight: "52px",
    border: 0,
    background: "transparent",
    color: active === item ? tokens.colors.lavenderPrimary : tokens.colors.textTertiary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    fontSize: "11px",
    fontWeight: active === item ? 700 : 600,
    cursor: "pointer",
    padding: "0 14px",
  });

  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: "fixed",
        width: "min(calc(100vw - 32px), 358px)",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "max(12px, env(safe-area-inset-bottom))",
        minHeight: "70px",
        borderRadius: "28px",
        backgroundColor: "rgba(255, 255, 255, 0.48)",
        border: "1px solid rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(24px) saturate(160%)",
        WebkitBackdropFilter: "blur(24px) saturate(160%)",
        boxShadow: tokens.shadows.elevated,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "8px 12px",
        zIndex: 10,
      }}
    >
      <button
        type="button"
        aria-current={active === "create" ? "page" : undefined}
        aria-label="Create a persona"
        onClick={onCreate}
        style={itemStyle("create")}
      >
        <SparkIcon />
        <span>Create</span>
      </button>

      <button type="button" aria-current={active === "home" ? "page" : undefined} aria-label="Home" onClick={onHome} style={itemStyle("home")}>
        <HomeIcon />
        <span>Home</span>
      </button>

      <button type="button" aria-current={active === "history" ? "page" : undefined} aria-label="Call history" onClick={onHistory} style={itemStyle("history")}>
        <HistoryIcon />
        <span>History</span>
      </button>
    </nav>
  );
};
