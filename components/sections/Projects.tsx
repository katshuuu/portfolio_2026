"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Github, X } from "lucide-react";
import { PROJECTS, type Project } from "@/lib/projects";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";
/**
 * PROJECTS — Screen 3
 *
 * MECHANIC REF: lusion.co/about + attached “resources and events” folder frames
 * Glassmorphic folder reveal in a triangle layout, frosted fronts, cyan field,
 * watermark typography, bottom glass shelf with case cards.
 */

const FOLDER_META = [
  {
    projectIndex: 0,
    label: "платформа для обучения",
    preview: "mascot" as const,
    src: "/images/folders/cow.webp",
    previewSrc: "/images/folders/golandia-achievements.webp",
    textColor: "#3B2414", // dark brown
  },
  {
    projectIndex: 1,
    label: "платформа + чат-бот",
    preview: "mascot" as const,
    src: "/images/folders/gray.webp",
    previewSrc: "/images/folders/floramind-main.webp",
    previewHref: "https://disk.yandex.ru/i/UsopYQy9drZquA",
    textColor: "#2F2F2F", // dark gray
  },
  {
    projectIndex: 2,
    label: "умный поиск",
    preview: "mascot" as const,
    src: "/images/folders/gold.webp",
    previewSrc: "/images/folders/moszapros-main.webp",
    previewHref: "https://disk.yandex.ru/i/Z9n72-94eJ6Flw",
    textColor: "#946d2a", // gold folder
  },
  {
    projectIndex: 3,
    label: "телеграм-бот для PR",
    preview: "tickets" as const,
    src: "/images/folders/brown.webp",
    textColor: "#654a2d", // light brown folder
  },
];

export function Projects() {
  const [active, setActive] = useState<Project | null>(null);
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);

  return (
    <section
      id="projects"
      className="relative min-h-screen overflow-hidden px-4 pb-28 pt-28 sm:px-8"
      aria-label="Проекты"
    >
      <Reveal y={24} duration={0.8} className="relative z-10 mx-auto mb-8 w-full max-w-5xl">
        <h2 className="relative m-0 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/title-proekty.webp"
            alt="Проекты"
            className="relative h-auto w-full select-none object-contain"
            draggable={false}
          />
        </h2>
      </Reveal>

      <div className="relative z-10 mx-auto grid max-w-3xl grid-cols-2 justify-items-center gap-x-6 gap-y-8 sm:gap-x-10 sm:gap-y-10">
        {FOLDER_META.map((folder, i) => {
          const project = PROJECTS[folder.projectIndex];
          return (
            <Reveal
              key={folder.label}
              className="group w-full max-w-[280px] text-left"
              delay={i * 0.08}
              y={36}
              duration={0.7}
            >
              <div
                onMouseEnter={() => setCursorLabel("Открыть")}
                onMouseLeave={() => setCursorLabel(null)}
              >
                <GlassFolder
                  label={folder.label}
                  preview={folder.preview}
                  title={project.title}
                  src={folder.src}
                  textColor={folder.textColor}
                  previewSrc={"previewSrc" in folder ? folder.previewSrc : undefined}
                  previewHref={"previewHref" in folder ? folder.previewHref : undefined}
                  onOpen={() => setActive(project)}
                />
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="relative z-20 mx-auto mt-10 max-w-5xl">
        <div className="overflow-hidden rounded-[28px] border border-white/25 bg-white/10 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl sm:p-5">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {PROJECTS.map((project, i) => {
              const titleColor =
                FOLDER_META.find((f) => f.projectIndex === i)?.textColor ?? "#18181b";
              return (
              <button
                key={project.id}
                type="button"
                onClick={() => setActive(project)}
                onMouseEnter={() => setCursorLabel("Кейс")}
                onMouseLeave={() => setCursorLabel(null)}
                className="flex min-w-[220px] max-w-[240px] shrink-0 flex-col rounded-2xl bg-white/95 p-4 text-left shadow-md transition hover:-translate-y-1"
              >
                <div className="flex h-8 items-end sm:h-9">
                  <h3
                    className="w-full text-base font-bold leading-none sm:text-lg"
                    style={{
                      fontFamily: '"Pixelta", "Unageo", system-ui, sans-serif',
                      color: titleColor,
                    }}
                  >
                    {project.title}
                  </h3>
                </div>
                {project.roleHref ? (
                  <a
                    href={project.roleHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 block text-[11px] font-medium text-cyan-700 underline decoration-cyan-700/40 underline-offset-2 hover:text-cyan-900"
                  >
                    {project.role}
                  </a>
                ) : (
                  <p className="mt-1 text-[11px] font-medium text-zinc-500">{project.role}</p>
                )}
                <p
                  className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-zinc-600"
                  style={{ fontFamily: '"Unageo", system-ui, sans-serif' }}
                >
                  {project.tagline}
                  {project.extraLinks?.length ? (
                    <>
                      .{" "}
                      {project.extraLinks.map((link, index) => (
                        <span key={link.href}>
                          {index > 0 ? " · " : null}
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-cyan-700 underline decoration-cyan-700/40 underline-offset-2 hover:text-cyan-900"
                          >
                            {link.label}
                          </a>
                        </span>
                      ))}
                    </>
                  ) : project.metrics ? (
                    `. ${project.metrics}`
                  ) : null}
                </p>
              </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-center">
            <span className="rounded-full bg-white/15 px-4 py-1 text-[11px] font-medium text-[#E8E8E8] backdrop-blur">
              кейсы
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {active ? <CaseModal project={active} onClose={() => setActive(null)} /> : null}
      </AnimatePresence>
    </section>
  );
}

function GlassFolder({
  label,
  preview,
  title,
  src,
  textColor,
  previewSrc,
  previewHref,
  onOpen,
}: {
  label: string;
  preview: "docs" | "books" | "tickets" | "mascot";
  title: string;
  src: string;
  textColor: string;
  previewSrc?: string;
  previewHref?: string;
  onOpen: () => void;
}) {
  return (
    <div className="relative aspect-[1881/1353] w-full [perspective:900px]">
      <div
        aria-hidden
        className="absolute inset-x-[8%] bottom-[6%] top-[28%] rounded-[80px] bg-[rgba(0,45,54,0.12)] blur-[5px]"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full select-none object-contain drop-shadow-[0_22px_44px_rgba(0,0,0,0.28)]"
      />

      <div className="glass-folder-content absolute inset-x-[9%] bottom-[22%] top-[6%] z-[1] origin-bottom">
        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 block h-full w-full"
            aria-label={`Презентация ${title}`}
            onMouseEnter={() => useUIStore.getState().setCursorLabel("Презентация")}
            onMouseLeave={() => useUIStore.getState().setCursorLabel("Открыть")}
          >
            <FolderPreview kind={preview} previewSrc={previewSrc} />
          </a>
        ) : (
          <button
            type="button"
            className="block h-full w-full text-left"
            onClick={onOpen}
            aria-label={`Открыть ${title}`}
          >
            <FolderPreview kind={preview} previewSrc={previewSrc} />
          </button>
        )}
      </div>

      <button
        type="button"
        className="glass-folder-front absolute inset-x-[0.5%] bottom-[2.5%] top-[26%] z-[2] text-left"
        onClick={onOpen}
        aria-label={`Открыть ${title}`}
      >
        <div
          className="absolute inset-0 rounded-[18px]"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow:
              "rgba(255,255,255,0.8) 0px 0px 16px 0px inset, rgba(0,96,107,0.1) 0px -4px 4px 0px",
          }}
        >
          <div
            className="absolute inset-[3px] overflow-hidden rounded-[15px]"
            style={{
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(125,211,234,0.12) 100%)",
              boxShadow:
                "rgba(0,185,222,0.5) 0px -2px 8px 0px inset, rgba(191,248,255,0.8) -2px 4px 16px 4px inset, rgba(0,117,138,0.2) 0px 0px 16px 0px",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/45 to-transparent" />
            <div className="absolute bottom-3.5 left-4 right-4">
              {label.toLowerCase() !== title.toLowerCase() ? (
                <p
                  className="text-[12px] font-medium lowercase tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]"
                  style={{
                    fontFamily: '"Unageo", system-ui, sans-serif',
                    color: textColor,
                  }}
                >
                  {label}
                </p>
              ) : null}
              <p
                className="mt-0.5 truncate text-[15px] font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]"
                style={{
                  fontFamily: '"Unageo", system-ui, sans-serif',
                  color: textColor,
                }}
              >
                {title}
              </p>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function FolderPreview({
  kind,
  previewSrc,
}: {
  kind: "docs" | "books" | "tickets" | "mascot";
  previewSrc?: string;
}) {
  if (kind === "mascot" && previewSrc) {
    return (
      <div className="relative mx-auto h-full w-[78%]">
        <div className="absolute inset-x-0 bottom-0 top-[8%] rounded-lg bg-white shadow-lg transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-2deg] group-focus:-translate-y-2">
          <div className="space-y-1.5 p-3">
            <div className="h-2 w-2/3 rounded bg-sky-400/80" />
            <div className="h-1.5 w-full rounded bg-zinc-200" />
            <div className="h-1.5 w-5/6 rounded bg-zinc-200" />
            <div className="h-1.5 w-4/5 rounded bg-zinc-200" />
            <div className="mt-2 grid grid-cols-3 gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-sky-100" />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-x-[6%] bottom-0 top-0 translate-y-1 overflow-hidden rounded-lg bg-white/95 shadow-md transition-transform duration-500 group-hover:-translate-y-5 group-hover:rotate-[3deg] group-focus:-translate-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt=""
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full select-none bg-white object-contain object-center"
          />
        </div>
      </div>
    );
  }

  if (kind === "books") {
    const books = [
      {
        c: "#f8fafc",
        spine: "#e2e8f0",
        t: "Flora Mind",
        rest: "-rotate-[3deg]",
        open: "group-hover:-rotate-[8deg] group-focus:-rotate-[8deg]",
      },
      {
        c: "#0d9660",
        spine: "#087a4c",
        t: "AI Florist",
        rest: "rotate-[1deg]",
        open: "group-hover:rotate-[2deg] group-focus:rotate-[2deg]",
      },
      {
        c: "#e879a9",
        spine: "#db5f92",
        t: "Bouquet Lab",
        rest: "rotate-[4deg]",
        open: "group-hover:rotate-[10deg] group-focus:rotate-[10deg]",
      },
    ];
    return (
      <div className="relative flex h-full items-end justify-center gap-1.5 px-3 pb-1 pt-2">
        {books.map((b) => (
          <div
            key={b.t}
            className={cn(
              "relative h-[92%] w-[31%] origin-bottom rounded-[4px] shadow-[inset_0_1.9px_3px_rgba(255,255,255,0.43),inset_3.6px_0_3.6px_rgba(0,0,0,0.15),0_8px_18px_rgba(0,40,60,0.25)] transition-transform duration-500",
              b.rest,
              b.open,
              "group-hover:-translate-y-1 group-focus:-translate-y-1"
            )}
            style={{ background: b.c }}
          >
            <div
              className="absolute inset-y-0 left-0 w-[14%] rounded-l-[4px] opacity-90"
              style={{ background: b.spine }}
            />
            <span
              className={cn(
                "absolute inset-y-3 left-[18%] right-1.5 text-[8px] font-bold leading-tight sm:text-[9px]",
                b.c === "#f8fafc" ? "text-zinc-800" : "text-white"
              )}
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {b.t}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "tickets") {
    const tickets = [
      { c: "#a070ff", rot: "rotate-[-7deg] group-hover:rotate-[-14deg]", top: "8%", left: "4%" },
      { c: "#0b3d91", rot: "rotate-[3deg] group-hover:rotate-[6deg]", top: "22%", left: "18%" },
      { c: "#c8e86a", rot: "rotate-[-2deg] group-hover:rotate-[-4deg]", top: "38%", left: "28%" },
    ];
    return (
      <div className="relative h-full w-full">
        {tickets.map((t, i) => (
          <div
            key={t.c}
            className={cn(
              "absolute h-[38%] w-[72%] shadow-md transition-transform duration-500 group-hover:-translate-y-[18%] group-focus:-translate-y-[18%]",
              t.rot
            )}
            style={{
              top: t.top,
              left: t.left,
              background: t.c,
              clipPath:
                "polygon(0% 0%, 100% 0%, 100% 12%, 97% 18%, 100% 24%, 97% 30%, 100% 36%, 97% 42%, 100% 48%, 97% 54%, 100% 60%, 97% 66%, 100% 72%, 97% 78%, 100% 84%, 97% 90%, 100% 100%, 0% 100%, 0% 90%, 3% 84%, 0% 78%, 3% 72%, 0% 66%, 3% 60%, 0% 54%, 3% 48%, 0% 42%, 3% 36%, 0% 30%, 3% 24%, 0% 18%, 3% 12%)",
            }}
          >
            {i === 1 ? (
              <span className="absolute left-3 top-2 text-[11px] font-bold text-white/90">
                new Pull Request!
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-full w-[78%]">
      <div className="absolute inset-x-0 bottom-0 top-[8%] rounded-lg bg-white shadow-lg transition-transform duration-500 group-hover:-translate-y-2 group-hover:rotate-[-2deg] group-focus:-translate-y-2">
        <div className="space-y-1.5 p-3">
          <div className="h-2 w-2/3 rounded bg-sky-400/80" />
          <div className="h-1.5 w-full rounded bg-zinc-200" />
          <div className="h-1.5 w-5/6 rounded bg-zinc-200" />
          <div className="h-1.5 w-4/5 rounded bg-zinc-200" />
          <div className="mt-2 grid grid-cols-3 gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-5 rounded bg-sky-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-x-[6%] bottom-0 top-0 translate-y-1 rounded-lg bg-white/90 shadow-md transition-transform duration-500 group-hover:-translate-y-5 group-hover:rotate-[3deg] group-focus:-translate-y-5">
        <div className="space-y-1.5 p-3 pt-4">
          <div className="h-2 w-1/2 rounded bg-sky-300/90" />
          <div className="h-1.5 w-full rounded bg-zinc-100" />
          <div className="h-1.5 w-4/5 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}

function CaseModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label={`${project.title} — кейс`}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-zinc-200 p-2 text-zinc-500 hover:text-zinc-900"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-600">Кейс</p>
        <h3 className="mt-2 font-display text-3xl font-bold">{project.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">
          {project.roleHref ? (
            <a
              href={project.roleHref}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-700 underline decoration-cyan-700/40 underline-offset-2 hover:text-cyan-900"
            >
              {project.role}
            </a>
          ) : (
            project.role
          )}
          {project.metrics ? ` · ${project.metrics}` : null}
        </p>
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-zinc-700">
          <p><span className="font-semibold text-zinc-900">Проблема. </span>{project.problem}</p>
          <p><span className="font-semibold text-zinc-900">Решение. </span>{project.solution}</p>
          <p><span className="font-semibold text-zinc-900">Результат. </span>{project.result}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
          >
            <Github size={14} /> GitHub
          </a>
          {project.extraLinks
            ?.filter((link) => link.href !== project.github)
            .map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"
              >
                <Github size={14} /> Bot
              </a>
            ))}
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
            >
              <ExternalLink size={14} /> {project.demoLabel ?? "Demo"}
            </a>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  );
}
