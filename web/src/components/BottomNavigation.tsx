import React from "react";
import navCreateImg from "../assets/nav/nav_create.jpg";
import navHomeImg from "../assets/nav/nav_home.jpg";
import navHistoryImg from "../assets/nav/nav_history.jpg";
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
        bottom: "max(14px, env(safe-area-inset-bottom))",
        height: "68px",
        borderRadius: "34px",
        backgroundColor: "rgba(255, 255, 255, 0.22)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(32px) saturate(200%)",
        WebkitBackdropFilter: "blur(32px) saturate(200%)",
        boxShadow: "0 16px 36px rgba(100, 65, 211, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        zIndex: 999,
      }}
    >
      {/* 3D Create Tab */}
      <button
        type="button"
        aria-current={active === "create" ? "page" : undefined}
        onClick={onCreate}
        style={{
          flex: 1,
          height: "54px",
          border: 0,
          background: active === "create" ? "rgba(255, 255, 255, 0.68)" : "transparent",
          borderRadius: "27px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          cursor: "pointer",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: active === "create" ? "0 4px 14px rgba(167, 139, 250, 0.25)" : "none",
          transform: active === "create" ? "scale(1.04)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: active === "create" ? "0 2px 8px rgba(167, 139, 250, 0.4)" : "0 1px 3px rgba(0,0,0,0.1)",
            border: active === "create" ? "2px solid #A78BFA" : "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <img
            src={navCreateImg}
            alt="Create"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: active === "create" ? 700 : 500,
            color: active === "create" ? tokens.colors.lavenderPrimary : tokens.colors.textSecondary,
          }}
        >
          Create
        </span>
      </button>

      {/* 3D Home / Companions Tab */}
      <button
        type="button"
        aria-current={active === "home" ? "page" : undefined}
        onClick={onHome}
        style={{
          flex: 1.15,
          height: "56px",
          border: 0,
          background: active === "home" ? "rgba(255, 255, 255, 0.72)" : "transparent",
          borderRadius: "28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          cursor: "pointer",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: active === "home" ? "0 6px 18px rgba(100, 65, 211, 0.28)" : "none",
          transform: active === "home" ? "scale(1.08)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: active === "home" ? "0 3px 10px rgba(100, 65, 211, 0.45)" : "0 1px 3px rgba(0,0,0,0.1)",
            border: active === "home" ? "2px solid #6441D3" : "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <img
            src={navHomeImg}
            alt="Home"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: active === "home" ? 700 : 500,
            color: active === "home" ? tokens.colors.lavenderPrimary : tokens.colors.textSecondary,
          }}
        >
          Companions
        </span>
      </button>

      {/* 3D History / Calls Tab */}
      <button
        type="button"
        aria-current={active === "history" ? "page" : undefined}
        onClick={onHistory}
        style={{
          flex: 1,
          height: "54px",
          border: 0,
          background: active === "history" ? "rgba(255, 255, 255, 0.68)" : "transparent",
          borderRadius: "27px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          cursor: "pointer",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: active === "history" ? "0 4px 14px rgba(244, 162, 97, 0.25)" : "none",
          transform: active === "history" ? "scale(1.04)" : "scale(1)",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: active === "history" ? "0 2px 8px rgba(244, 162, 97, 0.4)" : "0 1px 3px rgba(0,0,0,0.1)",
            border: active === "history" ? "2px solid #F4A261" : "1px solid rgba(255,255,255,0.8)",
          }}
        >
          <img
            src={navHistoryImg}
            alt="History"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: active === "history" ? 700 : 500,
            color: active === "history" ? tokens.colors.peachPrimary : tokens.colors.textSecondary,
          }}
        >
          History
        </span>
      </button>
    </nav>
  );
};
