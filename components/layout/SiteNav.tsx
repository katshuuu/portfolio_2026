"use client";

import { SITE } from "@/lib/constants";
import { useUIStore } from "@/lib/store";

const LINKS = [
  { href: "#about", label: "обо мне" },
  { href: "#skills", label: "стек" },
  { href: "#projects", label: "проекты" },
  { href: "#contact", label: "контакты" },
] as const;

const NAV_SURFACE =
  "border border-[#FDF5E6] bg-[rgba(217, 217, 217, 0.1)] backdrop-blur-md";

const NAV_TYPE = {
  fontFamily: '"Bristol", cursive',
  fontSize: "min(1.875vw, 3.34vh, 27px)",
  lineHeight: 1,
  color: "#FDF5E6",
} as const;

const EMAIL_BUBBLES = [
  { color: "#B8E8FF", size: 5, dx: "-38px", dy: "-40px", delay: "0s" },
  { color: "#6AD4FF", size: 6, dx: "36px", dy: "-34px", delay: "0.12s" },
  { color: "#3BB4F5", size: 4, dx: "42px", dy: "8px", delay: "0.22s" },
  { color: "#8FD9FF", size: 5, dx: "18px", dy: "38px", delay: "0.08s" },
  { color: "#4FC3F7", size: 7, dx: "-36px", dy: "22px", delay: "0.28s" },
  { color: "#A5DEFF", size: 4, dx: "-6px", dy: "-46px", delay: "0.4s" },
  { color: "#29B6F6", size: 6, dx: "8px", dy: "40px", delay: "0.18s" },
  { color: "#7EC8E8", size: 5, dx: "-30px", dy: "36px", delay: "0.5s" },
] as const;

/**
 * Top nav matching Figma frame (node 117-56):
 * long Bristol pill with 4 links + separate circular @ to the right.
 * https://www.figma.com/design/BqeSnQwDAII2aSprNuADrm/Untitled?node-id=117-56
 */
export function SiteNav() {
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);

  return (
    <header className="pointer-events-none fixed left-1/2 top-[5.5%] z-50 flex -translate-x-1/2 items-center gap-[0.55em]">
      <nav
        className={`pointer-events-auto flex h-[min(5.93vh,48px)] items-center gap-[min(2.4vw,2.1em)] rounded-[80px] px-[min(2.8vw,2.4em)] ${NAV_SURFACE}`}
        aria-label="Навигация"
        style={NAV_TYPE}
      >
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="whitespace-nowrap transition hover:text-white"
            onMouseEnter={() => setCursorLabel(link.label)}
            onMouseLeave={() => setCursorLabel(null)}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a
        href={`mailto:${SITE.email}`}
        className={`group pointer-events-auto relative flex size-[min(5.93vh,48px)] shrink-0 items-center justify-center rounded-full transition hover:text-white ${NAV_SURFACE}`}
        style={NAV_TYPE}
        aria-label="Email"
        onMouseEnter={() => setCursorLabel("Email")}
        onMouseLeave={() => setCursorLabel(null)}
      >
        <span className="relative z-10">@</span>
        {EMAIL_BUBBLES.map((bubble) => (
          <span
            key={`${bubble.dx}-${bubble.dy}`}
            aria-hidden
            className="soap-bubble pointer-events-none absolute left-1/2 top-1/2 z-0 rounded-full"
            style={{
              width: bubble.size,
              height: bubble.size,
              ["--bubble" as string]: bubble.color,
              ["--dx" as string]: bubble.dx,
              ["--dy" as string]: bubble.dy,
              ["--delay" as string]: bubble.delay,
            }}
          />
        ))}
      </a>
    </header>
  );
}
