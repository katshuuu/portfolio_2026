"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Body, Mouse, MouseConstraint } from "matter-js";
import { SITE } from "@/lib/constants";
import { useUIStore } from "@/lib/store";

type Toy = {
  id: string;
  label: string;
  src: string;
  href?: string;
  width: number;
  kind: "decor" | "link";
};

const TOYS: Toy[] = [
  {
    id: "star",
    label: "star",
    src: "/images/contact/star.png",
    width: 110,
    kind: "decor",
  },
  {
    id: "tg",
    label: "tg",
    src: "/images/contact/btn-tg.png",
    href: SITE.telegram,
    width: 118,
    kind: "link",
  },
  {
    id: "email",
    label: "email",
    src: "/images/contact/btn-email.png",
    href: `mailto:${SITE.email}`,
    width: 118,
    kind: "link",
  },
  {
    id: "vk",
    label: "VK",
    src: "/images/contact/btn-vk.png",
    href: SITE.vk,
    width: 118,
    kind: "link",
  },
  {
    id: "github",
    label: "GitHub",
    src: "/images/contact/btn-github.png",
    href: SITE.github,
    width: 118,
    kind: "link",
  },
  {
    id: "heart",
    label: "heart",
    src: "/images/contact/heart.png",
    width: 105,
    kind: "decor",
  },
];

/**
 * Matter.js playground matching wtfruchit.com end-of-page props:
 * gravity, restitution, collisions, mouse grab / fling.
 */
export function ContactPhysicsToys() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLElement | null)[]>([]);
  const setCursorLabel = useUIStore((s) => s.setCursorLabel);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setEnabled(true);
          io.disconnect();
        }
      },
      { rootMargin: "480px 0px" },
    );
    io.observe(arena);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const arena = arenaRef.current;
    if (!arena) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void (async () => {
      const Matter = (await import("matter-js")).default;
      if (cancelled || !arenaRef.current) return;

    const { Engine, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Body, Query, Sleeping } =
      Matter;

    const engine = Engine.create({
      gravity: { x: 0, y: 1.2 },
      enableSleeping: true,
    });
    engine.positionIterations = 4;
    engine.velocityIterations = 3;
    const world = engine.world;
    const runner = Runner.create();

    let wallBodies: Body[] = [];
    let toyBodies: Body[] = [];
    let mouseConstraint: MouseConstraint | null = null;
    let mouse: Mouse | null = null;
    let booted = false;

    const dragState = {
      startX: 0,
      startY: 0,
      moved: 0,
      bodyId: null as number | null,
    };

    const measure = () => {
      const w = arena.clientWidth;
      const h = arena.clientHeight;
      return { w: Math.max(320, w), h: Math.max(220, h) };
    };

    const clearWalls = () => {
      if (wallBodies.length) Composite.remove(world, wallBodies);
      wallBodies = [];
    };

    const buildWalls = (w: number, h: number) => {
      clearWalls();
      const t = 100;
      wallBodies = [
        Bodies.rectangle(w / 2, h + t / 2 - 4, w + t * 2, t, {
          isStatic: true,
          friction: 0.95,
          restitution: 0.35,
        }),
        Bodies.rectangle(w / 2, -t / 2, w + t * 2, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, h / 2, t, h + t * 2, { isStatic: true }),
        Bodies.rectangle(w + t / 2, h / 2, t, h + t * 2, { isStatic: true }),
      ];
      Composite.add(world, wallBodies);
    };

    const visualWidth = (i: number) => {
      const el = nodeRefs.current[i];
      return el?.offsetWidth || TOYS[i].width;
    };

    const visualHeight = (i: number) => {
      const el = nodeRefs.current[i];
      return el?.offsetHeight || TOYS[i].width;
    };

    const placeToys = (w: number, h: number, reset = true) => {
      if (reset && toyBodies.length) {
        Composite.remove(world, toyBodies);
        toyBodies = [];
      }

      const widths = TOYS.map((_, i) => visualWidth(i));
      const gap = Math.min(28, w * 0.02);
      const totalW = widths.reduce((s, n) => s + n, 0) + gap * (TOYS.length - 1);
      let x = Math.max(12, (w - totalW) / 2);

      TOYS.forEach((toy, i) => {
        const size = widths[i];
        const height = visualHeight(i);
        const cx = x + size / 2;
        x += size + gap;

        if (!reset && toyBodies[i]) {
          Body.setPosition(toyBodies[i], {
            x: Math.min(w - size / 2, Math.max(size / 2, toyBodies[i].position.x)),
            y: Math.min(h - height / 2, Math.max(height / 2, toyBodies[i].position.y)),
          });
          return;
        }

        // Drop from above so they bounce into place like wtfruchit props
        const body = Bodies.rectangle(
          cx,
          18 + height * 0.35 + (i % 3) * 12,
          size * 0.88,
          height * 0.88,
          {
            chamfer: { radius: Math.min(28, size * 0.22) },
            restitution: 0.72,
            friction: 0.2,
            frictionAir: 0.02,
            density: 0.002,
            label: toy.id,
            sleepThreshold: 45,
          },
        );
        // Heavier inertia → playful bounce without flipping icons on their side
        Body.setInertia(body, body.inertia * 6);
        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2.4,
          y: Math.random() * 0.5,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.025);
        toyBodies.push(body);
      });

      if (reset) Composite.add(world, toyBodies);
    };

    const syncDom = () => {
      toyBodies.forEach((body, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        const { x, y } = body.position;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
    };

    const onMove = () => {
      if (!mouse || mouseConstraint?.body) return;
      const hits = Query.point(toyBodies, mouse.position);
      arena.style.cursor = hits.length ? "grab" : "default";

      // Soft cursor repulsion — sweep past and they bounce away (wtfruchit feel)
      const mx = mouse.position.x;
      const my = mouse.position.y;
      for (const body of toyBodies) {
        const dx = body.position.x - mx;
        const dy = body.position.y - my;
        const dist = Math.hypot(dx, dy);
        const radius = 88;
        if (dist < radius && dist > 2) {
          const push = (1 - dist / radius) * 0.0055;
          Body.applyForce(body, body.position, {
            x: (dx / dist) * push,
            y: (dy / dist) * push * 0.75,
          });
          if (body.isSleeping) Sleeping.set(body, false);
        }
      }
    };

    const boot = () => {
      if (booted) return;
      booted = true;

      const { w, h } = measure();
      buildWalls(w, h);
      placeToys(w, h, true);

      mouse = Mouse.create(arena);
      // DOM coords are CSS pixels — leave pixelRatio at 1 (retina override breaks hit-testing)
      // Keep page scroll working (Matter otherwise preventDefault on wheel)
      const matterMouse = mouse as Mouse & { mousewheel: EventListener };
      arena.removeEventListener("wheel", matterMouse.mousewheel);

      mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.18,
          damping: 0.08,
          render: { visible: false },
        },
      });
      Composite.add(world, mouseConstraint);

      Events.on(mouseConstraint, "startdrag", (ev) => {
        const body = (ev as unknown as { body: Body }).body;
        dragState.bodyId = body?.id ?? null;
        dragState.startX = mouse!.position.x;
        dragState.startY = mouse!.position.y;
        dragState.moved = 0;
        arena.style.cursor = "grabbing";
      });

      Events.on(mouseConstraint, "enddrag", () => {
        arena.style.cursor = "grab";
        if (dragState.moved < 10 && dragState.bodyId != null) {
          const idx = toyBodies.findIndex((b) => b.id === dragState.bodyId);
          const toy = TOYS[idx];
          if (toy?.kind === "link" && toy.href) {
            if (toy.href.startsWith("mailto:")) window.location.href = toy.href;
            else window.open(toy.href, "_blank", "noopener,noreferrer");
          }
        }
        dragState.bodyId = null;
      });

      Events.on(engine, "beforeUpdate", () => {
        if (mouseConstraint?.body && mouse) {
          const dx = mouse.position.x - dragState.startX;
          const dy = mouse.position.y - dragState.startY;
          dragState.moved = Math.max(dragState.moved, Math.hypot(dx, dy));
        }

        // Ease icons back upright when nearly resting so labels stay readable
        for (const body of toyBodies) {
          if (mouseConstraint?.body === body) continue;
          let a = body.angle % (Math.PI * 2);
          if (a > Math.PI) a -= Math.PI * 2;
          if (a < -Math.PI) a += Math.PI * 2;
          if (body.speed < 1.2) {
            Body.setAngularVelocity(
              body,
              body.angularVelocity * 0.9 - a * 0.035,
            );
          }
        }
      });

      Events.on(engine, "afterUpdate", syncDom);
      arena.addEventListener("mousemove", onMove);

      Runner.run(runner, engine);
      syncDom();
    };

    const waitForImages = () => {
      const imgs = Array.from(arena.querySelectorAll("img"));
      return Promise.all(
        imgs.map(
          (img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener("load", () => resolve(), { once: true });
                  img.addEventListener("error", () => resolve(), { once: true });
                }),
        ),
      );
    };

    waitForImages().then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => boot());
    });

    const onResize = () => {
      if (!booted) return;
      const { w, h } = measure();
      buildWalls(w, h);
      placeToys(w, h, false);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(arena);

    dispose = () => {
      ro.disconnect();
      arena.removeEventListener("mousemove", onMove);
      Runner.stop(runner);
      Events.off(engine, "afterUpdate", syncDom);
      if (mouseConstraint) {
        Composite.remove(world, mouseConstraint);
      }
      if (mouse) {
        Mouse.clearSourceEvents(mouse);
      }
      Engine.clear(engine);
      toyBodies = [];
      wallBodies = [];
    };
    })();

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [enabled]);

  return (
    <div
      ref={arenaRef}
      className="relative z-10 mt-2 h-[min(42vh,360px)] w-full touch-none select-none sm:mt-4"
      aria-label="Контакты — интерактивные элементы"
    >
      {TOYS.map((toy, i) => {
        const style: CSSProperties = {
          width: `min(${toy.width}px, 18vw)`,
          // offscreen until Matter places them; soft ease like wtfruchit
          transform: "translate3d(-9999px,-9999px,0)",
          transitionProperty: "transform",
          transitionTimingFunction: "ease",
          transitionDuration: "40ms",
        };

        const common = {
          ref: (el: HTMLElement | null) => {
            nodeRefs.current[i] = el;
          },
          className:
            "absolute left-0 top-0 will-change-transform drop-shadow-[0_8px_24px_rgba(255,255,255,0.12)]",
          style,
          onMouseEnter: () => setCursorLabel(toy.kind === "link" ? toy.label : null),
          onMouseLeave: () => setCursorLabel(null),
        };

        return (
          <div key={toy.id} {...common} role={toy.kind === "link" ? "link" : "img"} aria-label={toy.label}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toy.src}
              alt={toy.kind === "link" ? toy.label : ""}
              aria-hidden={toy.kind === "decor"}
              className="pointer-events-none h-auto w-full select-none object-contain"
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}

