"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SiteNav } from "@/components/layout/SiteNav";
import { SitePreloader } from "@/components/layout/SitePreloader";
import { useUIStore } from "@/lib/store";

const CustomCursor = dynamic(
  () => import("@/components/layout/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  useReducedMotionPref();
  useSmoothScroll();
  const siteReady = useUIStore((s) => s.siteReady);
  const [cursorReady, setCursorReady] = useState(false);

  useEffect(() => {
    if (!siteReady) return;
    const id = window.setTimeout(() => setCursorReady(true), 40);
    return () => window.clearTimeout(id);
  }, [siteReady]);

  return (
    <>
      <SitePreloader />
      <div
        className="min-h-screen transition-[opacity,filter] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: siteReady ? 1 : 0,
          filter: siteReady ? "none" : "blur(8px)",
          visibility: siteReady ? "visible" : "hidden",
          pointerEvents: siteReady ? "auto" : "none",
        }}
        aria-hidden={!siteReady}
      >
        <ScrollProgress />
        {cursorReady ? <CustomCursor /> : null}
        <SiteNav />
        {children}
      </div>
    </>
  );
}
