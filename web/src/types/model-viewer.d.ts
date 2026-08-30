declare namespace JSX {
  interface IntrinsicElements {
    "model-viewer": {
      ref?: React.RefObject<any>;
      src?: string;
      alt?: string;
      "camera-controls"?: boolean;
      "auto-rotate"?: boolean;
      "auto-rotate-delay"?: number;
      "rotation-per-second"?: string;
      "shadow-intensity"?: number;
      "shadow-softness"?: number;
      "environment-image"?: string;
      exposure?: number;
      style?: React.CSSProperties;
      children?: React.ReactNode;
    };
  }
}
