"use client";

import { cn } from "@/lib/utils";

type FingerLoadingProps = {
  className?: string;
  reduced?: boolean;
};

/**
 * Source finger-tap mark with keyed-out lilac background for dark splash plates.
 */
export function FingerLoading({ className, reduced = false }: FingerLoadingProps) {
  return (
    <div className={cn("relative select-none", className)} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          reduced
            ? "/images/preloader/finger-hand-still.png"
            : "/images/preloader/finger-hand-only.webp"
        }
        alt=""
        width={240}
        height={160}
        draggable={false}
        className="mx-auto h-auto w-full max-w-[min(280px,70vw)]"
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}
