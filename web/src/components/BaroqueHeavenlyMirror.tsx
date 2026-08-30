import React, { useEffect, useRef } from "react";

type BaroqueHeavenlyMirrorProps = {
  photoUrl?: string;
  size?: number;
};

// High-Performance Volumetric Fog & Smoke Particle Canvas
const CelestialFogCanvas: React.FC<{ width: number; height: number }> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    type SmokeParticle = {
      x: number;
      y: number;
      radius: number;
      opacity: number;
      maxOpacity: number;
      vx: number;
      vy: number;
      growth: number;
      life: number;
      maxLife: number;
      color: "white" | "lavender" | "peach";
    };

    const particles: SmokeParticle[] = [];
    const maxParticles = 32;

    const spawnParticle = (): SmokeParticle => {
      // Spawn around the perimeter of the mirror (bottom, left, right, and crown)
      const side = Math.random();
      let x = width / 2;
      let y = height / 2;

      if (side < 0.5) {
        // Bottom apron / base (most dense fog)
        x = width * 0.2 + Math.random() * (width * 0.6);
        y = height * 0.78 + Math.random() * (height * 0.18);
      } else if (side < 0.75) {
        // Left frame edge
        x = width * 0.05 + Math.random() * (width * 0.2);
        y = height * 0.25 + Math.random() * (height * 0.6);
      } else {
        // Right frame edge
        x = width * 0.75 + Math.random() * (width * 0.2);
        y = height * 0.25 + Math.random() * (height * 0.6);
      }

      const colorTypes: ("white" | "lavender" | "peach")[] = ["white", "lavender", "peach"];
      const color = colorTypes[Math.floor(Math.random() * colorTypes.length)];

      return {
        x,
        y,
        radius: 28 + Math.random() * 38,
        opacity: 0,
        maxOpacity: 0.25 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.3 - Math.random() * 0.7, // gently rising upwards
        growth: 0.18 + Math.random() * 0.25,
        life: 0,
        maxLife: 160 + Math.random() * 120,
        color,
      };
    };

    // Pre-populate particles so fog is instantly visible
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render and update each smoke puff
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.radius += p.growth;

        // Smooth fade-in and fade-out envelope
        const progress = p.life / p.maxLife;
        if (progress < 0.25) {
          p.opacity = (progress / 0.25) * p.maxOpacity;
        } else if (progress > 0.65) {
          p.opacity = (1 - (progress - 0.65) / 0.35) * p.maxOpacity;
        } else {
          p.opacity = p.maxOpacity;
        }

        // Draw soft radial puff
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        if (p.color === "white") {
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          grad.addColorStop(0.5, `rgba(255, 255, 255, ${p.opacity * 0.6})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        } else if (p.color === "lavender") {
          grad.addColorStop(0, `rgba(237, 233, 254, ${p.opacity * 1.1})`);
          grad.addColorStop(0.5, `rgba(221, 214, 254, ${p.opacity * 0.5})`);
          grad.addColorStop(1, "rgba(221, 214, 254, 0)");
        } else {
          grad.addColorStop(0, `rgba(254, 215, 170, ${p.opacity * 0.9})`);
          grad.addColorStop(0.5, `rgba(253, 186, 116, ${p.opacity * 0.4})`);
          grad.addColorStop(1, "rgba(254, 215, 170, 0)");
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Respawn when particle expires
        if (p.life >= p.maxLife) {
          particles[i] = spawnParticle();
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: "-15%",
        left: "-20%",
        width: "140%",
        height: "135%",
        pointerEvents: "none",
        zIndex: 5,
        filter: "blur(14px)",
        mixBlendMode: "screen",
      }}
    />
  );
};

export const BaroqueHeavenlyMirror: React.FC<BaroqueHeavenlyMirrorProps> = ({
  photoUrl,
  size = 310,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: `${size}px`,
        height: `${size * 1.25}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "12px auto 0",
      }}
    >
      {/* Real-Time Ethereal Volumetric Fog & Smoke Simulation */}
      <CelestialFogCanvas width={size * 1.4} height={size * 1.6} />

      {/* Golden Angel Halo floating above top crest */}
      <div
        style={{
          position: "absolute",
          top: "-10px",
          left: "50%",
          transform: "translateX(-50%) rotateX(65deg)",
          width: "115px",
          height: "32px",
          borderRadius: "50%",
          border: "3.5px solid #FDE047",
          boxShadow: "0 0 24px #FDE047, 0 0 45px #F59E0B, inset 0 0 12px #FDE047",
          zIndex: 6,
          pointerEvents: "none",
          animation: "ambientPulse 3s ease-in-out infinite",
        }}
      />

      {/* Pure Image Portrait inside the Mirror Glass Portal (Static High-Res Photo) */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: `${size * 0.65}px`,
          height: `${size * 0.82}px`,
          borderRadius: "48% 48% 44% 44% / 40% 40% 60% 60%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(ellipse at center, rgba(243, 232, 255, 0.8) 0%, rgba(254, 215, 170, 0.6) 70%, rgba(167, 139, 250, 0.4) 100%)",
          boxShadow: "inset 0 0 24px rgba(124, 58, 237, 0.25), 0 10px 28px rgba(0, 0, 0, 0.15)",
          zIndex: 2,
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Companion Portrait"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #A78BFA 0%, #F4A261 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
            }}
          >
            ✨
          </div>
        )}
      </div>

      {/* Handcrafted Antique Gold Baroque Wall Mirror Frame */}
      <svg
        viewBox="0 0 340 430"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 4,
          pointerEvents: "none",
          filter: "drop-shadow(0 14px 30px rgba(120, 53, 15, 0.3))",
        }}
      >
        <defs>
          <linearGradient id="goldGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="20%" stopColor="#FDE047" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="90%" stopColor="#92400E" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          <linearGradient id="goldBevelLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          <filter id="goldShine" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="1" dy="3" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.35" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Baroque Arch Frame Body */}
        <path
          d="M 170 38 
             C 225 38, 275 60, 290 105 
             C 305 150, 300 260, 292 310 
             C 285 365, 235 402, 170 406 
             C 105 402, 55 365, 48 310 
             C 40 260, 35 150, 50 105 
             C 65 60, 115 38, 170 38 Z"
          fill="none"
          stroke="url(#goldGradientMain)"
          strokeWidth="18"
          strokeLinejoin="round"
        />

        {/* Inner Gold Bevel Rim */}
        <path
          d="M 170 48 
             C 216 48, 260 68, 272 108 
             C 284 148, 280 252, 274 298 
             C 268 348, 224 384, 170 388 
             C 116 384, 72 348, 66 298 
             C 60 252, 56 148, 68 108 
             C 80 68, 124 48, 170 48 Z"
          fill="none"
          stroke="url(#goldBevelLight)"
          strokeWidth="5"
        />

        {/* Top Ornate Victorian Rococo Crown Crest */}
        <g id="topCrest" filter="url(#goldShine)">
          {/* Central Finial Palmette */}
          <path
            d="M 170 10 
               C 180 22, 196 28, 202 38 
               C 188 40, 176 34, 170 42 
               C 164 34, 152 40, 138 38 
               C 144 28, 160 22, 170 10 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />

          {/* Left Arch Scroll & Acanthus */}
          <path
            d="M 170 40 
               C 140 20, 105 16, 85 35 
               C 74 44, 70 60, 80 72 
               C 92 82, 110 76, 115 62 
               C 120 48, 142 46, 170 50"
            fill="none"
            stroke="url(#goldGradientMain)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Right Arch Scroll & Acanthus */}
          <path
            d="M 170 40 
               C 200 20, 235 16, 255 35 
               C 266 44, 270 60, 260 72 
               C 248 82, 230 76, 225 62 
               C 220 48, 198 46, 170 50"
            fill="none"
            stroke="url(#goldGradientMain)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Golden Rosette Center Jewel */}
          <circle cx="170" cy="42" r="9" fill="url(#goldBevelLight)" stroke="#FFFBEB" strokeWidth="2" />
          <circle cx="170" cy="42" r="3.5" fill="#FFFBEB" />
        </g>

        {/* Side Baroque Scroll Carvings (Left) */}
        <g id="leftScrolls">
          <path
            d="M 42 145 
               C 22 162, 18 190, 32 210 
               C 42 222, 60 216, 62 200 
               C 64 182, 50 172, 50 155 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />
          <path
            d="M 38 255 
               C 18 272, 16 300, 32 320 
               C 44 332, 60 322, 60 306 
               C 60 288, 46 280, 46 264 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />
        </g>

        {/* Side Baroque Scroll Carvings (Right) */}
        <g id="rightScrolls">
          <path
            d="M 298 145 
               C 318 162, 322 190, 308 210 
               C 298 222, 280 216, 278 200 
               C 276 182, 290 172, 290 155 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />
          <path
            d="M 302 255 
               C 322 272, 324 300, 308 320 
               C 296 332, 280 322, 280 306 
               C 280 288, 294 280, 294 264 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="1.5"
          />
        </g>

        {/* Bottom Baroque Pedestal Apron */}
        <g id="bottomApron" filter="url(#goldShine)">
          <path
            d="M 110 395 
               C 132 416, 155 425, 170 428 
               C 185 425, 208 416, 230 395 
               C 202 402, 170 404, 138 402 Z"
            fill="url(#goldGradientMain)"
            stroke="#FEF08A"
            strokeWidth="2"
          />
          <circle cx="170" cy="418" r="6" fill="url(#goldBevelLight)" stroke="#FFFBEB" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
