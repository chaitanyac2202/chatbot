import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  isTrail?: boolean;
}

// Sophisticated minimal black & charcoal palette
const BLACK_PALETTE = [
  '#000000', // Pure black
  '#0f172a', // Deep slate black
  '#1e293b', // Charcoal slate
  '#334155'  // Neutral dark graphite
];

export const NeonCursorParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      isMoving: false,
      speed: 0
    };

    let idleTimer: any = null;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Ambient floating small black particles
    const ambientCount = Math.min(60, Math.floor((width * height) / 22000));
    const ambientParticles: Particle[] = [];

    for (let i = 0; i < ambientCount; i++) {
      const color = BLACK_PALETTE[Math.floor(Math.random() * BLACK_PALETTE.length)];
      ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 1.2 + 0.8, // Small, delicate black dots (0.8px - 2px)
        baseSize: Math.random() * 1.2 + 0.8,
        color,
        alpha: Math.random() * 0.45 + 0.25,
        life: 1,
        maxLife: 1,
        isTrail: false
      });
    }

    // Interactive cursor trail particles
    const trailParticles: Particle[] = [];

    const addCursorParticles = (x: number, y: number, count = 2) => {
      for (let i = 0; i < count; i++) {
        const color = BLACK_PALETTE[Math.floor(Math.random() * BLACK_PALETTE.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.8 + 0.4;

        trailParticles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.3,
          size: Math.random() * 1.4 + 1.0, // Small black trail dots (1.0px - 2.4px)
          baseSize: Math.random() * 1.4 + 1.0,
          color,
          alpha: 0.85,
          life: 0,
          maxLife: Math.random() * 40 + 25,
          isTrail: true
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.x;
      const dy = e.clientY - mouse.y;
      mouse.speed = Math.sqrt(dx * dx + dy * dy);

      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isMoving = true;

      // Spawn small black particles when cursor glides
      const particlesToSpawn = Math.min(3, Math.max(1, Math.floor(mouse.speed / 10)));
      addCursorParticles(e.clientX, e.clientY, particlesToSpawn);

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mouse.isMoving = false;
      }, 120);
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.isMoving = false;
    };

    const handleClick = (e: MouseEvent) => {
      // Subtle, crisp burst of small black micro-dots on click
      for (let i = 0; i < 16; i++) {
        const color = BLACK_PALETTE[Math.floor(Math.random() * BLACK_PALETTE.length)];
        const angle = (Math.PI * 2 * i) / 16 + (Math.random() - 0.5) * 0.3;
        const speed = Math.random() * 3.5 + 1.5;

        trailParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 1.6 + 1.0,
          baseSize: Math.random() * 1.6 + 1.0,
          color,
          alpha: 0.9,
          life: 0,
          maxLife: Math.random() * 45 + 30,
          isTrail: true
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Delicate minimal connection lines between ambient particles and cursor
      for (let i = 0; i < ambientParticles.length; i++) {
        const p1 = ambientParticles[i];

        // Connection to cursor
        const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
        if (distToMouse < 130) {
          const lineAlpha = (1 - distToMouse / 130) * 0.22;
          ctx.strokeStyle = `rgba(15, 23, 42, ${lineAlpha})`;
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();

          // Gentle magnetic pull towards cursor
          p1.x += (mouse.x - p1.x) * 0.012;
          p1.y += (mouse.y - p1.y) * 0.012;
        }

        // Connection between neighbouring particles
        for (let j = i + 1; j < ambientParticles.length; j++) {
          const p2 = ambientParticles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 95) {
            const lineAlpha = (1 - dist / 95) * 0.09;
            ctx.strokeStyle = `rgba(15, 23, 42, ${lineAlpha})`;
            ctx.lineWidth = 0.55;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Draw Ambient Small Black Particles
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Interactive Cursor Trail Particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.life++;

        const progress = p.life / p.maxLife;
        p.alpha = Math.max(0, 0.85 * (1 - progress));
        p.size = p.baseSize * (1 - progress * 0.5);

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;

        if (p.life >= p.maxLife || p.alpha <= 0) {
          trailParticles.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.4, p.size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(idleTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
