"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Laptop } from "@/components/3d/Laptop";

/**
 * Hero WebGL stage.
 * Pauses when the hero is offscreen or the tab is hidden.
 */
export function LaptopScene({ interactive = true }: { interactive?: boolean }) {
  const [eventSource, setEventSource] = useState<HTMLElement | undefined>();
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

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
      >
        <Suspense fallback={null}>
          <Laptop interactive={interactive && live} />
        </Suspense>
      </Canvas>
    </div>
  );
}
