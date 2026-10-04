"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useUIStore } from "@/lib/store";

/**
 * THANKS — Screen 6
 *
 * MECHANIC REF: peachworlds robots + attached frame
 * Isolated full viewport — does not bleed into Contact.
 */

const RobotsScene = dynamic(
  () => import("@/components/3d/RobotsScene").then((m) => m.RobotsScene),
  { ssr: false }
);

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function Thanks() {
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);
  const [party, setParty] = useState(false);
  const [ready, setReady] = useState(false);
  const buffer = useRef<string[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      buffer.current = [...buffer.current, e.key].slice(-KONAMI.length);
      if (KONAMI.every((k, i) => buffer.current[i]?.toLowerCase() === k.toLowerCase())) {
        setParty(true);
        setTimeout(() => setParty(false), 8000);
        buffer.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      id="thanks"
      className="relative isolate z-0 h-[100svh] min-h-[640px] overflow-hidden"
      aria-label="Спасибо"
    >
      {/* 3D stage — clipped to this section only */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {ready ? (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-sky-900/50">
                Загрузка…
              </div>
            }
          >
            <RobotsScene party={party} />
          </Suspense>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="max-w-md text-sm text-sky-950/80 sm:text-base">
              AI переписывает будущее — вы держите перо или просто читаете историю?
            </p>
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-spin rounded-full border border-sky-900/15 border-t-sky-900/70" />
            </div>
          </div>
        )}
      </div>

      {/* Liquid floor shimmer under circular type */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[10%] z-[1] h-24 opacity-60"
        aria-hidden
        style={{
          background: "linear-gradient(to top, rgba(34,211,238,0.14), transparent 70%)",
          filter: "url(#thanksFloorWave)",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="thanksFloorWave">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.08" numOctaves="2" />
          <feDisplacementMap in="SourceGraphic" scale="8" />
        </filter>
      </svg>

      {/* Bottom chrome UI */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-sky-950/55 via-sky-950/15 to-transparent px-6 pb-8 pt-24 sm:px-10">
        <div className="pointer-events-auto mx-auto grid w-full max-w-6xl grid-cols-1 items-end gap-8 sm:grid-cols-[1.1fr_0.9fr]">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="font-display text-[clamp(2.2rem,5.5vw,4.2rem)] font-light leading-[0.95] tracking-tight text-sky-950"
          >
            Искусство, которое думает
          </motion.h2>

          <div className="flex flex-col sm:items-end sm:text-right">
            <p className="max-w-xs text-sm leading-relaxed text-sky-900/75">
              AI-формы, которые толкают digital art к краю. Почувствуйте эволюцию.
            </p>
            <div className="mt-4 flex items-center gap-3 sm:justify-end">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-sky-900/35 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-950 transition hover:bg-sky-950 hover:text-white"
                onMouseEnter={() => setCursorLabel("Смотреть")}
                onMouseLeave={() => setCursorLabel(null)}
              >
                Смотреть <ArrowUpRight size={14} />
              </a>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-950 backdrop-blur transition hover:bg-white/80"
                onMouseEnter={() => setCursorLabel("Вверх")}
                onMouseLeave={() => setCursorLabel(null)}
                aria-label="Наверх"
              >
                Наверх
              </button>
            </div>
          </div>
        </div>

        {party ? (
          <p className="mt-4 text-center font-mono text-xs text-cyan-700" role="status">
            Konami разблокирован — роботы сходят с ума
          </p>
        ) : null}
      </div>
    </section>
  );
}
