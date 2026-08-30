import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.05, 3.8);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const frontKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    frontKeyLight.position.set(1.2, 2.2, 3.8);
    scene.add(frontKeyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
    fillLight.position.set(-1.8, 0.8, 2.8);
    scene.add(fillLight);

    const goldFloorLight = new THREE.PointLight(0xfef08a, 3.8, 6.0, 1.2);
    goldFloorLight.position.set(0, -1.2, 0.6);
    scene.add(goldFloorLight);

    const rimCyanLight = new THREE.DirectionalLight(0x00f0ff, 1.6);
    rimCyanLight.position.set(-2.0, 2.0, -2.5);
    scene.add(rimCyanLight);

    const holoField = new THREE.Group();
    scene.add(holoField);

    // =========================================================================
    // 2. Light-Golden Floor Projector Platform & Inverted Triangle Grid Beam
    // =========================================================================
    const floorHUD = new THREE.Group();
    floorHUD.position.set(0, -1.15, 0);
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

    // Light-Golden Inverted Triangle Grid Beam
    const coneWireGeo = new THREE.CylinderGeometry(0.85, 0.16, 0.45, 18, 4, true);
    const coneWireMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const invertedTriangleGrid = new THREE.LineSegments(coneWireGeo, coneWireMat);
    invertedTriangleGrid.position.set(0, -0.92, 0);
    holoField.add(invertedTriangleGrid);

    // Soft Volumetric Inner Beam
    const beamMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 0.14, 0.45, 32, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      })
    );
    beamMesh.position.set(0, -0.92, 0);
    holoField.add(beamMesh);

    // =========================================================================
    // 3. Real 3D GLB Model Mesh Mounting (Converted 3D Model Asset)
    // =========================================================================
    const characterGroup = new THREE.Group();
    characterGroup.position.set(0, 0.05, 0);
    holoField.add(characterGroup);

    let headPosAttr: THREE.BufferAttribute | null = null;
    let originalHeadPositions: Float32Array | null = null;
    const mouthIndices: number[] = [];

    // Fallback 3D Portrait Generator
    const buildFallback3DPortrait = (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.needsUpdate = true;

      const meshW = 1.95;
      const meshH = 2.35;
      const frontGeo = new THREE.PlaneGeometry(meshW, meshH, 64, 64);
      const pos = frontGeo.attributes.position as THREE.BufferAttribute;
      headPosAttr = pos;
      originalHeadPositions = new Float32Array(pos.array);

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const nx = x / (meshW / 2);
        const ny = y / (meshH / 2);
        const rSq = nx * nx + ny * ny;

        const z = Math.max(0, 1.0 - rSq * 0.75) * 0.32;
        pos.setZ(i, z);
        originalHeadPositions[i * 3 + 2] = z;

        if (y > -0.45 && y < -0.15 && Math.abs(x) < 0.28) {
          mouthIndices.push(i);
        }
      }
      frontGeo.computeVertexNormals();

      const frontMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.02,
        emissive: 0xffffff,
        emissiveIntensity: 0.05,
        side: THREE.DoubleSide,
      });
      const frontMesh = new THREE.Mesh(frontGeo, frontMat);
      frontMesh.name = "frontFaceMesh";
      frontMesh.position.set(0, 0, 0.02);
      characterGroup.add(frontMesh);

      const backGeo = frontGeo.clone();
      const backPos = backGeo.attributes.position;
      for (let i = 0; i < backPos.count; i++) {
        backPos.setZ(i, -Math.abs(backPos.getZ(i)) - 0.04);
      }
      backGeo.computeVertexNormals();

      const backMat = new THREE.MeshStandardMaterial({
        color: 0x6366f1,
        roughness: 0.45,
        metalness: 0.1,
        emissive: 0x312e81,
        emissiveIntensity: 0.2,
        side: THREE.BackSide,
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.name = "backHullMesh";
      characterGroup.add(backMesh);

      setLoading(false);
      onModelReady?.();
    };

    // Load Real Converted 3D GLB Model Asset
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "/models/avatar_3d.glb",
      (gltf) => {
        const root = gltf.scene;
        root.name = "real3DGltfModel";

        // Center and scale normalized 3D model
        const box = new THREE.Box3().setFromObject(root);
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        const centerVec = new THREE.Vector3();
        box.getCenter(centerVec);

        const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
        const targetSize = 2.1;
        const scaleFactor = targetSize / maxDim;
        root.scale.set(scaleFactor, scaleFactor, scaleFactor);
        root.position.set(
          -centerVec.x * scaleFactor,
          -centerVec.y * scaleFactor + 0.15,
          -centerVec.z * scaleFactor
        );

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const oldMat = mesh.material as THREE.MeshStandardMaterial;
              mesh.material = new THREE.MeshStandardMaterial({
                color: oldMat.color || new THREE.Color(0xfff8f0),
                map: oldMat.map || null,
                roughness: 0.38,
                metalness: 0.05,
                emissive: new THREE.Color(0xfef08a),
                emissiveIntensity: 0.06,
                side: THREE.DoubleSide,
              });
            }
          }
        });

        characterGroup.add(root);
        setLoading(false);
        onModelReady?.();
      },
      undefined,
      (err) => {
        console.warn("GLB model loading fallback:", err);
        if (photoUrl) {
          new THREE.TextureLoader().load(photoUrl, buildFallback3DPortrait);
        }
      }
    );

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
          orbitRotY += 0.007;
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
      characterGroup.position.y = 0.05 + Math.sin(elapsed * 2.2) * 0.025;
      topGlowGroup.position.y = 0.45 + Math.sin(elapsed * 2.2) * 0.025;

      // Rotating top orbital rings
      topOrbit1.rotation.y = elapsed * 0.55;
      topOrbit2.rotation.y = -elapsed * 0.45;

      // Floor HUD dial rotations
      hudDialMesh.rotation.z = elapsed * 0.35;
      diodesGroup.rotation.z = elapsed * 0.15;
      invertedTriangleGrid.rotation.y = -elapsed * 0.18;

      // Real-time speaking animation pulse
      if (isSpeakingRef.current) {
        const pulse = 1.0 + Math.sin(elapsed * 8.0) * 0.025;
        characterGroup.scale.set(pulse, pulse, pulse);
        coreFlareMat.opacity = 0.95 + Math.sin(elapsed * 9.0) * 0.15;
      } else {
        characterGroup.scale.set(1, 1, 1);
        coreFlareMat.opacity = 0.85;
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
