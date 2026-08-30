import React from "react";
import { tokens } from "../styles/tokens.js";
import heavenlyBackground from "../assets/heavenly-background.png";

type MobileContainerProps = {
  children: React.ReactNode;
  bottomNavigation?: React.ReactNode;
};

export const MobileContainer: React.FC<MobileContainerProps> = ({ children, bottomNavigation }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${heavenlyBackground})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        padding: "0",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: tokens.dimensions.mobileWidth,
          minHeight: "100vh",
          maxHeight: "100vh",
          backgroundImage: `url(${heavenlyBackground})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.4)",
          borderRight: "1px solid rgba(255, 255, 255, 0.4)",
        }}
      >
        <div style={{ minHeight: "100%", height: "100%", flex: 1, display: "flex", flexDirection: "column", paddingBottom: bottomNavigation ? "112px" : 0 }}>
          {children}
        </div>
        {bottomNavigation}
      </main>
    </div>
  );
};
