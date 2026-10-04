"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useUIStore } from "@/lib/store";

/**
 * Smooth scroll via Lenis.
 * RAF runs only while there is scroll momentum — idle pages stay quiet.
 */
export function useSmoothScroll() {
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setScrollProgress = useUIStore((s) => s.setScrollProgress);

  useEffect(() => {
    if (reducedMotion) return;

    let lenis: Lenis | null = null;
    let rafId = 0;
    let running = false;
    let lastProgress = -1;
    let startTimer = 0;

    const syncProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const next = max > 0 ? window.scrollY / max : 0;
      if (Math.abs(next - lastProgress) < 0.003) return;
      lastProgress = next;
      setScrollProgress(next);
    };

    const stopLoop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      running = false;
    };

    const loop = (time: number) => {
      if (!lenis) return;
      lenis.raf(time);
      syncProgress();
      if (Math.abs(lenis.velocity) < 0.08) {
        running = false;
        rafId = 0;
        syncProgress();
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    const ensureLoop = () => {
      if (running || !lenis) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    };

    startTimer = window.setTimeout(() => {
      lenis = new Lenis({
        duration: 0.7,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.35,
        autoRaf: false,
        anchors: true,
      });

      document.documentElement.classList.add("lenis", "lenis-smooth");
      lenis.on("scroll", syncProgress);
      syncProgress();

      window.addEventListener("wheel", ensureLoop, { passive: true });
      window.addEventListener("touchstart", ensureLoop, { passive: true });
      window.addEventListener("scroll", ensureLoop, { passive: true });
      window.addEventListener("keydown", ensureLoop);
    }, 50);

    return () => {
      window.clearTimeout(startTimer);
      stopLoop();
      window.removeEventListener("wheel", ensureLoop);
      window.removeEventListener("touchstart", ensureLoop);
      window.removeEventListener("scroll", ensureLoop);
      window.removeEventListener("keydown", ensureLoop);
      lenis?.destroy();
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
  }, [reducedMotion, setScrollProgress]);
}
