import React, { useRef, useEffect } from "react";

type TalkingAvatar3DProps = {
  /** Ready Player Me GLB URL */
  glbUrl: string;
  /** Whether the persona is currently speaking */
  isSpeaking: boolean;
  /** Whether the persona is listening */
  isListening: boolean;
  /** Size in pixels (square) */
  size?: number;
  /** Optional: audio level 0-1 for mouth animation */
  audioLevel?: number;
};

export const TalkingAvatar3D: React.FC<TalkingAvatar3DProps> = ({
  glbUrl,
  isSpeaking,
  isListening,
  size = 280,
  audioLevel = 0,
}) => {
  const mvRef = useRef<any>(null);

  // Animate the model based on speaking state
  useEffect(() => {
    const mv = mvRef.current as any;
    if (!mv) return;

    if (isSpeaking) {
      mv.play({ name: "Talking", loop: true });
    } else if (isListening) {
      mv.play({ name: "Idle", loop: true });
    } else {
      mv.pause();
    }
  }, [isSpeaking, isListening]);

  // Drive mouth morph target from audio level
  useEffect(() => {
    const mv = mvRef.current as any;
    if (!mv || !isSpeaking) return;

    const model = mv.loaded as any;
    if (!model) return;

    // Ready Player Me GLBs use morph targets named Viseme_aa, Viseme_E, etc.
    // Map audio level to viseme intensity
    const scene = mv.shadowRoot?.querySelector("model-viewer")?.scene;
    if (!scene) return;

    // Simple audio-reactive mouth: scale the avatar slightly when speaking
    const scale = 1 + audioLevel * 0.03;
    mv.scene.scale.set(scale, scale, scale);
  }, [audioLevel, isSpeaking]);

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #F4F0FD 0%, #FFF5ED 100%)",
      }}
    >
      <model-viewer
        ref={mvRef as any}
        src={glbUrl}
        alt="3D avatar"
        camera-controls={false}
        auto-rotate={isListening}
        auto-rotate-delay={0}
        rotation-per-second={isListening ? "20deg" : "0deg"}
        shadow-intensity={0.5}
        shadow-softness={0.8}
        environment-image="neutral"
        exposure={1.0}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      />

      {/* Glow ring overlay */}
      {(isSpeaking || isListening) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: isSpeaking
              ? "3px solid rgba(5, 150, 105, 0.6)"
              : "2px solid rgba(124, 58, 237, 0.3)",
            boxShadow: isSpeaking
              ? "0 0 24px rgba(5, 150, 105, 0.3)"
              : "0 0 16px rgba(124, 58, 237, 0.2)",
            pointerEvents: "none",
            animation: isSpeaking ? "avatarPulse 1.5s ease-in-out infinite" : "none",
          }}
        />
      )}
    </div>
  );
};
