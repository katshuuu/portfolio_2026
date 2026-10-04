"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useReducedMotionPref } from "@/hooks/useReducedMotionPref";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { SiteNav } from "@/components/layout/SiteNav";

const CustomCursor = dynamic(
  () => import("@/components/layout/CustomCursor").then((m) => m.CustomCursor),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  useReducedMotionPref();
  useSmoothScroll();
  const [cursorReady, setCursorReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setCursorReady(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <ScrollProgress />
      {cursorReady ? <CustomCursor /> : null}
      <SiteNav />
      {children}
    </>
  );
}
