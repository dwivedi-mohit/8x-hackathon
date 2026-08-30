import React, { useEffect, useRef } from "react";
import navPlusImg from "../assets/nav/nav_plus.jpg";
import navHomeImg from "../assets/nav/nav_home.jpg";
import navCallImg from "../assets/nav/nav_call.jpg";

type NavigationItem = "create" | "home" | "history";

type BottomNavigationProps = {
  active: NavigationItem;
  onHome: () => void;
  onCreate: () => void;
  onHistory: () => void;
};

// Component that cleanly keys out white backgrounds from JPEG icons into true transparent PNG
export const TransparentIcon: React.FC<{ src: string; alt: string; size: number }> = ({ src, size }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Aggressive luminance keying for pure transparency
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = (r + g + b) / 3;

        if (lum > 205) {
          if (lum > 242) {
            data[i + 3] = 0; // 100% transparent
          } else {
            const factor = Math.pow((242 - lum) / 37, 1.5);
            data[i + 3] = Math.max(0, Math.min(255, Math.round(factor * 255)));
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "block",
        pointerEvents: "none",
        filter: "drop-shadow(0 6px 14px rgba(100, 65, 211, 0.15))",
      }}
    />
  );
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
        width: "min(calc(100vw - 56px), 260px)", // Closer together / compact pill
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "max(16px, env(safe-area-inset-bottom))",
        height: "60px",
        borderRadius: "36px",
        backgroundColor: "rgba(255, 255, 255, 0.38)",
        border: "1.5px solid rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(36px) saturate(210%)",
        WebkitBackdropFilter: "blur(36px) saturate(210%)",
        boxShadow: "0 16px 36px rgba(100, 65, 211, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "28px", // Paas / Cozy spacing
        padding: "0 18px",
        zIndex: 999,
      }}
    >
      {/* 1. 3D Plush Plus Icon (Create) — Elevates UP when clicked */}
      <button
        type="button"
        aria-label="Create persona"
        aria-current={active === "create" ? "page" : undefined}
        onClick={onCreate}
        style={{
          position: "relative",
          width: "48px",
          height: "48px",
          border: 0,
          outline: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: active === "create" ? "translateY(-10px) scale(1.18)" : "translateY(0px) scale(0.95)",
          opacity: active === "create" ? 1 : 0.65,
          filter: active === "create" ? "drop-shadow(0 10px 18px rgba(244, 162, 97, 0.45))" : "none",
        }}
      >
        <TransparentIcon src={navPlusImg} alt="Create" size={40} />
        {active === "create" && (
          <span
            style={{
              position: "absolute",
              bottom: "-4px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#F4A261",
              boxShadow: "0 0 8px #F4A261",
            }}
          />
        )}
      </button>

      {/* 2. 3D Home Cottage — Elevates UP when clicked */}
      <button
        type="button"
        aria-label="Home"
        aria-current={active === "home" ? "page" : undefined}
        onClick={onHome}
        style={{
          position: "relative",
          width: "56px",
          height: "56px",
          border: 0,
          outline: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: active === "home" ? "translateY(-12px) scale(1.2)" : "translateY(0px) scale(0.95)",
          opacity: active === "home" ? 1 : 0.65,
          filter: active === "home" ? "drop-shadow(0 12px 22px rgba(139, 92, 246, 0.45))" : "none",
        }}
      >
        <TransparentIcon src={navHomeImg} alt="Home" size={52} />
        {active === "home" && (
          <span
            style={{
              position: "absolute",
              bottom: "-4px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#8B5CF6",
              boxShadow: "0 0 8px #8B5CF6",
            }}
          />
        )}
      </button>

      {/* 3. 3D Call Handset (History / Calls) — Elevates UP when clicked */}
      <button
        type="button"
        aria-label="Call history"
        aria-current={active === "history" ? "page" : undefined}
        onClick={onHistory}
        style={{
          position: "relative",
          width: "48px",
          height: "48px",
          border: 0,
          outline: "none",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: active === "history" ? "translateY(-10px) scale(1.18)" : "translateY(0px) scale(0.95)",
          opacity: active === "history" ? 1 : 0.65,
          filter: active === "history" ? "drop-shadow(0 10px 18px rgba(129, 140, 248, 0.45))" : "none",
        }}
      >
        <TransparentIcon src={navCallImg} alt="Calls" size={40} />
        {active === "history" && (
          <span
            style={{
              position: "absolute",
              bottom: "-4px",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#818CF8",
              boxShadow: "0 0 8px #818CF8",
            }}
          />
        )}
      </button>
    </nav>
  );
};
