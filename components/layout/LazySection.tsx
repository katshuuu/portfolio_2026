"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mounts children only when near the viewport — keeps first paint light.
 */
export function LazySection({
  children,
  rootMargin = "280px 0px",
  minHeight = "40vh",
}: {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || show) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, show]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
