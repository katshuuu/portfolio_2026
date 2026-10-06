"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Laptop } from "@/components/3d/Laptop";

/**
 * Hero WebGL stage.
 * Pauses when the hero is offscreen or the tab is hidden.
 */
export function LaptopScene({
  interactive = true,
  onReady,
}: {
  interactive?: boolean;
  onReady?: () => void;
}) {
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>();
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const readySent = useRef(false);

  useEffect(() => {
    const hero = document.getElementById("hero") ?? document.body;
    setEventSource(hero);
    const io = new IntersectionObserver(
      ([entry]) => setOnScreen(Boolean(entry?.isIntersecting)),
      { threshold: 0.01 },
    );
    io.observe(hero);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const live = onScreen && tabVisible;

  const markReady = () => {
    if (readySent.current) return;
    readySent.current = true;
    onReady?.();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <Canvas
        dpr={1}
        camera={{ position: [1.55, 0.35, 8.2], fov: 30 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          stencil: false,
          depth: true,
        }}
        shadows={false}
        frameloop={live ? "always" : "never"}
        performance={{ min: 0.4, max: 1, debounce: 200 }}
        className="!bg-transparent"
        eventSource={eventSource}
        eventPrefix="client"
        aria-hidden
        onCreated={() => {
          // First GL frame is up — composition is usable
          requestAnimationFrame(() => markReady());
        }}
      >
        <Suspense fallback={null}>
          <Laptop interactive={interactive && live} />
        </Suspense>
      </Canvas>
    </div>
  );
}
