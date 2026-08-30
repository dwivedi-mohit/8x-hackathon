import React from "react";
import { tokens } from "../styles/tokens.js";

type MobileContainerProps = {
  children: React.ReactNode;
};

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2EDE4",
        padding: "0",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: tokens.dimensions.mobileWidth,
          minHeight: "100vh",
          maxHeight: "100vh",
          backgroundColor: tokens.colors.canvas,
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
        {children}
      </main>
    </div>
  );
};
