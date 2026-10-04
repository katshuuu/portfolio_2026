"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Vertical offset in px before reveal */
  y?: number;
  duration?: number;
  once?: boolean;
};

/**
 * Soft fade + rise on scroll.
 * Visible during SSR / before hydration so the page never looks empty.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.75,
  once = true,
}: RevealProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (reduce) return;

    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    let hasArmed = false;

    const show = () => {
      if (cancelled) return;
      setVisible(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (cancelled || !entry) return;
        if (entry.isIntersecting) {
          show();
          if (once) io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );

    io.observe(el);

    const armTimer = window.setTimeout(() => {
      if (cancelled || hasArmed) return;
      hasArmed = true;
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.9 &&
        rect.bottom > window.innerHeight * 0.1;
      setAnimate(true);
      if (inView) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }, 60);

    return () => {
      cancelled = true;
      window.clearTimeout(armTimer);
      io.disconnect();
    };
  }, [reduce, once]);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
    transition: animate
      ? `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`
      : undefined,
  };

  return (
    <div ref={ref} className={cn(className)} style={style}>
      {children}
    </div>
  );
}
