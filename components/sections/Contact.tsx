"use client";

import dynamic from "next/dynamic";
import { SITE } from "@/lib/constants";
import { useUIStore } from "@/lib/store";
import { LiquidWriteButton } from "@/components/ui/LiquidWriteButton";
import { Reveal } from "@/components/ui/Reveal";

/**
 * CONTACT — final screen
 * Figma node 197-22 + wtfruchit.com footer physics (Matter.js):
 * star / social tiles / heart fall with gravity, bounce, collide,
 * and fling when grabbed by the cursor.
 */

const ContactPhysicsToys = dynamic(
  () =>
    import("@/components/sections/ContactPhysicsToys").then(
      (m) => m.ContactPhysicsToys,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="relative z-10 mt-2 h-[min(42vh,360px)] w-full"
        aria-hidden
      />
    ),
  },
);

/** Bulb centroids from garland.png (1024×186), as % of image box. */
const GARLAND_BULBS = [
  { left: 9.39, top: 44.37 },
  { left: 12.91, top: 50.47 },
  { left: 15.1, top: 73.14 },
  { left: 17.22, top: 57.82 },
  { left: 19.7, top: 75.28 },
  { left: 22.78, top: 67.57 },
  { left: 23.74, top: 77.28 },
  { left: 27.5, top: 74.3 },
  { left: 28.93, top: 79.34 },
  { left: 33.67, top: 81.42 },
  { left: 37.03, top: 88.54 },
  { left: 39.59, top: 81.34 },
  { left: 44.27, top: 92.59 },
  { left: 47.61, top: 81.5 },
  { left: 52.72, top: 96.73 },
  { left: 55.24, top: 77.39 },
  { left: 61.59, top: 96.57 },
  { left: 61.79, top: 73.43 },
  { left: 68.14, top: 96.59 },
  { left: 68.83, top: 61.68 },
  { left: 73.38, top: 94.45 },
  { left: 74.65, top: 52.32 },
  { left: 79.13, top: 92.46 },
  { left: 80.47, top: 41.44 },
  { left: 83.61, top: 90.48 },
  { left: 86.74, top: 29.19 },
  { left: 88.71, top: 88.34 },
  { left: 92.29, top: 12.33 },
  { left: 94.43, top: 85.07 },
] as const;

/** Fairy-light glow overlay — full viewport width, PNG side padding cropped out. */
function GarlandLights() {
  // Bulbs live ~9.4%…94.4% inside garland.png; scale so lights hit both edges.
  const bulbSpan = GARLAND_BULBS[GARLAND_BULBS.length - 1].left - GARLAND_BULBS[0].left;
  const scale = 100 / bulbSpan;
  const shift = -(GARLAND_BULBS[0].left * scale);
  const trackStyle = {
    width: `${scale * 100}%`,
    marginLeft: `${shift}%`,
  } as const;

  return (
    <div
      className="relative z-10 mt-8 w-full pb-14 sm:mt-12 sm:pb-16"
      // Allow glow to bloom above/below; still crop the scaled PNG on the sides
      style={{ clipPath: "inset(-2rem 0 -5rem 0)" }}
      aria-hidden
    >
      <div className="relative" style={trackStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/contact/garland.png"
          alt=""
          className="relative z-[1] block h-auto w-full select-none"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        <div className="pointer-events-none absolute inset-0 z-[2] overflow-visible">
          {GARLAND_BULBS.map((bulb, i) => (
            <span
              key={i}
              className="garland-glow absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${bulb.left}%`,
                top: `${bulb.top}%`,
                width: "clamp(1px, 0.5vw, 28px)",
                height: "clamp(1px, 0.5vw, 14px)",
                background:
                  "radial-gradient(circle, rgba(255,248,210,0.95) 0%, rgba(233, 221, 192, 0.55) 35%, rgba(255,190,90,0.22) 58%, transparent 78%)",
                boxShadow:
                  "0 0 12px 6px rgba(255,230,150,0.55), 0 0 28px 14px rgba(239, 218, 180, 0.35), 0 0 48px 22px rgba(255,170,70,0.18)",
                animationDelay: `${(i * 0.37) % 2.8}s`,
                animationDuration: `${2.2 + (i % 5) * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Overlapping black spheres — Figma Group 101. */
function HemisphereTransition() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative z-40 h-[clamp(96px,13vw,160px)] w-full -mb-[clamp(48px,6.5vw,80px)]"
      style={{
        backgroundImage: "url(/images/contact/scallop.png)",
        backgroundRepeat: "repeat-x",
        backgroundPosition: "center center",
        backgroundSize: "auto 100%",
      }}
    />
  );
}

export function Contact() {
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);

  return (
    <>
      <HemisphereTransition />

      <section
        id="contact"
        className="relative z-30 min-h-[100svh] overflow-hidden bg-black pb-16 pt-[clamp(5rem,9vw,7.5rem)] text-white sm:pb-20"
        aria-label="Контакты"
      >
        <div className="relative z-10 flex w-full flex-col gap-8 px-3 sm:px-5 lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:px-6 xl:px-8">
          <Reveal className="flex min-w-0 flex-1 items-start gap-3 sm:gap-5 lg:max-w-none" y={32} duration={0.85}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/contact/memoji.webp"
              alt=""
              className="mt-1 w-[min(180px,32vw)] shrink-0 select-none object-contain sm:w-[200px]"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
            <h2
              className="max-w-[16ch] pt-2 text-[clamp(1.55rem,3.6vw,3.15rem)] font-normal leading-[1.05] tracking-[0.01em] text-white"
              style={{ fontFamily: '"Benzin-Bold", sans-serif' }}
            >
              Крутые проекты иногда начинаются с простого “привет”!
            </h2>
          </Reveal>

          <Reveal
            className="flex shrink-0 flex-col items-start gap-5 pt-2 lg:items-end lg:pt-6"
            delay={0.12}
            y={28}
            duration={0.8}
          >
            <div className="flex w-[min(322px,94vw)] flex-col items-end gap-2.5">
              <p
                className="flex items-center justify-end gap-2.5 text-[clamp(1.35rem,2.1vw,1.75rem)] text-white"
                style={{ fontFamily: '"Asthetic Pixel", monospace' }}
              >
                <span className="relative inline-flex size-[10px] items-center justify-center">
                  <span
                    className="absolute size-[10px] rounded-full bg-[#39FF6A]"
                    style={{
                      animation: "open-work-ping 1.8s ease-out infinite",
                      boxShadow: "0 0 10px 4px rgba(57,255,106,0.85)",
                    }}
                  />
                  <span className="relative size-[10px] rounded-full bg-[#39FF6A] shadow-[0_0_6px_2px_rgba(57,255,106,1),0_0_16px_6px_rgba(57,255,106,0.75),0_0_32px_12px_rgba(57,255,106,0.28)]" />
                </span>
                open to work
              </p>

              <LiquidWriteButton
                href={`mailto:${SITE.email}`}
                className="!h-[68px] !w-[min(322px,94vw)]"
                onMouseEnter={() => setCursorLabel("Написать")}
                onMouseLeave={() => setCursorLabel(null)}
              />
              <div
                className="flex flex-col items-end gap-1.5 text-[21px] leading-[1.35] text-white"
                style={{ fontFamily: '"Pixelta", "Unageo", system-ui, sans-serif' }}
              >
                <a href={`mailto:${SITE.email}`} className="hover:text-white/80">
                  {SITE.email}
                </a>
                <a
                  href={SITE.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white/80"
                >
                  {SITE.telegram}
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        <GarlandLights />

        <ContactPhysicsToys />
      </section>
    </>
  );
}
