"use client";

import { useRef, useEffect, useCallback } from "react";

// ── Configuration ────────────────────────────────────────────────
const NODE_COUNT = 50;          // How many static nodes
const CONNECT_DIST = 150;       // Max distance to form a connection
const MOUSE_RADIUS = 50;        // Hover detection radius
const PACKET_SPEED = 0.015;     // How fast energy moves (0 to 1 progress per frame)
const MAX_DEPTH = 3;            // How many hops before energy dies out

// Colors
const COLOR_BG = "#fafafa";
const COLOR_NODE_IDLE = "rgba(190, 190, 195, 0.5)";
const COLOR_LINE = "rgba(190, 190, 195, 0.15)";
const COLOR_ENERGY: [number, number, number] = [255, 174, 46]; // Yellow

// ── Types ────────────────────────────────────────────────────────
interface StaticNode {
  id: number;
  x: number;
  y: number;
  r: number;
  connections: number[]; // Array of connected Node IDs
  pulse: number;         // 0 to 1 value for visual glow
}

interface EnergyPacket {
  id: number;
  startId: number;
  targetId: number;
  progress: number; // 0.0 to 1.0
  depth: number;    // Current hop count
}

// ── Helpers ──────────────────────────────────────────────────────
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rgb(c: [number, number, number], a: number) {
  return `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
}

// ══════════════════════════════════════════════════════════════════

export default function EnergyHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  
  // State refs
  const nodes = useRef<StaticNode[]>([]);
  const packets = useRef<EnergyPacket[]>([]);
  const packetIdCounter = useRef(0);
  const raf = useRef(0);

  // ── Initialization (Graph Building) ────────────────────────────
  const seed = useCallback((w: number, h: number) => {
    const newNodes: StaticNode[] = [];
    
    // 1. Scatter nodes randomly
    for (let i = 0; i < NODE_COUNT; i++) {
      newNodes.push({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 2,
        connections: [],
        pulse: 0,
      });
    }

    // 2. Build Connections (The Graph)
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const dx = newNodes[i].x - newNodes[j].x;
        const dy = newNodes[i].y - newNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If close enough, they are permanently connected
        if (dist < CONNECT_DIST) {
          newNodes[i].connections.push(newNodes[j].id);
          newNodes[j].connections.push(newNodes[i].id);
        }
      }
    }
    nodes.current = newNodes;
    packets.current = []; // Clear old packets on resize
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
      seed(rect.width, rect.height);
    }

    resize();
    window.addEventListener("resize", resize);

    // Helper to spawn packets from a specific node
    function spawnPackets(sourceId: number, depth: number, excludeId?: number) {
      if (depth >= MAX_DEPTH) return;
      
      const sourceNode = nodes.current.find((n) => n.id === sourceId);
      if (!sourceNode) return;

      // Make the source node pulse!
      sourceNode.pulse = 0.5;

      // Send a packet to all connected neighbors
      for (const neighborId of sourceNode.connections) {
        if (neighborId === excludeId) continue; // Don't send energy backwards

        packets.current.push({
          id: packetIdCounter.current++,
          startId: sourceId,
          targetId: neighborId,
          progress: 0,
          depth: depth + 1,
        });
      }
    }

    function frame() {
      const w = cvs!.getBoundingClientRect().width;
      const h = cvs!.getBoundingClientRect().height;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      ctx.clearRect(0, 0, w, h);
      
      const currentNodes = nodes.current;
      
      // 1. Check Mouse Hover to initiate reaction
      for (const node of currentNodes) {
        const dx = mx - node.x;
        const dy = my - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Trigger if hovered AND not already pulsing
        if (dist < MOUSE_RADIUS && node.pulse <= 0.1) {
          spawnPackets(node.id, 0);
        }
      }

      // 2. Draw static connections (Edges)
      ctx.beginPath();
      ctx.strokeStyle = COLOR_LINE;
      ctx.lineWidth = 1;
      for (const node of currentNodes) {
        for (const neighborId of node.connections) {
          if (node.id < neighborId) { // Prevent drawing same line twice
            const neighbor = currentNodes.find((n) => n.id === neighborId);
            if (neighbor) {
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(neighbor.x, neighbor.y);
            }
          }
        }
      }
      ctx.stroke();

      // 3. Update & Draw Energy Packets
    for (let i = packets.current.length - 1; i >= 0; i--) {
        const p = packets.current[i];
        const startNode = currentNodes.find((n) => n.id === p.startId);
        const targetNode = currentNodes.find((n) => n.id === p.targetId);
    
        if (!startNode || !targetNode) {
        packets.current.splice(i, 1);
        continue;
        }
    
        // Move packet forward
        p.progress += PACKET_SPEED;
    
        // Calculate smooth fade-in/fade-out. Math.PI = half-circle
        // As progress goes 0 -> 1, fade goes 0 -> 1 -> 0
        const fade = Math.sin(p.progress * Math.PI);
    
        // Calculate exact pixel position using linear interpolation
        const currentX = lerp(startNode.x, targetNode.x, p.progress);
        const currentY = lerp(startNode.y, targetNode.y, p.progress);
    
        // Draw packet
        ctx.beginPath();
        ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        ctx.fillStyle = rgb(COLOR_ENERGY, 0.8 * fade); 
        ctx.fill();
        
        // Packet glow
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        ctx.fillStyle = rgb(COLOR_ENERGY, 0.2 * fade); 
        ctx.fill();
    
        // Check if packet reached destination
        if (p.progress >= 1) {
        // Trigger chain reaction from the target!
        spawnPackets(targetNode.id, p.depth, startNode.id);
        // Remove dead packet
        packets.current.splice(i, 1);
        }
    }

      // 4. Draw Nodes
      for (const node of currentNodes) {
        // Decrease pulse over time (fade out)
        if (node.pulse > 0) {
          node.pulse -= 0.02; 
        }

        ctx.beginPath();
        // Slightly increase size if pulsing
        ctx.arc(node.x, node.y, node.r + (node.pulse * 2), 0, Math.PI * 2); 
        
        // Blend idle color with active magenta based on pulse state
        if (node.pulse > 0) {
          ctx.fillStyle = rgb(COLOR_ENERGY, Math.max(0.2, node.pulse));
        } else {
          ctx.fillStyle = COLOR_NODE_IDLE;
        }
        ctx.fill();
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
      className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden"
      style={{ background: COLOR_BG }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Text overlay — pointer-events-none so canvas interactions work */}
      <div className="relative z-10 pointer-events-none max-w-3xl px-6 md:px-12 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
          Transfer Learning: Reusing Intelligence in EEG Decoding
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-slate-500 max-w-2xl mx-auto">
          The purpose of this interactive article is to understand transfer learning and its applications to EEG waveform decoding.
          The <a href="https://github.com/xueqiy16/eegnet-/tree/main" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 pointer-events-auto">corresponding code</a> for this project will be explained.
          Have fun!
        </p>
      </div>
    </header>
  );
}