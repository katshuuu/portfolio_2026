"use client";

import { useUIStore } from "@/lib/store";

export function ScrollProgress() {
  const progress = useUIStore((s) => s.scrollProgress);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[90] h-[2px] bg-transparent"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Прогресс прокрутки"
    >
      <div
        className="h-full origin-left bg-accent transition-transform duration-75"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
