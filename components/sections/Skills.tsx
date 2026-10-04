"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/**
 * SKILLS — Screen 4
 *
 * MECHANIC REF: https://www.adamhartwig.co.uk/skills
 * Planets on orbital rings; each skill is a planet with level %.
 * Click planet → detail panel. Planet art from the attached sheet.
 */

type PlanetSkill = {
  id: string;
  label: string;
  level: string;
  percent: number;
  years: string;
  kind: "hard" | "soft";
  orbit: number; // 0 inner → outer
  speed: number; // seconds per revolution
  size: number;
  look: PlanetLook;
  blurb: string;
};

type PlanetLook =
  | "earth"
  | "nebula"
  | "peach"
  | "jupiter"
  | "mars"
  | "pink"
  | "saturn"
  | "neptune"
  | "amethyst";

const PLANETS: PlanetSkill[] = [
  {
    id: "go",
    label: "Golang",
    level: "Эксперт",
    percent: 95,
    years: "5 лет",
    kind: "hard",
    orbit: 0,
    speed: 22,
    size: 78,
    look: "earth",
    blurb: "Пишу (микро)сервисы на Go, понимаю устройство как concurrency, gRPC, так и параллельной работы, API и инструментами вокруг них.",
  },
  {
    id: "pg",
    label: "PostgreSQL",
    level: "Эксперт",
    percent: 90,
    years: "5 лет",
    kind: "hard",
    orbit: 1,
    speed: 28,
    size: 64,
    look: "jupiter",
    blurb: "В процессе разработки проектирую базы данных: создаю таблицы, индексы и, конечно, запросы, которые держат нагрузку.",
  },
  {
    id: "redis",
    label: "Redis",
    level: "Продвинутый",
    percent: 82,
    years: "4 года",
    kind: "hard",
    orbit: 1,
    speed: 34,
    size: 46,
    look: "mars",
    blurb: "Ориентируюсь в быстром хранилище: кэш, лимиты запросов и временные данные.",
  },
  {
    id: "k8s",
    label: "Kubernetes",
    level: "Продвинутый",
    percent: 78,
    years: "3 года",
    kind: "hard",
    orbit: 2,
    speed: 40,
    size: 58,
    look: "nebula",
    blurb: "Ориентируюсь в кластере (Rollouts, HPA, etc.): запуск сервисов, обновления и аккуратное масштабирование.",
  },
  {
    id: "kafka",
    label: "Kafka",
    level: "Продвинутый",
    percent: 80,
    years: "3 года",
    kind: "hard",
    orbit: 2,
    speed: 46,
    size: 50,
    look: "peach",
    blurb: "Использовала на практике очереди сообщений (Kafka, RabbitMQ, etc.) в разных проектах: когда требовалась обработка событий, повторы и контроль потока.",
  },
  {
    id: "docker",
    label: "Docker",
    level: "Продвинутый",
    percent: 85,
    years: "5 лет",
    kind: "hard",
    orbit: 3,
    speed: 52,
    size: 44,
    look: "neptune",
    blurb: "Формирую воспроизводимые сборки и упаковываю приложения в докер-контейнеры, чтобы и локально, и на сервере всё совпадало.",
  },
  {
    id: "grpc",
    label: "gRPC",
    level: "Продвинутый",
    percent: 84,
    years: "4 года",
    kind: "hard",
    orbit: 3,
    speed: 58,
    size: 42,
    look: "saturn",
    blurb: "Ориентируюсь в быстрой связи между сервисами и потоковой передаче данных.",
  },
  {
    id: "git",
    label: "Git",
    level: "Продвинутый",
    percent: 86,
    years: "4 года",
    kind: "hard",
    orbit: 3,
    speed: 64,
    size: 40,
    look: "pink",
    blurb: "Веду историю изменений проектов: ветки, коммиты и совместная работа над кодом.",
  },
  {
    id: "own",
    label: "Ответственность",
    level: "Эксперт",
    percent: 92,
    years: "—",
    kind: "soft",
    orbit: 0,
    speed: 26,
    size: 70,
    look: "amethyst",
    blurb: "Довожу задачу до рабочего результата и слежу, чтобы сервис оставался стабильным.",
  },
  {
    id: "ment",
    label: "Заинтересованность",
    level: "Сильный",
    percent: 80,
    years: "—",
    kind: "soft",
    orbit: 1,
    speed: 36,
    size: 52,
    look: "earth",
    blurb: "Зачастую разбираюсь в задаче глубже исходной постановки и ищу, как сделать систему надёжнее.",
  },
  {
    id: "comm",
    label: "Коммуникабельность",
    level: "Сильный",
    percent: 86,
    years: "—",
    kind: "soft",
    orbit: 2,
    speed: 44,
    size: 48,
    look: "jupiter",
    blurb: "Могу логично и поятно объяснить свое решение команде и спокойно согласовать детали работы над проектом.",
  },
  {
    id: "sys",
    label: "Креативность",
    level: "Эксперт",
    percent: 93,
    years: "—",
    kind: "soft",
    orbit: 3,
    speed: 55,
    size: 46,
    look: "neptune",
    blurb: "Нахожу альтернативный рабочий ход, когда стандартный способ не подходит (и не откажусь покреативить, чтобы найти к задаче нестандартный подход, если ситуация, разумеется, это допускает).",
  },
  {
    id: "focus",
    label: "Концентрация",
    level: "Сильный",
    percent: 88,
    years: "2 года",
    kind: "soft",
    orbit: 2,
    speed: 48,
    size: 44,
    look: "peach",
    blurb:
      "Раньше преподавала информатику и математику выпускникам, имею двухлетний опыт репетиторства, который и позволил «прокачать» долгую концентрацию над определенной задачей.",
  },
];

const ORBIT_SIZE = ["38%", "58%", "76%", "94%"];

export function Skills() {
  const [mode, setMode] = useState<"hard" | "soft">("hard");
  const [activeId, setActiveId] = useState("go");
  const [orbitsLive, setOrbitsLive] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);

  const planets = useMemo(() => PLANETS.filter((p) => p.kind === mode), [mode]);
  const active = planets.find((p) => p.id === activeId) ?? planets[0];

  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOrbitsLive(Boolean(entry?.isIntersecting)),
      { rootMargin: "120px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="skills"
      className="relative z-10 min-h-screen overflow-x-hidden overflow-y-visible px-6 pb-28 pt-40 text-[#E8E8E8] sm:pt-44"
      aria-label="Стек"
    >
      <div className="relative z-10 mx-auto mb-6 mt-4 flex max-w-6xl flex-col items-center gap-4 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
        <Reveal className="w-full max-w-[728px]" y={24} duration={0.8}>
          <h2 className="relative m-0 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/title-stek.png?v=3"
              alt="Стек"
              className="relative h-auto w-full select-none object-contain"
              draggable={false}
            />
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-[#E8E8E8]/70">
            Моя карта навыков orbital map — выберите навык, и планета подсветится :)
          </p>
        </Reveal>
        <Reveal delay={0.1} y={18} duration={0.7}>
          <div className="inline-flex rounded-full border border-white/25 bg-white/10 p-1 backdrop-blur">
            {(["hard", "soft"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setActiveId(PLANETS.find((p) => p.kind === m)?.id ?? "go");
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition",
                  mode === m ? "bg-[#E8E8E8] text-black" : "text-[#E8E8E8]/75"
                )}
                style={{ fontFamily: '"Unageo", system-ui, sans-serif' }}
              >
                {m === "hard" ? "Хард-скиллы" : "Софт-скиллы"}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,728px)_minmax(280px,1fr)] lg:items-center">
        <div ref={mapRef} className="relative mx-auto aspect-square w-full max-w-[728px]">
          {/* Orbit rings */}
          {ORBIT_SIZE.map((size) => (
            <div
              key={size}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
              style={{ width: size, height: size }}
              aria-hidden
            />
          ))}

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 z-10 h-24 w-24 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_0_40px_rgba(255,255,255,0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/skills/core.png?v=2"
              alt="Ядро стека"
              className="h-full w-full select-none object-contain"
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </div>

          {planets.map((planet, index) => {
            const orbitPlanets = planets.filter((p) => p.orbit === planet.orbit);
            const slot = orbitPlanets.findIndex((p) => p.id === planet.id);
            const start = (slot / Math.max(orbitPlanets.length, 1)) * 360 + index * 7;
            const orbitSize = ORBIT_SIZE[planet.orbit];
            const animState = orbitsLive ? "running" : "paused";
            return (
              <div
                key={planet.id}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: orbitSize,
                  height: orbitSize,
                  marginLeft: `calc(${orbitSize} / -2)`,
                  marginTop: `calc(${orbitSize} / -2)`,
                  animation: `orbit-spin ${planet.speed}s linear infinite`,
                  animationPlayState: animState,
                }}
              >
                {/* Phase on orbit (places planet around the ring) */}
                <div className="relative h-full w-full" style={{ transform: `rotate(${start}deg)` }}>
                  <div
                    className="absolute left-1/2 top-0"
                    style={{ transform: "translate(-50%, -50%)" }}
                  >
                    {/* Cancels orbit-spin + phase → label always horizontal */}
                    <div
                      style={{
                        animation: `orbit-counter ${planet.speed}s linear infinite`,
                        animationPlayState: animState,
                        ["--orbit-start" as string]: `${start}deg`,
                      }}
                    >
                      <button
                        type="button"
                        className={cn(
                          "relative block transition-transform duration-300",
                          active?.id === planet.id && "z-20 scale-125"
                        )}
                        style={{
                          width: planet.look === "saturn" ? planet.size * 1.35 : planet.size,
                          height: planet.size,
                        }}
                        onClick={() => setActiveId(planet.id)}
                        onMouseEnter={() => setCursorLabel(planet.label)}
                        onMouseLeave={() => setCursorLabel(null)}
                        aria-label={planet.label}
                        aria-pressed={active?.id === planet.id}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/images/planets/${planet.look}.png`}
                          alt=""
                          draggable={false}
                          className={cn(
                            "h-full w-full select-none object-contain transition-[filter] duration-300",
                            active?.id === planet.id
                              ? "drop-shadow-[0_0_22px_rgba(232,232,232,0.95)]"
                              : "drop-shadow-[0_8px_16px_rgba(15,40,80,0.28)]"
                          )}
                        />
                        <span
                          className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-sky-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur"
                          style={{ fontFamily: '"Unageo", system-ui, sans-serif' }}
                        >
                          {planet.label}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-[28px] border border-white/25 bg-white/10 p-4 shadow-lg backdrop-blur-xl sm:p-6">
          <ul className="flex flex-col gap-2">
            {planets.map((planet) => {
              const selected = active?.id === planet.id;
              return (
                <li key={planet.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(planet.id)}
                    onMouseEnter={() => setCursorLabel(planet.label)}
                    onMouseLeave={() => setCursorLabel(null)}
                    aria-pressed={selected}
                    className={cn(
                      "w-full rounded-2xl px-4 py-3 text-left transition",
                      selected
                        ? "bg-white/20 shadow-[0_0_24px_rgba(184,180,232,0.35)] ring-1 ring-[#B8B4E8]"
                        : "hover:bg-white/10"
                    )}
                  >
                    <span
                      className="font-bold text-[#E8E8E8]"
                      style={{
                        fontFamily: '"Pixelta", "Unageo", system-ui, sans-serif',
                        fontSize: "calc(1.125rem * 1.15)",
                        lineHeight: 1.15,
                      }}
                    >
                      {planet.label}
                    </span>
                    <span
                      className="mt-1 block text-sm leading-snug text-[#E8E8E8]/70"
                      style={{ fontFamily: '"Unageo", system-ui, sans-serif' }}
                    >
                      {planet.blurb}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
