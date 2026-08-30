import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type ThreeAvatar3DProps = {
  photoUrl?: string;
  personaName?: string;
  size?: number; // Canvas diameter in px
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
  scanEffect = true,
  gradientStart = "#818CF8",
  gradientEnd = "#C084FC",
  onModelReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const isSpeakingRef = useRef(isSpeaking);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Clean any prior canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = size;
    const height = Math.round(size * 1.25);

    // =========================================================================
    // 1. Scene, Camera, & High-Performance Renderer
    // =========================================================================
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfff8f0, 0.06);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.85);

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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    frontKeyLight.position.set(1.5, 3.0, 3.5);
    scene.add(frontKeyLight);

    const goldFloorLight = new THREE.PointLight(0xfef08a, 4.0, 6.0, 1.2);
    goldFloorLight.position.set(0, -1.2, 0.8);
    scene.add(goldFloorLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
    rimLight.position.set(-2.0, 2.0, -2.0);
    scene.add(rimLight);

    const holoField = new THREE.Group();
    scene.add(holoField);

    // =========================================================================
    // 2. Light-Golden HUD Projector Floor Base
    // =========================================================================
    const floorHUD = new THREE.Group();
    floorHUD.position.set(0, -1.05, 0.2);
    holoField.add(floorHUD);

    // Compact Floor HUD Dials
    const dialTexCanvas = document.createElement("canvas");
    dialTexCanvas.width = 512;
    dialTexCanvas.height = 512;
    const dialCtx = dialTexCanvas.getContext("2d");
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
        const x = 256 + Math.cos(rad) * 190;
        const y = 256 + Math.sin(rad) * 190;
        dialCtx.beginPath();
        dialCtx.arc(x, y, 3.5, 0, Math.PI * 2);
        dialCtx.fill();
      }

      for (let i = 0; i < 8; i++) {
        const rad = (i / 8) * Math.PI * 2;
        dialCtx.strokeStyle = "#FEF08A";
        dialCtx.lineWidth = 2.5;
        dialCtx.beginPath();
        dialCtx.moveTo(256 + Math.cos(rad) * 215, 256 + Math.sin(rad) * 215);
        dialCtx.lineTo(256 + Math.cos(rad) * 238, 256 + Math.sin(rad) * 238);
        dialCtx.stroke();
      }
    }

    const hudDialTexture = new THREE.CanvasTexture(dialTexCanvas);
    const hudDialMat = new THREE.MeshBasicMaterial({
      map: hudDialTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const hudDialMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), hudDialMat);
    hudDialMesh.rotation.x = -Math.PI / 2;
    floorHUD.add(hudDialMesh);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.008, 16, 64), ringMat1);
    ring1.rotation.x = Math.PI / 2;
    floorHUD.add(ring1);

    const diodesGroup = new THREE.Group();
    const diodeGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 8);
    const diodeMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      blending: THREE.AdditiveBlending,
    });
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const diode = new THREE.Mesh(diodeGeo, diodeMat);
      diode.position.set(Math.cos(angle) * 0.68, 0.015, Math.sin(angle) * 0.68);
      diodesGroup.add(diode);
    }
    floorHUD.add(diodesGroup);

    const coreFlareMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const coreFlare = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), coreFlareMat);
    coreFlare.position.set(0, 0.02, 0);
    floorHUD.add(coreFlare);

    // Inverted Triangle Wireframe Grid Beam
    const coneWireGeo = new THREE.CylinderGeometry(1.32, 0.22, 1.35, 18, 8, true);
    const coneWireMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const invertedTriangleGrid = new THREE.LineSegments(coneWireGeo, coneWireMat);
    invertedTriangleGrid.position.set(0, -0.38, 0.2);
    holoField.add(invertedTriangleGrid);

    // Soft Inner Light Beam
    const beamGeo = new THREE.CylinderGeometry(1.28, 0.2, 1.35, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(0, -0.38, 0.2);
    holoField.add(beamMesh);

    // =========================================================================
    // 3. 360-Degree Image-to-3D Volumetric Mesh & Real-time Lip-Sync Model
    // =========================================================================
    const modelGroup = new THREE.Group();
    modelGroup.position.set(0, 0.45, 0.2);
    holoField.add(modelGroup);

    // High-resolution 3D facial relief geometry (48x48 mesh)
    const modelGeo = new THREE.PlaneGeometry(1.85, 2.25, 48, 48);
    const pos = modelGeo.attributes.position;
    const originalPositions = new Float32Array(pos.array);
    const mouthIndices: number[] = [];
    const jawIndices: number[] = [];

    // Construct 3D Volumetric Relief with facial curvature and identify mouth/jaw vertices
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      // Organic convex bust curvature
      const r = Math.sqrt((x / 0.92) ** 2 + ((y - 0.25) / 1.15) ** 2);
      const facialRelief = Math.max(0, 1 - r) * 0.22;
      const z = facialRelief - Math.pow(x / 0.95, 2) * 0.12;

      pos.setZ(i, z);
      originalPositions[i * 3 + 2] = z;

      // Identify mouth vertices (centered around Y ~ -0.05, X between -0.22 and +0.22)
      if (Math.abs(x) < 0.22 && y > -0.22 && y < 0.08) {
        mouthIndices.push(i);
      }
      // Identify lower jaw vertices (Y between -0.45 and -0.20)
      if (Math.abs(x) < 0.35 && y > -0.45 && y <= -0.20) {
        jawIndices.push(i);
      }
    }
    modelGeo.computeVertexNormals();

    // Sparse Light Golden Wireframe Contour Overlay (6x8 grid)
    const sparseGridGeo = new THREE.PlaneGeometry(1.85, 2.25, 6, 8);
    const sparsePos = sparseGridGeo.attributes.position;
    for (let i = 0; i < sparsePos.count; i++) {
      const x = sparsePos.getX(i);
      const y = sparsePos.getY(i);
      const r = Math.sqrt((x / 0.92) ** 2 + ((y - 0.25) / 1.15) ** 2);
      const z = Math.max(0, 1 - r) * 0.22 - Math.pow(x / 0.95, 2) * 0.12;
      sparsePos.setZ(i, z);
    }

    const createPersonaCanvasTexture = (name: string, startCol: string, endCol: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;

      const grad = ctx.createLinearGradient(0, 0, 512, 640);
      grad.addColorStop(0, startCol);
      grad.addColorStop(1, endCol);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 640);

      const radGrad = ctx.createRadialGradient(256, 260, 30, 256, 260, 240);
      radGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      radGrad.addColorStop(0.4, "rgba(254, 240, 138, 0.5)");
      radGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, 512, 640);

      ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
      ctx.beginPath();
      ctx.arc(256, 230, 88, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(256, 440, 175, 125, 0, Math.PI, 0);
      ctx.fill();

      ctx.font = "bold 82px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#312E81";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name.charAt(0).toUpperCase(), 256, 230);

      ctx.strokeStyle = "#FEF08A";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(256, 230, 96, 0, Math.PI * 2);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const textureLoader = new THREE.TextureLoader();

    const buildModel = (tex?: THREE.Texture) => {
      let modelMat: THREE.Material;

      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        modelMat = new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          opacity: 0.96,
          roughness: 0.35,
          metalness: 0.05,
          emissive: 0xfef08a,
          emissiveIntensity: 0.06,
          side: THREE.DoubleSide,
        });
      } else {
        modelMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.92,
          roughness: 0.35,
          metalness: 0.15,
          emissive: 0xfde047,
          emissiveIntensity: 0.2,
          side: THREE.DoubleSide,
        });
      }

      // Front 3D Face Relief Mesh
      const mesh = new THREE.Mesh(modelGeo, modelMat);
      modelGroup.add(mesh);

      // Back 3D Shell to form a 360-degree volumetric bust
      const backGeo = modelGeo.clone();
      const backPos = backGeo.attributes.position;
      for (let i = 0; i < backPos.count; i++) {
        backPos.setZ(i, -backPos.getZ(i) - 0.04);
      }
      backGeo.computeVertexNormals();
      const backMat = new THREE.MeshStandardMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.85,
        roughness: 0.4,
        metalness: 0.1,
        emissive: 0x312e81,
        emissiveIntensity: 0.15,
        side: THREE.BackSide,
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);
      modelGroup.add(backMesh);

      // Sparse Light Golden Wireframe Grid
      const goldenWireMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const wireMesh = new THREE.Mesh(sparseGridGeo, goldenWireMat);
      wireMesh.position.z = 0.008;
      modelGroup.add(wireMesh);

      // Glowing Golden Silhouette Edge Halo
      const haloGeo = new THREE.PlaneGeometry(1.95, 2.35);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.z = -0.02;
      modelGroup.add(haloMesh);

      setLoading(false);
      onModelReady?.();
    };

    if (photoUrl) {
      textureLoader.load(
        photoUrl,
        (tex) => buildModel(tex),
        undefined,
        () => {
          const fallbackTex = createPersonaCanvasTexture(personaName, gradientStart, gradientEnd);
          buildModel(fallbackTex);
        }
      );
    } else {
      const defaultTex = createPersonaCanvasTexture(personaName, gradientStart, gradientEnd);
      buildModel(defaultTex);
    }

    // =========================================================================
    // 4. Glowing Light Lines & Orbital Rings at Top & Shoulders
    // =========================================================================
    const topGlowGroup = new THREE.Group();
    topGlowGroup.position.set(0, 0.45, 0.2);
    holoField.add(topGlowGroup);

    const goldRingMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const cyanRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const topOrbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.009, 16, 80), goldRingMat);
    topOrbit1.scale.set(1.22, 0.36, 1.22);
    topOrbit1.rotation.z = 0.32;
    topOrbit1.rotation.x = 0.2;
    topGlowGroup.add(topOrbit1);

    const topOrbit2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.008, 16, 80), cyanRingMat);
    topOrbit2.scale.set(1.18, 0.32, 1.18);
    topOrbit2.rotation.z = -0.34;
    topOrbit2.rotation.x = -0.16;
    topGlowGroup.add(topOrbit2);

    // =========================================================================
    // 5. Floating Glowing Particle Stardust
    // =========================================================================
    const particleCount = 65;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.95;
      particlePositions[i * 3] = Math.cos(theta) * r;
      particlePositions[i * 3 + 1] = -0.85 + Math.random() * 2.1;
      particlePositions[i * 3 + 2] = Math.sin(theta) * r + 0.2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.038,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    holoField.add(particles);

    // =========================================================================
    // 6. Interactive 360-Degree Touch / Drag Rotation & Lip-Sync Loop
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
      orbitRotX = Math.max(-0.45, Math.min(0.45, orbitRotX + velocityX));
    };

    const onPointerUp = () => {
      isDragging = false;
      // Resume gentle auto rotation after 3 seconds of inactivity
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

      // 360-degree rotation handling with smooth inertia
      if (!isDragging) {
        if (autoRotate) {
          orbitRotY += 0.008; // Subtle 360-degree turntable rotation
        } else {
          velocityY *= 0.92;
          velocityX *= 0.92;
          orbitRotY += velocityY;
          orbitRotX += velocityX;
        }
      }

      modelGroup.rotation.y = orbitRotY;
      modelGroup.rotation.x = orbitRotX;

      // Parallax tracking on the overall holographic field
      holoField.rotation.y = Math.sin(elapsed * 0.6) * 0.05;

      // Gentle floating levitation
      modelGroup.position.y = 0.45 + Math.sin(elapsed * 2.2) * 0.03;
      topGlowGroup.position.y = 0.45 + Math.sin(elapsed * 2.2) * 0.03;

      // Smooth rotation of top glowing orbital rings
      topOrbit1.rotation.y = elapsed * 0.55;
      topOrbit2.rotation.y = -elapsed * 0.45;

      // Rotating compact HUD dials on the floor
      hudDialMesh.rotation.z = elapsed * 0.35;
      ring1.rotation.z = -elapsed * 0.25;
      diodesGroup.rotation.z = elapsed * 0.15;
      invertedTriangleGrid.rotation.y = -elapsed * 0.18;

      // =======================================================================
      // Real-time 3D Lip-Sync Viseme Morphing
      // =======================================================================
      if (isSpeakingRef.current) {
        const pulse = 1.0 + Math.sin(elapsed * 8.0) * 0.025;
        modelGroup.scale.set(pulse, pulse, pulse);
        coreFlareMat.opacity = 0.95 + Math.sin(elapsed * 9.0) * 0.15;

        // Dynamic viseme mouth opening and phonetic speech modulation
        const mouthOpenAmount = (Math.sin(elapsed * 13.0) * 0.5 + 0.5) * 0.042 + Math.abs(Math.sin(elapsed * 21.0)) * 0.018;
        const jawDropAmount = (Math.sin(elapsed * 13.0) * 0.5 + 0.5) * 0.03;

        // Modulate mouth vertices
        for (const idx of mouthIndices) {
          const baseZ = originalPositions[idx * 3 + 2] ?? 0;
          const baseY = originalPositions[idx * 3 + 1] ?? 0;
          pos.setY(idx, baseY - mouthOpenAmount * 0.65);
          pos.setZ(idx, baseZ + Math.cos(elapsed * 14.0) * 0.018);
        }

        // Modulate lower jaw vertices
        for (const idx of jawIndices) {
          const baseY = originalPositions[idx * 3 + 1] ?? 0;
          pos.setY(idx, baseY - jawDropAmount);
        }

        pos.needsUpdate = true;
        modelGeo.computeVertexNormals();
      } else {
        modelGroup.scale.set(1, 1, 1);
        coreFlareMat.opacity = 0.85;

        // Return mouth vertices to resting expression
        if (pos.needsUpdate) {
          for (let i = 0; i < pos.count; i++) {
            pos.setY(i, originalPositions[i * 3 + 1] ?? 0);
            pos.setZ(i, originalPositions[i * 3 + 2] ?? 0);
          }
          pos.needsUpdate = true;
          modelGeo.computeVertexNormals();
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
  }, [photoUrl, size, interactive, scanEffect, personaName, gradientStart, gradientEnd, onModelReady]);

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
      {/* 3D Canvas Mount */}
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
