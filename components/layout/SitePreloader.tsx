"use client";

import { useEffect, useRef, useState } from "react";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { FingerLoading } from "@/components/layout/FingerLoading";

const CRITICAL_ASSETS = [
  "/images/hero-blur.jpg",
  "/images/hero-portfolio.webp",
  "/images/bgr.jpg",
  "/images/hello.webp",
  "/images/preloader/splash-bg.webp",
  "/images/preloader/finger-hand-only.webp",
  "/fonts/blue-screen.woff2",
  "/fonts/snell-roundhand.woff2",
  "/fonts/bristol.woff2",
  "/fonts/unageo-regular.woff2",
] as const;

const SPLASH_TEXT = "#E8E8E8";

function loadAsset(src: string): Promise<void> {
  return new Promise((resolve) => {
    const done = () => resolve();
    if (/\.(woff2?|ttf|otf)$/i.test(src)) {
      fetch(src)
        .then(() => done())
        .catch(() => done());
      return;
    }
    const img = new Image();
    img.onload = done;
    img.onerror = done;
    img.src = src;
  });
}

/**
 * Full-screen preload — original finger GIF (exact frames) + live progress %.
 */
export function SitePreloader() {
  const reduce = useUIStore((s) => s.reducedMotion);
  const sceneReady = useUIStore((s) => s.sceneReady);
  const markSiteReady = useUIStore((s) => s.markSiteReady);
  const [progress, setProgress] = useState(4);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const assetsDone = useRef(false);
  const windowDone = useRef(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setProgress(100);
    // Hold on 100% briefly, then crossfade: site rises under dissolving splash
    window.setTimeout(() => {
      markSiteReady();
      setLeaving(true);
      document.body.style.overflow = "";
      document.documentElement.classList.remove("is-preloading");
    }, 420);
    window.setTimeout(() => setGone(true), 1800);
  };

  useEffect(() => {
    if (gone) return;
    document.documentElement.classList.add("is-preloading");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.classList.remove("is-preloading");
      document.body.style.overflow = prev;
    };
  }, [gone]);

  useEffect(() => {
    let cancelled = false;

    const recompute = () => {
      if (cancelled || finished.current) return;
      let score = 0;
      if (assetsDone.current) score += 55;
      if (windowDone.current) score += 15;
      if (reduce || sceneReady) score += 25;
      setProgress((p) => Math.max(p, Math.min(score, 97)));
    };

    const boot = async () => {
      const total = CRITICAL_ASSETS.length;
      let n = 0;
      await Promise.all(
        CRITICAL_ASSETS.map(async (src) => {
          await loadAsset(src);
          n += 1;
          if (!cancelled) {
            setProgress((p) =>
              Math.max(p, Math.round((n / total) * 50) + 4),
            );
          }
        }),
      );
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }
      assetsDone.current = true;
      recompute();

      if (document.readyState === "complete") {
        windowDone.current = true;
        recompute();
      } else {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
          window.setTimeout(() => resolve(), 3500);
        });
        windowDone.current = true;
        recompute();
      }
    };

    void boot();

    const crawl = window.setInterval(() => {
      if (cancelled || finished.current) return;
      setProgress((p) => (p < 90 ? p + 0.4 : p));
    }, 180);

    return () => {
      cancelled = true;
      window.clearInterval(crawl);
    };
  }, [reduce, sceneReady]);

  useEffect(() => {
    if (reduce || sceneReady) {
      setProgress((p) => Math.max(p, 92));
    }
  }, [reduce, sceneReady]);

  useEffect(() => {
    if (finished.current || gone) return;

    const canFinish =
      progress >= 99 ||
      (progress >= 88 && (sceneReady || reduce) && assetsDone.current);

    if (!canFinish) return;
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, sceneReady, reduce, gone]);

  useEffect(() => {
    const cap = window.setTimeout(() => finish(), 8000);
    return () => window.clearTimeout(cap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If 3D never boots (error), don't wait forever once assets are in
  useEffect(() => {
    if (!assetsDone.current || finished.current) return;
    if (sceneReady || reduce) return;
    const soft = window.setTimeout(() => {
      if (!finished.current && assetsDone.current) finish();
    }, 4500);
    return () => window.clearTimeout(soft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneReady, reduce, progress]);

  if (gone) return null;

  const shown = Math.min(100, Math.round(progress));

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex flex-col items-center justify-center",
        leaving ? "pointer-events-none site-preloader--out" : "site-preloader--in",
      )}
      style={{
        backgroundColor: "#000",
        backgroundImage: "url(/images/preloader/splash-bg.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      role="status"
      aria-live="polite"
      aria-busy={!leaving}
      aria-label={`Загрузка сайта ${shown}%`}
    >
      <div
        className={cn(
          "relative flex flex-col items-center gap-5 px-4 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          leaving && "translate-y-3 scale-[1.02] opacity-0 blur-sm",
        )}
      >
        <FingerLoading reduced={reduce} className="w-[min(280px,70vw)]" />

        <div className="flex flex-col items-center gap-3">
          <p
            className="text-[18px] leading-none tracking-[0.06em]"
            style={{
              fontFamily: '"Pixelta", "Unageo", system-ui, sans-serif',
              color: SPLASH_TEXT,
            }}
          >
            Loading …
          </p>

          <div className="flex w-[min(200px,58vw)] flex-col items-center gap-2">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                style={{ width: `${shown}%` }}
              />
            </div>
            <p
              className="tabular-nums text-[12px] tracking-[0.14em] text-white/75"
              style={{
                fontFamily: '"Pixelta", "Unageo", system-ui, sans-serif',
              }}
            >
              {shown}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
