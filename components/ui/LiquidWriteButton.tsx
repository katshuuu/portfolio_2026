"use client";

import { useEffect, useRef } from "react";

/**
 * Figma «написать мне» (Group 29) + waaark liquid canvas.
 * Cream blob, corner handles, hairlines, right stub + black dot.
 */

const CREAM = "#F9EAC1";
const CREAM_DEEP = "#E8D4A0";
const HANDLE = "#F5F5F5";

type Point = {
  x: number;
  y: number;
  ix: number;
  iy: number;
  vx: number;
  vy: number;
  level: number;
};

type LiquidWriteButtonProps = {
  href: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
};

export function LiquidWriteButton({
  href,
  onMouseEnter,
  onMouseLeave,
  className = "",
}: LiquidWriteButtonProps) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const button = rootRef.current;
    const canvas = canvasRef.current;
    if (!button || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const points = 8;
    const viscosity = 20;
    const mouseDist = 70;
    const damping = 0.05;
    const pad = 50;

    let pointsA: Point[] = [];
    let pointsB: Point[] = [];
    let rafID = 0;
    let speedTimer = 0;

    let mouseX = 0;
    let mouseY = 0;
    let relMouseX = 0;
    let relMouseY = 0;
    let mouseLastX = 0;
    let mouseLastY = 0;
    let mouseDirectionX = 0;
    let mouseDirectionY = 0;
    let mouseSpeedX = 0;
    let mouseSpeedY = 0;

    const makePoint = (x: number, y: number, level: number): Point => ({
      x: pad + x,
      y: pad + y,
      ix: pad + x,
      iy: pad + y,
      vx: 0,
      vy: 0,
      level,
    });

    const addPoints = (x: number, y: number) => {
      pointsA.push(makePoint(x, y, 1));
      pointsB.push(makePoint(x, y, 2));
    };

    /**
     * Sharp rectangle topology (90° corners like Figma Group 29).
     * Points sit on the edges so the resting blob is a crisp rect;
     * hover still liquifies via viscosity.
     */
    const layoutPoints = (buttonWidth: number, buttonHeight: number) => {
      pointsA = [];
      pointsB = [];

      // Top edge: left → right
      addPoints(0, 0);
      for (let j = 1; j < points; j++) {
        addPoints((buttonWidth / points) * j, 0);
      }
      addPoints(buttonWidth, 0);

      // Right edge (extra mid for liquid pull)
      for (let j = 1; j < points; j++) {
        addPoints(buttonWidth, (buttonHeight / points) * j);
      }
      addPoints(buttonWidth, buttonHeight);

      // Bottom edge: right → left
      for (let j = points - 1; j > 0; j--) {
        addPoints((buttonWidth / points) * j, buttonHeight);
      }
      addPoints(0, buttonHeight);

      // Left edge
      for (let j = points - 1; j > 0; j--) {
        addPoints(0, (buttonHeight / points) * j);
      }
    };

    const movePoint = (p: Point) => {
      p.vx += (p.ix - p.x) / (viscosity * p.level);
      p.vy += (p.iy - p.y) / (viscosity * p.level);

      const dx = p.ix - relMouseX;
      const dy = p.iy - relMouseY;
      const relDist = 1 - Math.sqrt(dx * dx + dy * dy) / mouseDist;

      if (
        (mouseDirectionX > 0 && relMouseX > p.x) ||
        (mouseDirectionX < 0 && relMouseX < p.x)
      ) {
        if (relDist > 0 && relDist < 1) {
          p.vx = (mouseSpeedX / 4) * relDist;
        }
      }
      p.vx *= 1 - damping;
      p.x += p.vx;

      if (
        (mouseDirectionY > 0 && relMouseY > p.y) ||
        (mouseDirectionY < 0 && relMouseY < p.y)
      ) {
        if (relDist > 0 && relDist < 1) {
          p.vy = (mouseSpeedY / 4) * relDist;
        }
      }
      p.vy *= 1 - damping;
      p.y += p.vy;
    };

    const drawGroup = (group: Point[], fillStyle: string | CanvasGradient) => {
      if (!group.length) return;
      context.fillStyle = fillStyle;
      context.beginPath();
      context.moveTo(group[0].x, group[0].y);
      for (let i = 1; i < group.length; i++) {
        context.lineTo(group[i].x, group[i].y);
      }
      context.closePath();
      context.fill();
    };

    const renderCanvas = () => {
      rafID = requestAnimationFrame(renderCanvas);

      const w = canvas.width;
      const h = canvas.height;
      context.clearRect(0, 0, w, h);

      for (let i = 0; i < pointsA.length; i++) {
        movePoint(pointsA[i]);
        movePoint(pointsB[i]);
      }

      const rect = canvas.getBoundingClientRect();
      const gradientX = Math.min(Math.max(mouseX - rect.left, 0), w);
      const gradientY = Math.min(Math.max(mouseY - rect.top, 0), h);
      const distance =
        Math.sqrt(
          Math.pow(gradientX - w / 2, 2) + Math.pow(gradientY - h / 2, 2),
        ) /
        Math.sqrt(Math.pow(w / 2, 2) + Math.pow(h / 2, 2));

      const gradient = context.createRadialGradient(
        gradientX,
        gradientY,
        300 + 300 * distance,
        gradientX,
        gradientY,
        0,
      );
      gradient.addColorStop(0, CREAM_DEEP);
      gradient.addColorStop(1, CREAM);

      drawGroup(pointsA, CREAM_DEEP);
      drawGroup(pointsB, gradient);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseX < e.clientX) mouseDirectionX = 1;
      else if (mouseX > e.clientX) mouseDirectionX = -1;
      else mouseDirectionX = 0;

      if (mouseY < e.clientY) mouseDirectionY = 1;
      else if (mouseY > e.clientY) mouseDirectionY = -1;
      else mouseDirectionY = 0;

      mouseX = e.clientX;
      mouseY = e.clientY;

      const rect = canvas.getBoundingClientRect();
      relMouseX = mouseX - rect.left;
      relMouseY = mouseY - rect.top;
    };

    const tickSpeed = () => {
      mouseSpeedX = mouseX - mouseLastX;
      mouseSpeedY = mouseY - mouseLastY;
      mouseLastX = mouseX;
      mouseLastY = mouseY;
      speedTimer = window.setTimeout(tickSpeed, 50);
    };

    const sizeCanvas = () => {
      const buttonWidth = button.clientWidth;
      const buttonHeight = button.clientHeight;
      canvas.width = buttonWidth + pad * 2;
      canvas.height = buttonHeight + pad * 2;
      layoutPoints(buttonWidth, buttonHeight);
    };

    sizeCanvas();
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    tickSpeed();
    renderCanvas();

    const ro = new ResizeObserver(() => sizeCanvas());
    ro.observe(button);

    return () => {
      cancelAnimationFrame(rafID);
      clearTimeout(speedTimer);
      document.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
    };
  }, []);

  return (
    <a
      ref={rootRef}
      href={href}
      className={`btn-liquid relative inline-block h-[52px] w-[min(248px,72vw)] select-none no-underline ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label="написать мне"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute -inset-[50px] z-[1]"
        aria-hidden
      />

      <span className="inner relative z-[2] flex h-full w-full items-center justify-center px-3">
        {/* Exact Figma lettering */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/contact/btn-write-text.png?v=2"
          alt=""
          className="pointer-events-none h-[48%] w-auto max-w-[90%] select-none object-contain"
          draggable={false}
        />
      </span>

      {/* Figma chrome — exact Group 29 decorations */}
      <span className="pointer-events-none absolute inset-0 z-[3]" aria-hidden>
        {/* top / bottom hairlines */}
        <span
          className="absolute left-0 right-0 top-0 h-px"
          style={{ background: HANDLE }}
        />
        <span
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: HANDLE }}
        />
        {/* side hairlines */}
        <span
          className="absolute bottom-0 left-0 top-0 w-px"
          style={{ background: "rgba(245,245,245,0.65)" }}
        />
        <span
          className="absolute bottom-0 right-0 top-0 w-px"
          style={{ background: "rgba(245,245,245,0.65)" }}
        />

        {/* corner squares (centered on corners) */}
        <span
          className="absolute left-0 top-0 size-[8px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: HANDLE }}
        />
        <span
          className="absolute right-0 top-0 size-[8px] translate-x-1/2 -translate-y-1/2"
          style={{ background: HANDLE }}
        />
        <span
          className="absolute bottom-0 left-0 size-[8px] -translate-x-1/2 translate-y-1/2"
          style={{ background: HANDLE }}
        />
        <span
          className="absolute bottom-0 right-0 size-[8px] translate-x-1/2 translate-y-1/2"
          style={{ background: HANDLE }}
        />
      </span>
    </a>
  );
}
