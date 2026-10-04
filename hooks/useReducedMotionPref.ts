"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/store";

export function useReducedMotionPref() {
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setReducedMotion]);
}
