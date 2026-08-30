import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ThreeAvatar3DProps = {
  photoUrl?: string;
  personaName?: string;
  size?: number;
  isSpeaking?: boolean;
  isListening?: boolean;
  status?: string;
  interactive?: boolean;
  scanEffect?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  onModelReady?: () => void;
};

export const ThreeAvatar3D: React.FC<ThreeAvatar3DProps> = ({
  photoUrl,
  personaName = "Companion",
  size = 280,
  isSpeaking = false,
  interactive = true,
  gradientStart = "#818CF8",
  gradientEnd = "#C084FC",
  onModelReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [, setLoading] = useState(true);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = size;
    const height = Math.round(size * 1.25);

    // =========================================================================
    // 1. Scene, Camera & High-Performance WebGL Renderer
    // =========================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff8f0, 0.05);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Dynamic Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    frontKeyLight.position.set(1.2, 2.5, 3.5);
    scene.add(frontKeyLight);

    const goldFloorLight = new THREE.PointLight(0xfef08a, 4.2, 6.0, 1.2);
    goldFloorLight.position.set(0, -1.2, 0.6);
    scene.add(goldFloorLight);

    const rimCyanLight = new THREE.DirectionalLight(0x00f0ff, 1.8);
    rimCyanLight.position.set(-2.0, 2.0, -2.5);
    scene.add(rimCyanLight);

    const holoField = new THREE.Group();
    scene.add(holoField);

    // =========================================================================
    // 2. Light-Golden Floor Projector Platform & Inverted Triangle Grid Beam
    // =========================================================================
    const floorHUD = new THREE.Group();
    floorHUD.position.set(0, -1.08, 0);
    holoField.add(floorHUD);

    // Floor HUD Dial Texture
    const dialCanvas = document.createElement("canvas");
    dialCanvas.width = 512;
    dialCanvas.height = 512;
    const dialCtx = dialCanvas.getContext("2d");
    if (dialCtx) {
      dialCtx.clearRect(0, 0, 512, 512);
      dialCtx.strokeStyle = "#FEF08A";
      dialCtx.lineWidth = 4;
      dialCtx.beginPath();
      dialCtx.arc(256, 256, 230, 0, Math.PI * 2);
      dialCtx.stroke();

      dialCtx.lineWidth = 2;
      dialCtx.setLineDash([8, 12]);
      dialCtx.beginPath();
      dialCtx.arc(256, 256, 205, 0, Math.PI * 2);
      dialCtx.stroke();
      dialCtx.setLineDash([]);

      dialCtx.strokeStyle = "#FDE047";
      dialCtx.lineWidth = 3;
      dialCtx.beginPath();
      dialCtx.arc(256, 256, 175, 0, Math.PI * 2);
      dialCtx.stroke();

      dialCtx.fillStyle = "#FEF08A";
      for (let i = 0; i < 24; i++) {
        const rad = (i / 24) * Math.PI * 2;
        dialCtx.beginPath();
        dialCtx.arc(256 + Math.cos(rad) * 190, 256 + Math.sin(rad) * 190, 3.5, 0, Math.PI * 2);
        dialCtx.fill();
      }
    }

    const hudDialTexture = new THREE.CanvasTexture(dialCanvas);
    const hudDialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: hudDialTexture,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    hudDialMesh.rotation.x = -Math.PI / 2;
    floorHUD.add(hudDialMesh);

    // Glowing Laser Diode Ring
    const diodesGroup = new THREE.Group();
    const diodeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8);
    const diodeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const diode = new THREE.Mesh(diodeGeo, diodeMat);
      diode.position.set(Math.cos(angle) * 0.68, 0.015, Math.sin(angle) * 0.68);
      diodesGroup.add(diode);
    }
    floorHUD.add(diodesGroup);

    // Floor Core Emitter Flare
    const coreFlareMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const coreFlare = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), coreFlareMat);
    coreFlare.position.set(0, 0.02, 0);
    floorHUD.add(coreFlare);

    // Light-Golden Inverted Triangle Grid Beam (Beaming up from floor to under the bust)
    const coneWireGeo = new THREE.CylinderGeometry(0.95, 0.16, 0.72, 18, 6, true);
    const coneWireMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      wireframe: true,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    const invertedTriangleGrid = new THREE.LineSegments(coneWireGeo, coneWireMat);
    invertedTriangleGrid.position.set(0, -0.68, 0);
    holoField.add(invertedTriangleGrid);

    // Soft Volumetric Inner Beam
    const beamMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.14, 0.72, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    beamMesh.position.set(0, -0.68, 0);
    holoField.add(beamMesh);

    // =========================================================================
    // 3. Real 360-Degree Volumetric 3D Humanoid Bust Model
    // =========================================================================
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0.28, 0);
    holoField.add(characterGroup);

    // Smooth Alpha-Masked Texture Processor
    const processImageTexture = (img: HTMLImageElement): THREE.Texture => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.Texture(img);

      // Clean transparent canvas
      ctx.clearRect(0, 0, 512, 512);

      // Draw soft elliptical vignette mask (cuts out background boxes cleanly!)
      ctx.save();
      const grad = ctx.createRadialGradient(256, 256, 160, 256, 256, 250);
      grad.addColorStop(0, "rgba(0, 0, 0, 1)");
      grad.addColorStop(0.75, "rgba(0, 0, 0, 1)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.drawImage(img, 0, 0, 512, 512);
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      ctx.restore();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Procedural Fallback Texture
    const createProceduralTexture = (name: string, startCol: string, endCol: string): THREE.CanvasTexture => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, startCol);
      grad.addColorStop(1, endCol);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Golden Halo Ring
      ctx.strokeStyle = "#FEF08A";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(256, 256, 200, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = "bold 120px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name.charAt(0).toUpperCase(), 256, 256);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    // Mouth / Jaw vertex arrays for real-time lip sync
    let headPosAttr: THREE.BufferAttribute | null = null;
    let originalHeadPositions: Float32Array | null = null;
    const mouthIndices: number[] = [];

    const build3DHumanoidBust = (faceTexture: THREE.Texture) => {
      faceTexture.colorSpace = THREE.SRGBColorSpace;

      // --- 3D Cranial Head Geometry (Volumetric 3D Sphere with human proportions) ---
      const headGeo = new THREE.SphereGeometry(0.72, 48, 48);
      headGeo.scale(0.88, 1.12, 0.92);

      const pos = headGeo.attributes.position as THREE.BufferAttribute;
      headPosAttr = pos;
      originalHeadPositions = new Float32Array(pos.array);

      // Locate mouth vertices on front of 3D head (Z > 0.45, Y between -0.32 and -0.05, |X| < 0.25)
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (z > 0.45 && y > -0.35 && y < -0.02 && Math.abs(x) < 0.25) {
          mouthIndices.push(i);
        }
      }

      // Material for 3D Head
      const headMat = new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.35,
        metalness: 0.05,
        emissive: 0xfef08a,
        emissiveIntensity: 0.08,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, 0.28, 0);
      characterGroup.add(headMesh);

      // --- 3D Anatomical Neck & Upper Torso Shoulders ---
      const neckGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.38, 32);
      const neckMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.4,
        metalness: 0.1,
        emissive: 0x4338ca,
        emissiveIntensity: 0.15,
      });
      const neckMesh = new THREE.Mesh(neckGeo, neckMat);
      neckMesh.position.set(0, -0.36, 0);
      characterGroup.add(neckMesh);

      // Shoulders & Chest (Curved 3D Torso)
      const torsoGeo = new THREE.CylinderGeometry(0.95, 1.15, 0.48, 32);
      torsoGeo.scale(1.2, 1.0, 0.7);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: 0x4f46e5,
        roughness: 0.45,
        metalness: 0.15,
        emissive: 0x312e81,
        emissiveIntensity: 0.2,
      });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoMesh.position.set(0, -0.72, 0);
      characterGroup.add(torsoMesh);

      // --- Sparse Light Golden Wireframe Accent Contour (6x8 grid) ---
      const wireGeo = new THREE.SphereGeometry(0.74, 12, 10);
      wireGeo.scale(0.9, 1.14, 0.94);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        wireframe: true,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.position.set(0, 0.28, 0);
      characterGroup.add(wireMesh);

      setLoading(false);
      onModelReady?.();
    };

    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const tex = processImageTexture(img);
        build3DHumanoidBust(tex);
      };
      img.onerror = () => {
        const defaultTex = createProceduralTexture(personaName, gradientStart, gradientEnd);
        build3DHumanoidBust(defaultTex);
      };
      img.src = photoUrl;
    } else {
      const defaultTex = createProceduralTexture(personaName, gradientStart, gradientEnd);
      build3DHumanoidBust(defaultTex);
    }

    // =========================================================================
    // 4. Top Glowing Orbital Laser Rings
    // =========================================================================
    const topGlowGroup = new THREE.Group();
    topGlowGroup.position.set(0, 0.45, 0);
    holoField.add(topGlowGroup);

    const goldRingMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
    const cyanRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });

    const topOrbit1 = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.009, 16, 80), goldRingMat);
    topOrbit1.scale.set(1.2, 0.35, 1.2);
    topOrbit1.rotation.z = 0.3;
    topOrbit1.rotation.x = 0.2;
    topGlowGroup.add(topOrbit1);

    const topOrbit2 = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.008, 16, 80), cyanRingMat);
    topOrbit2.scale.set(1.15, 0.3, 1.15);
    topOrbit2.rotation.z = -0.32;
    topOrbit2.rotation.x = -0.16;
    topGlowGroup.add(topOrbit2);

    // =========================================================================
    // 5. Floating Glowing Particle Stardust
    // =========================================================================
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.random() * 0.9;
      particlePositions[i * 3] = Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = -0.85 + Math.random() * 2.0;
      particlePositions[i * 3 + 2] = Math.sin(theta) * r;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xfef08a,
        size: 0.035,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
    holoField.add(particles);

    // =========================================================================
    // 6. Interactive 360-Degree Orbit Drag & Real-time Lip-Sync Engine
    // =========================================================================
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let orbitRotY = 0;
    let orbitRotX = 0;
    let velocityY = 0;
    let velocityX = 0;
    let autoRotate = true;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      autoRotate = false;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;

      velocityY = deltaX * 0.012;
      velocityX = deltaY * 0.008;

      orbitRotY += velocityY;
      orbitRotX = Math.max(-0.4, Math.min(0.4, orbitRotX + velocityX));
    };

    const onPointerUp = () => {
      isDragging = false;
      setTimeout(() => {
        if (!isDragging) autoRotate = true;
      }, 3000);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // 360-degree rotation with smooth turntable mode and drag inertia
      if (!isDragging) {
        if (autoRotate) {
          orbitRotY += 0.007; // Smooth 360-degree rotation
        } else {
          velocityY *= 0.92;
          velocityX *= 0.92;
          orbitRotY += velocityY;
          orbitRotX += velocityX;
        }
      }

      characterGroup.rotation.y = orbitRotY;
      characterGroup.rotation.x = orbitRotX;

      // Gentle levitation float
      characterGroup.position.y = 0.28 + Math.sin(elapsed * 2.2) * 0.025;
      topGlowGroup.position.y = 0.45 + Math.sin(elapsed * 2.2) * 0.025;

      // Rotating top orbital rings
      topOrbit1.rotation.y = elapsed * 0.55;
      topOrbit2.rotation.y = -elapsed * 0.45;

      // Floor HUD dial rotations
      hudDialMesh.rotation.z = elapsed * 0.35;
      diodesGroup.rotation.z = elapsed * 0.15;
      invertedTriangleGrid.rotation.y = -elapsed * 0.18;

      // =======================================================================
      // Real-Time 3D Lip-Sync Viseme Morphing
      // =======================================================================
      if (headPosAttr && originalHeadPositions) {
        if (isSpeakingRef.current) {
          const pulse = 1.0 + Math.sin(elapsed * 8.0) * 0.02;
          characterGroup.scale.set(pulse, pulse, pulse);
          coreFlareMat.opacity = 0.95 + Math.sin(elapsed * 9.0) * 0.15;

          const mouthOpen = (Math.sin(elapsed * 14.0) * 0.5 + 0.5) * 0.045;

          for (const idx of mouthIndices) {
            const baseY = originalHeadPositions[idx * 3 + 1] ?? 0;
            const baseZ = originalHeadPositions[idx * 3 + 2] ?? 0;
            headPosAttr.setY(idx, baseY - mouthOpen);
            headPosAttr.setZ(idx, baseZ + Math.cos(elapsed * 12.0) * 0.015);
          }
          headPosAttr.needsUpdate = true;
        } else {
          characterGroup.scale.set(1, 1, 1);
          coreFlareMat.opacity = 0.85;

          if (headPosAttr.needsUpdate) {
            for (let i = 0; i < headPosAttr.count; i++) {
              headPosAttr.setY(i, originalHeadPositions[i * 3 + 1] ?? 0);
              headPosAttr.setZ(i, originalHeadPositions[i * 3 + 2] ?? 0);
            }
            headPosAttr.needsUpdate = true;
          }
        }
      }

      // Upward particle drift
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.008;
        if (positions[i * 3 + 1] > 1.4) {
          positions[i * 3 + 1] = -0.85;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
    };
  }, [photoUrl, size, interactive, personaName, gradientStart, gradientEnd, onModelReady]);

  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size * 1.25}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        cursor: "grab",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Volumetric Hologram Aura Radial Glow */}
      <div
        style={{
          position: "absolute",
          top: "14%",
          width: `${size * 1.05}px`,
          height: `${size * 1.05}px`,
          borderRadius: "50%",
          background: isSpeaking
            ? "radial-gradient(circle, rgba(254, 240, 138, 0.2) 0%, rgba(253, 224, 71, 0.08) 45%, transparent 70%)"
            : "radial-gradient(circle, rgba(254, 240, 138, 0.14) 0%, rgba(253, 224, 71, 0.04) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
    </div>
  );
};
