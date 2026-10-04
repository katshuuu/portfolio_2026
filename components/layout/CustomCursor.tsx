"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/lib/store";

/**
 * Light pointer + trail. Keeps the cursor DOM transform sync on every move;
 * canvas trail uses a cheap single-path stroke and sleeps when idle.
 */

type TrailPoint = { x: number; y: number; life: number };

const TRAIL = "rgba(188, 202, 255,";
const MAX_POINTS = 16;
const LIFE_DECAY = 0.07;

function CursorLabel() {
  const label = useUIStore((s) => s.cursorLabel);
  if (!label) return null;
  return (
    <span className="absolute left-9 top-5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-[#E8E4FF] drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
      {label}
    </span>
  );
}

export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const root = rootRef.current;
    const cursor = cursorRef.current;
    const canvas = smokeRef.current;
    if (!root || !cursor || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    let mx = -100;
    let my = -100;
    let px = mx;
    let py = my;
    let visible = false;
    let raf = 0;
    let running = false;
    let needsClear = false;
    const trail: TrailPoint[] = [];

    const resize = () => {
      // Cap at 1× — trail is soft enough; halves fill/stroke cost on retina
      const dpr = 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pushPoint = (x: number, y: number) => {
      const last = trail[trail.length - 1];
      if (last && Math.hypot(x - last.x, y - last.y) < 4) return;
      trail.push({ x, y, life: 1 });
      if (trail.length > MAX_POINTS) trail.splice(0, trail.length - MAX_POINTS);
    };

    const loop = () => {
      if (trail.length === 0) {
        if (needsClear) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          needsClear = false;
        }
        running = false;
        raf = 0;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      needsClear = true;

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= LIFE_DECAY;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      if (trail.length > 1) {
        const head = trail[trail.length - 1];
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = `${TRAIL}${0.2 + head.life * 0.55})`;
        ctx.lineWidth = 4 + head.life * 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };

    const ensureLoop = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        root.style.opacity = "1";
        px = mx;
        py = my;
      }
      // Cursor tip updates immediately — never gated on canvas work
      cursor.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

      const dx = mx - px;
      const dy = my - py;
      if (dx * dx + dy * dy > 16) {
        pushPoint(mx, my);
        px = mx;
        py = my;
        ensureLoop();
      }
    };

    const onLeave = () => {
      visible = false;
      root.style.opacity = "0";
      trail.length = 0;
      if (needsClear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        needsClear = false;
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", resize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="custom-cursor pointer-events-none fixed inset-0 z-[200] opacity-0 transition-opacity duration-150"
      aria-hidden
    >
      <canvas ref={smokeRef} className="absolute inset-0" />
      <div ref={cursorRef} className="absolute left-0 top-0 will-change-transform">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/cursor-pointer.png"
          alt=""
          draggable={false}
          decoding="async"
          className="h-8 w-auto select-none"
          style={{ transform: "translate(-6.09%, -0.89%)" }}
        />
        <CursorLabel />
      </div>
    </div>
  );
}
