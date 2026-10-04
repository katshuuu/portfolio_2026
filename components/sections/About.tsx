"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from "@/lib/store";

/**
 * ABOUT — Screen 2
 * Figma node 153-3: ornate frame + hello + Unageo bio + swaying metallic cursor.
 */

const BIO = [
  <>
    Меня зовут <em>Катя</em>, мне 20, я студентка и начинающий Go-разработчик. Мой путь в
    IT начался с любопытства и робототехники, со временем превращаясь в
    осознанное желание строить сложные backend-системы.
  </>,
  <>
    Основной стек - Go, поскольку его простота, скорость и логика подкупили с
    самого начала. Верю, что рост начинается там, где заканчивается зона
    комфорта, поэтому не боюсь браться за сложные (на первый взгляд) задачи, и
    спокойно задаю вопросы, когда что-то непонятно. Готова{" "}
    <span className="text-[#B8B4E8]">учиться</span>, ошибаться и, разумеется,{" "}
    <span className="text-[#B8B4E8]">расти дальше!</span>)
  </>,
  <>
    Ищу команду, где можно развиваться и приносить пользу: открыта к
    стажировкам, junior-позициям и интересным совместным проектам. Буду рада
    знакомству!
  </>,
];

export function About() {
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);
  const [dividerPos, setDividerPos] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const [frameHeight, setFrameHeight] = useState<number | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const col = textColRef.current;
    if (!col) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      setFrameHeight(mq.matches ? col.getBoundingClientRect().height : null);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(col);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, []);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setDividerPos(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    setCursorLabel("Тянуть");
    updateFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    setCursorLabel(null);
  };

  return (
    <section
      id="about"
      className="relative z-20 -mt-[28vh] min-h-screen overflow-hidden px-6 pb-36 pt-[32vh]"
      aria-label="Обо мне"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 lg:max-w-none lg:flex-row lg:items-start lg:justify-center lg:gap-16">
        <div>
          <div
            className={
              frameHeight
                ? "relative"
                : "relative mx-auto aspect-[516/690] w-full max-w-md"
            }
            style={
              frameHeight
                ? { height: frameHeight, width: frameHeight * (516 / 690) }
                : undefined
            }
          >
            <div
              ref={frameRef}
              className="absolute cursor-ew-resize select-none overflow-hidden bg-bg-elevated touch-none"
              style={{
                left: "21.12%",
                top: "16.38%",
                width: "57.17%",
                height: "66.96%",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              role="slider"
              aria-label="Переключатель между реальным и cyber фото"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(dividerPos)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") setDividerPos((p) => Math.max(0, p - 4));
                if (e.key === "ArrowRight") setDividerPos((p) => Math.min(100, p + 4));
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - dividerPos}% 0 0)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/about-real.jpg"
                  alt="Вид на Казанский собор из кафе"
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/80 drop-shadow">
                  Real
                </span>
              </div>

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${dividerPos}%)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/about-cyber.jpg"
                  alt="Cyberpunk-версия кафе с видом на город"
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
                <span className="absolute right-3 top-3 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/90 drop-shadow">
                  Cyber
                </span>
              </div>

              <div
                className="absolute top-0 z-10 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-transparent via-[#E8E8E8] to-transparent"
                style={{ left: `${dividerPos}%` }}
              >
                <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#E8E8E8] bg-black/70 shadow-[0_0_24px_rgba(232,232,232,0.35)]">
                  <div className="flex gap-0.5">
                    <div className="h-3.5 w-0.5 rounded-full bg-[#E8E8E8]" />
                    <div className="h-3.5 w-0.5 rounded-full bg-[#E8E8E8]" />
                  </div>
                </div>
              </div>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/photo-frame.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 h-full w-full select-none object-contain"
              draggable={false}
            />
          </div>
        </div>

        <div ref={textColRef} className="relative flex w-full max-w-[633px] flex-col items-end">
          <div className="relative w-full max-w-[613px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hello.png?v=3"
                alt="hello"
                className="w-full max-w-[613px] select-none object-contain"
                draggable={false}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/metallic-cursor.png"
                alt=""
                aria-hidden
                className="about-cursor-sway pointer-events-none absolute -bottom-[8%] right-[6%] z-10 w-[min(126px,22%)] select-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
                draggable={false}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="mt-8 flex w-full max-w-[633px] flex-col gap-6 px-5 pb-0 pt-5 text-justify text-[23px] leading-[30px] tracking-[0.07em] text-[#E8E8E8] sm:px-6 sm:pt-6"
            style={{ fontFamily: '"Unageo", system-ui, sans-serif' }}
          >
            {BIO.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
