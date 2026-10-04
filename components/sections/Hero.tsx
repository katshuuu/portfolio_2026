"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { useUIStore } from "@/lib/store";

/**
 * HERO — Screen 1
 * Sticky pin + scroll dissolve into About (obsidianassembly.com mechanic):
 * PORTFOLIO sinks and fades while the stage darkens, then About takes over.
 * Pixel hover (postilny grid) runs per letter only.
 */

const LaptopScene = dynamic(
  () => import("@/components/3d/LaptopScene").then((m) => m.LaptopScene),
  { ssr: false }
);

export function Hero() {
  const prefersReduced = useReducedMotion();
  const reducedStore = useUIStore((s) => s.reducedMotion);
  const reduce = Boolean(prefersReduced || reducedStore);
  const [sceneReady, setSceneReady] = useState(false);
  const pinRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Boot WebGL after first interaction or a short delay — avoids opening hitch
  useEffect(() => {
    if (reduce) return;
    let done = false;
    const boot = () => {
      if (done) return;
      done = true;
      setSceneReady(true);
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("pointermove", boot);
      window.removeEventListener("wheel", boot);
      window.removeEventListener("touchstart", boot);
    };
    window.addEventListener("pointerdown", boot, { passive: true });
    window.addEventListener("pointermove", boot, { passive: true });
    window.addEventListener("wheel", boot, { passive: true });
    window.addEventListener("touchstart", boot, { passive: true });
    const timeoutId = window.setTimeout(boot, 2200);
    return () => {
      done = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", boot);
      window.removeEventListener("pointermove", boot);
      window.removeEventListener("wheel", boot);
      window.removeEventListener("touchstart", boot);
    };
  }, [reduce]);

  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const map = (p: number, a: number, b: number, from: number, to: number) => {
      if (p <= a) return from;
      if (p >= b) return to;
      return lerp(from, to, (p - a) / (b - a));
    };
    const easeOut = (t: number) => 1 - (1 - t) ** 2;

    let raf = 0;
    let active = true;
    let lastP = -1;
    const el = pinRef.current;
    const io = el
      ? new IntersectionObserver(
          ([entry]) => {
            active = Boolean(entry?.isIntersecting);
            if (active) schedule();
          },
          { threshold: 0 },
        )
      : null;
    if (el && io) io.observe(el);

    const update = () => {
      raf = 0;
      if (!active) return;
      const pin = pinRef.current;
      if (!pin) return;
      const rect = pin.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = reduce ? 0 : Math.min(1, Math.max(0, -rect.top / travel));
      if (Math.abs(p - lastP) < 0.001) return;
      lastP = p;
      const pe = easeOut(p);

      if (wordRef.current) {
        wordRef.current.style.opacity = String(map(p, 0.15, 0.82, 1, 0));
        wordRef.current.style.transform = `translate3d(0, ${p * 36}vh, 0)`;
      }
      if (bgRef.current) {
        bgRef.current.style.opacity = String(map(pe, 0.28, 0.98, 1, 0));
        bgRef.current.style.transform = `scale(${1 + pe * 0.045})`;
      }
      if (veilRef.current) {
        veilRef.current.style.opacity = String(map(p, 0.4, 0.98, 0, 0.35));
      }
      if (sceneRef.current) {
        sceneRef.current.style.opacity = String(map(p, 0.18, 0.85, 1, 0));
        sceneRef.current.style.transform = `translate3d(0, ${p * 10}vh, 0)`;
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      window.removeEventListener("scroll", schedule);
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, [reduce]);

  return (
    <div ref={pinRef} className="relative h-[140vh]">
      <section
        id="hero"
        className="sticky top-0 z-10 h-screen overflow-hidden"
        aria-label="Главный экран"
      >
        {/* blur 1 — hero-only background */}
        <div
          ref={bgRef}
          aria-hidden
          className="absolute inset-0 z-0 will-change-transform"
          style={{ transformOrigin: "center center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-blur.jpg"
            alt=""
            draggable={false}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full select-none object-cover"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, #000 0%, #000 48%, transparent 100%)",
              maskImage:
                "linear-gradient(to bottom, #000 0%, #000 48%, transparent 100%)",
            }}
          />
        </div>

        <PortfolioWord sinkRef={wordRef} />

        <div ref={sceneRef} className="absolute inset-0 z-10 will-change-transform">
          {!reduce && sceneReady ? (
            <LaptopScene interactive />
          ) : (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-[8%] z-10 mx-auto flex h-[min(42vh,380px)] w-[min(560px,92vw)] items-end justify-center"
              aria-hidden
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-portfolio.png"
                alt=""
                draggable={false}
                decoding="async"
                className="max-h-full w-auto max-w-full select-none object-contain opacity-90"
              />
            </div>
          )}
        </div>

        {/* Soft dissolve into the next screen — fades out before the edge */}
        <div
          ref={veilRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            opacity: 0,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.18) 42%, rgba(0,0,0,0.28) 68%, transparent 100%)",
          }}
        />
      </section>
    </div>
  );
}


function PortfolioWord({
  sinkRef,
}: {
  sinkRef: RefObject<HTMLDivElement>;
}) {
  return (
    <div className="absolute left-1/2 top-[38%] z-[6] w-screen -translate-x-1/2 -translate-y-1/2 px-3 sm:px-5">
      <div
        ref={sinkRef}
        className="portfolio-word relative mx-auto w-full max-w-none select-none will-change-transform"
        aria-label="PORTFOLIO — welcome to my Go backend developer"
      >
        <div className="portfolio-word__row" aria-hidden>
          <span className="portfolio-word__chunk portfolio-word__chunk--start">
            <span className="portfolio-word__aside portfolio-word__aside--top">
              welcome to my
            </span>
            <span className="portfolio-word__base">PORT</span>
          </span>
          <span className="portfolio-word__script">F</span>
          <span className="portfolio-word__chunk portfolio-word__chunk--end">
            <span className="portfolio-word__base">OLIO</span>
            <span className="portfolio-word__aside portfolio-word__aside--bottom">
              Go backend developer
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
