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
        background: "#F7EEE9",
        padding: "0",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: tokens.dimensions.mobileWidth,
          minHeight: "100vh",
          maxHeight: "100vh",
          backgroundImage: `linear-gradient(180deg, rgba(255, 254, 251, 0.38) 0%, rgba(255, 252, 248, 0.16) 48%, rgba(255, 250, 246, 0.38) 100%), url(${heavenlyBackground})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: tokens.shadows.elevated,
          borderLeft: `1px solid ${tokens.colors.borderSubtle}`,
          borderRight: `1px solid ${tokens.colors.borderSubtle}`,
        }}
      >
        <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", paddingBottom: bottomNavigation ? "112px" : 0 }}>
          {children}
        </div>
        {bottomNavigation}
      </main>
    </div>
  );
};
