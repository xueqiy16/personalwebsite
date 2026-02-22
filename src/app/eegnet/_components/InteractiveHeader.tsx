"use client";

import { useRef, useEffect, useCallback } from "react";

// ── Configuration ────────────────────────────────────────────────
const PARTICLE_COUNT = 90;
const CONNECT_DIST = 120;
const CURSOR_RADIUS = 180;
const GRAVITY_STRENGTH = 0.012;
const BASE_SPEED = 0.3;
const MAGENTA: [number, number, number] = [232, 28, 255]; // #e81cff
const GRAY: [number, number, number] = [190, 190, 195];

// ── Types ────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

// ── Helpers ──────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rgb(c: [number, number, number], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}

function randomBetween(lo: number, hi: number) {
  return lo + Math.random() * (hi - lo);
}

// ══════════════════════════════════════════════════════════════════

export default function InteractiveHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const particles = useRef<Particle[]>([]);
  const raf = useRef(0);

  // ── Seed particles ─────────────────────────────────────────────
  const seed = useCallback((w: number, h: number) => {
    const arr: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * BASE_SPEED,
        vy: Math.sin(angle) * BASE_SPEED,
        r: randomBetween(1.5, 3),
      });
    }
    particles.current = arr;
  }, []);

  // ── Animation loop ─────────────────────────────────────────────
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const rect = cvs!.getBoundingClientRect();
      cvs!.width = rect.width * dpr;
      cvs!.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particles.current.length === 0) seed(rect.width, rect.height);
    }

    resize();
    window.addEventListener("resize", resize);

    function frame() {
      const w = cvs!.getBoundingClientRect().width;
      const h = cvs!.getBoundingClientRect().height;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      ctx.clearRect(0, 0, w, h);

      const pts = particles.current;

      // Update positions
      for (const p of pts) {
        // Cursor gravity
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CURSOR_RADIUS && dist > 1) {
          const force = (1 - dist / CURSOR_RADIUS) * GRAVITY_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Gentle friction
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Clamp speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > BASE_SPEED * 3) {
          p.vx = (p.vx / speed) * BASE_SPEED * 3;
          p.vy = (p.vy / speed) * BASE_SPEED * 3;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }

      // Draw connections
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > CONNECT_DIST) continue;

          const midX = (pts[i].x + pts[j].x) / 2;
          const midY = (pts[i].y + pts[j].y) / 2;
          const toCursor = Math.sqrt(
            (midX - mx) * (midX - mx) + (midY - my) * (midY - my),
          );

          const proximity = Math.max(0, 1 - toCursor / CURSOR_RADIUS);
          const baseAlpha = (1 - d / CONNECT_DIST) * 0.12;
          const glowAlpha = (1 - d / CONNECT_DIST) * proximity * 0.6;
          const alpha = baseAlpha + glowAlpha;

          const color: [number, number, number] = [
            lerp(GRAY[0], MAGENTA[0], proximity),
            lerp(GRAY[1], MAGENTA[1], proximity),
            lerp(GRAY[2], MAGENTA[2], proximity),
          ];

          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = rgb(color, alpha);
          ctx.lineWidth = 0.8 + proximity * 0.6;
          ctx.stroke();
        }
      }

      // Draw particles
      for (const p of pts) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        const proximity = Math.max(0, 1 - d / CURSOR_RADIUS);

        const baseAlpha = 0.2;
        const alpha = baseAlpha + proximity * 0.8;

        const color: [number, number, number] = [
          lerp(GRAY[0], MAGENTA[0], proximity),
          lerp(GRAY[1], MAGENTA[1], proximity),
          lerp(GRAY[2], MAGENTA[2], proximity),
        ];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + proximity * 2, 0, Math.PI * 2);
        ctx.fillStyle = rgb(color, alpha);
        ctx.fill();

        // Glow halo near cursor
        if (proximity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + proximity * 6, 0, Math.PI * 2);
          ctx.fillStyle = rgb(MAGENTA, proximity * 0.12);
          ctx.fill();
        }
      }

      raf.current = requestAnimationFrame(frame);
    }

    raf.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [seed]);

  // ── Mouse tracking ─────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouse.current = { x: -9999, y: -9999 };
  }, []);

  return (
    <header
      className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden"
      style={{ background: "#fafafa" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Neural mesh canvas — fills the entire header */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Text overlay — pointer-events-none so canvas interactions work */}
      <div className="relative z-10 pointer-events-none max-w-3xl px-6 md:px-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight text-slate-900 mb-6">
          Understanding EEGNet from Scratch: A NumPy-only implementation for P300
          detection
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto">
          This implementation is designed to be educational and mathematically
          correct. It demonstrates how a convolutional neural network learns to
          detect Event-Related Potentials (ERPs) like the P300 from
          multi-channel EEG data.
        </p>
      </div>
    </header>
  );
}
