import React from "react";
import navHomeImg from "../assets/nav/nav_home.jpg";
import navCallImg from "../assets/nav/nav_call.jpg";
import { tokens } from "../styles/tokens.js";

type NavigationItem = "create" | "home" | "history";

type BottomNavigationProps = {
  active: NavigationItem;
  onHome: () => void;
  onCreate: () => void;
  onHistory: () => void;
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  active,
  onHome,
  onCreate,
  onHistory,
}) => {
  return (
    <nav
      aria-label="Primary navigation"
      style={{
        position: "fixed",
        width: "min(calc(100vw - 32px), 360px)",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "max(12px, env(safe-area-inset-bottom))",
        height: "64px",
        borderRadius: "32px",
        backgroundColor: "rgba(255, 255, 255, 0.24)",
        border: "1px solid rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        boxShadow: "0 16px 36px rgba(100, 65, 211, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 999,
      }}
    >
      {/* 1. Create (+ Icon only, no background, no text) */}
      <button
        type="button"
        aria-label="Create persona"
        aria-current={active === "create" ? "page" : undefined}
        onClick={onCreate}
        style={{
          width: "48px",
          height: "48px",
          border: 0,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: active === "create" ? tokens.colors.lavenderPrimary : "rgba(31, 29, 43, 0.45)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: active === "create" ? "scale(1.15)" : "scale(1)",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active === "create" ? "2.6" : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* 2. Home (Elevated Higher Up & Bigger 3D Cottage Icon) */}
      <button
        type="button"
        aria-label="Home"
        aria-current={active === "home" ? "page" : undefined}
        onClick={onHome}
        style={{
          width: "60px",
          height: "60px",
          marginTop: "-26px",
          border: "4px solid rgba(255, 255, 255, 0.9)",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow: active === "home"
            ? "0 10px 24px rgba(100, 65, 211, 0.35), 0 2px 8px rgba(0, 0, 0, 0.08)"
            : "0 6px 16px rgba(0, 0, 0, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          overflow: "hidden",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: active === "home" ? "scale(1.08)" : "scale(1)",
          padding: 0,
        }}
      >
        <img
          src={navHomeImg}
          alt="Home"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </button>

      {/* 3. History / Call Icon (3D Call Handset image) */}
      <button
        type="button"
        aria-label="Call history"
        aria-current={active === "history" ? "page" : undefined}
        onClick={onHistory}
        style={{
          width: "48px",
          height: "48px",
          border: 0,
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: active === "history" ? "scale(1.12)" : "scale(1)",
          padding: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: active === "history"
              ? "0 4px 12px rgba(167, 139, 250, 0.35)"
              : "0 1px 4px rgba(0,0,0,0.08)",
            border: active === "history"
              ? "2px solid #A78BFA"
              : "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <img
            src={navCallImg}
            alt="Calls"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </button>
    </nav>
  );
};
