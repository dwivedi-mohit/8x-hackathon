import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { CallStatus } from "../types/call.js";

type ThreeAvatar3DProps = {
  photoUrl?: string;
  isSpeaking?: boolean;
  isListening?: boolean;
  status?: CallStatus;
  size?: number;
  interactive?: boolean;
  scanEffect?: boolean;
  onModelReady?: () => void;
};

export const ThreeAvatar3D: React.FC<ThreeAvatar3DProps> = ({
  photoUrl,
  isSpeaking = false,
  isListening = false,
  status = "idle",
  size = 280,
  interactive = true,
  scanEffect = false,
  onModelReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);

  // References for animation state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const mouthMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const wireframeMeshRef = useRef<THREE.Mesh | null>(null);
  const isSpeakingRef = useRef(isSpeaking);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa78bfa, 1.6);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xf4a261, 2.5, 10);
    rimLight.position.set(0, 3, -2);
    scene.add(rimLight);

    // Group for Head & Accessories
    const headGroup = new THREE.Group();
    headGroup.position.set(0, -0.1, 0);
    scene.add(headGroup);
    headGroupRef.current = headGroup;

    // 3D Head Geometry with Procedural Depth
    const headGeo = new THREE.SphereGeometry(1.2, 48, 48);
    // Sculpt sphere into head-shape (taper jaw, broaden forehead)
    const pos = headGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Chin taper
      if (y < -0.3) {
        x *= 0.85 + (y + 0.3) * 0.2;
        z *= 0.9;
      }
      // Forehead widening
      if (y > 0.4) {
        x *= 1.05;
      }
      // Nose bridge protrusion
      if (z > 0.8 && Math.abs(x) < 0.25 && y > -0.2 && y < 0.25) {
        z += 0.22 * (1 - Math.abs(x) / 0.25);
      }
      pos.setXYZ(i, x, y, z);
    }
    headGeo.computeVertexNormals();

    // Texture Loader (Photo or fallback gradient)
    const textureLoader = new THREE.TextureLoader();

    const applyHeadMaterial = (texture?: THREE.Texture) => {
      let headMaterial: THREE.Material;

      if (texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        headMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.45,
          metalness: 0.08,
          bumpScale: 0.05,
        });
      } else {
        headMaterial = new THREE.MeshStandardMaterial({
          color: 0xf3d2bc,
          roughness: 0.5,
          metalness: 0.05,
        });
      }

      const headMesh = new THREE.Mesh(headGeo, headMaterial);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      // 3D Eyes
      const eyeGeo = new THREE.SphereGeometry(0.14, 24, 24);
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1f1d2b, roughness: 0.1 });

      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.38, 0.15, 1.05);
      headGroup.add(leftEye);
      leftEyeRef.current = leftEye;

      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.38, 0.15, 1.05);
      headGroup.add(rightEye);
      rightEyeRef.current = rightEye;

      // 3D Stylized Mouth for Lip-Sync
      const mouthGeo = new THREE.CapsuleGeometry(0.16, 0.22, 16, 16);
      const mouthMat = new THREE.MeshStandardMaterial({
        color: 0xc45e65,
        roughness: 0.4,
      });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.rotation.z = Math.PI / 2;
      mouth.position.set(0, -0.42, 1.08);
      headGroup.add(mouth);
      mouthMeshRef.current = mouth;

      // Holographic / Cyber scanning wireframe overlay
      const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0x7c3aed,
        wireframe: true,
        transparent: true,
        opacity: scanEffect ? 0.6 : 0.0,
      });
      const wireframeMesh = new THREE.Mesh(headGeo.clone(), wireframeMat);
      wireframeMesh.scale.set(1.03, 1.03, 1.03);
      headGroup.add(wireframeMesh);
      wireframeMeshRef.current = wireframeMesh;

      setLoading(false);
      onModelReady?.();
    };

    if (photoUrl) {
      textureLoader.load(
        photoUrl,
        (tex) => applyHeadMaterial(tex),
        undefined,
        () => applyHeadMaterial()
      );
    } else {
      applyHeadMaterial();
    }

    // Interactive mouse / touch tracking
    let targetRotX = 0;
    let targetRotY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const rect = container.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;

      targetRotY = x * 0.75;
      targetRotX = y * 0.55;
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Head Tracking & Idle Sway
      if (headGroupRef.current) {
        headGroupRef.current.rotation.y += (targetRotY - headGroupRef.current.rotation.y) * 0.08;
        headGroupRef.current.rotation.x += (targetRotX - headGroupRef.current.rotation.x) * 0.08;

        // Subtle breathing & idle bob
        headGroupRef.current.position.y = -0.1 + Math.sin(elapsed * 2.0) * 0.035;

        if (isSpeakingRef.current) {
          // Dynamic 3D Head gesture when speaking
          headGroupRef.current.rotation.z = Math.sin(elapsed * 4.5) * 0.04;
          headGroupRef.current.rotation.x += Math.cos(elapsed * 6.0) * 0.02;
        } else {
          headGroupRef.current.rotation.z *= 0.9;
        }
      }

      // Mouth Lip-Sync & Jaw Morphing
      if (mouthMeshRef.current) {
        if (isSpeakingRef.current) {
          const speechOpen = Math.abs(Math.sin(elapsed * 9.0)) * 0.28 + 0.08;
          mouthMeshRef.current.scale.y = 1.0 + speechOpen * 3.5;
          mouthMeshRef.current.scale.x = 1.0 - speechOpen * 0.5;
        } else if (isListeningRef.current) {
          mouthMeshRef.current.scale.y = 1.0 + Math.sin(elapsed * 3.0) * 0.15;
          mouthMeshRef.current.scale.x = 1.0;
        } else {
          mouthMeshRef.current.scale.set(1, 1, 1);
        }
      }

      // Natural Blinking
      blinkTimer += delta;
      if (blinkTimer > 3.5) {
        const blinkProgress = (blinkTimer - 3.5) / 0.15;
        if (blinkProgress < 1.0) {
          const eyeScaleY = Math.max(0.1, 1.0 - Math.sin(blinkProgress * Math.PI));
          leftEyeRef.current?.scale.set(1, eyeScaleY, 1);
          rightEyeRef.current?.scale.set(1, eyeScaleY, 1);
        } else {
          leftEyeRef.current?.scale.set(1, 1, 1);
          rightEyeRef.current?.scale.set(1, 1, 1);
          blinkTimer = 0;
        }
      }

      // Scanning wireframe pulse
      if (wireframeMeshRef.current && scanEffect) {
        wireframeMeshRef.current.rotation.y = elapsed * 0.5;
        const mat = wireframeMeshRef.current.material;
        if (mat && !Array.isArray(mat) && "opacity" in mat) {
          mat.opacity = 0.3 + Math.sin(elapsed * 4.0) * 0.3;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      renderer.dispose();
    };
  }, [photoUrl, size, interactive, scanEffect]);

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      {/* 3D Canvas Mount */}
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Hologram / Volumetric Ring Glow */}
      <div
        style={{
          position: "absolute",
          width: `${size * 1.15}px`,
          height: `${size * 1.15}px`,
          borderRadius: "50%",
          background: isSpeaking
            ? "radial-gradient(circle, rgba(244, 162, 97, 0.28) 0%, rgba(250, 248, 245, 0) 68%)"
            : "radial-gradient(circle, rgba(167, 139, 250, 0.28) 0%, rgba(250, 248, 245, 0) 68%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </div>
  );
};
