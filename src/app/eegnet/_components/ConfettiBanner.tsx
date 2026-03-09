"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = ["#3B82F6", "#F43F5E", "#22C55E", "#F59E0B", "#a855f7", "#6366F1", "#ec4899"];
const COUNT = 60;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  shape: "rect" | "circle";
}

export default function ConfettiBanner({ children }: { children?: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.4 },
    );
    const el = canvasRef.current?.parentElement;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const rect = cvs.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    cvs.width = W * dpr;
    cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.current = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W,
      y: -Math.random() * H * 0.5 - 10,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2 + 1.5,
      size: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.vx *= 0.999;
        p.rotation += p.rotSpeed;

        if (p.y > H + 20) {
          p.y = -10;
          p.x = Math.random() * W;
          p.vy = Math.random() * 2 + 1.5;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        if (p.shape === "rect") {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible]);

  return (
    <div className="relative rounded-xl overflow-hidden my-8 px-6 py-10 text-center" style={{ background: "linear-gradient(135deg, #EEF2FF, #FDF2F8)" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
