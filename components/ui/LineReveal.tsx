"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type Piece =
  | { type: "space"; key: string; value: string }
  | { type: "word"; key: string; node: ReactNode };

function toPieces(children: ReactNode, prefix = "p"): Piece[] {
  const out: Piece[] = [];
  let n = 0;

  const addText = (text: string, wrap?: (word: ReactNode) => ReactNode) => {
    for (const part of text.split(/(\s+)/)) {
      if (!part) continue;
      const key = `${prefix}-${n++}`;
      if (/^\s+$/.test(part)) out.push({ type: "space", key, value: part });
      else out.push({ type: "word", key, node: wrap ? wrap(part) : part });
    }
  };

  Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean") return;
    if (typeof child === "string" || typeof child === "number") {
      addText(String(child));
      return;
    }
    if (isValidElement(child)) {
      const el = child as ReactElement<{ children?: ReactNode }>;
      const inner = el.props.children;
      if (typeof inner === "string" || typeof inner === "number") {
        addText(String(inner), (word) =>
          cloneElement(el, { key: undefined }, word),
        );
        return;
      }
      const nested = toPieces(inner, `${prefix}-${n}`);
      n += nested.length + 1;
      for (const piece of nested) {
        if (piece.type === "space") out.push(piece);
        else {
          out.push({
            type: "word",
            key: piece.key,
            node: cloneElement(el, { key: undefined }, piece.node),
          });
        }
      }
      return;
    }
    out.push({ type: "word", key: `${prefix}-${n++}`, node: child });
  });

  return out;
}

type ParagraphModel = {
  key: string;
  pieces: Piece[];
  words: Extract<Piece, { type: "word" }>[];
};

type BioLineRevealProps = {
  paragraphs: ReactNode[];
  className?: string;
  paragraphClassName?: string;
  stagger?: number;
  duration?: number;
  style?: CSSProperties;
};

/**
 * Reveal every visual line of a multi-paragraph bio in one continuous sequence
 * (top → bottom), sliding up as the block enters the viewport on scroll.
 */
export function BioLineReveal({
  paragraphs,
  className,
  paragraphClassName,
  stagger = 0.11,
  duration = 0.58,
  style,
}: BioLineRevealProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lineMap, setLineMap] = useState<number[][] | null>(null);

  const models = useMemo<ParagraphModel[]>(
    () =>
      paragraphs.map((node, i) => {
        const pieces = toPieces(node, `bio${i}`);
        return {
          key: `p-${i}`,
          pieces,
          words: pieces.filter(
            (p): p is Extract<Piece, { type: "word" }> => p.type === "word",
          ),
        };
      }),
    [paragraphs],
  );

  const measure = () => {
    const root = measureRef.current;
    if (!root) return;
    const next: number[][] = models.map((_, pi) => {
      const els = Array.from(
        root.querySelectorAll<HTMLElement>(`[data-bio-p="${pi}"][data-lr-word]`),
      );
      if (!els.length) return [0];
      const breaks = [0];
      let top = els[0].offsetTop;
      els.forEach((el, i) => {
        if (i === 0) return;
        if (Math.abs(el.offsetTop - top) > 2) {
          breaks.push(i);
          top = el.offsetTop;
        }
      });
      return breaks;
    });
    setLineMap(next);
  };

  useLayoutEffect(() => {
    if (reduce) {
      setVisible(true);
      return;
    }
    measure();
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    void document.fonts?.ready?.then(() => measure());
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, models]);

  useEffect(() => {
    if (reduce) return;
    const el = rootRef.current;
    if (!el) return;
    let cancelled = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (cancelled || !entry) return;
        if (entry.isIntersecting) {
          setArmed(true);
          // One frame hidden → then reveal so CSS transitions run
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              if (!cancelled) setVisible(true);
            });
          });
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);

    // If already in view on load, still animate once measured
    const t = window.setTimeout(() => {
      if (cancelled) return;
      const r = el.getBoundingClientRect();
      const inView =
        r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.08;
      if (inView) {
        setArmed(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!cancelled) setVisible(true);
          });
        });
        io.disconnect();
      } else {
        setArmed(true);
        setVisible(false);
      }
    }, 80);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [reduce]);

  const renderFlatParagraph = (model: ParagraphModel, pi: number) => (
    <p key={model.key} className={cn(paragraphClassName)}>
      {model.pieces.map((piece) =>
        piece.type === "space" ? (
          <span key={piece.key}>{piece.value}</span>
        ) : (
          <span
            key={piece.key}
            data-bio-p={pi}
            data-lr-word
            className="inline"
          >
            {piece.node}
          </span>
        ),
      )}
    </p>
  );

  // Flat readable text until we have line metrics
  if (reduce || !lineMap || !armed) {
    return (
      <div ref={rootRef} className={cn(className)} style={style}>
        <div ref={measureRef} className="flex flex-col gap-6">
          {models.map((model, pi) => renderFlatParagraph(model, pi))}
        </div>
      </div>
    );
  }

  let globalLine = 0;
  const paragraphsNodes = models.map((model, pi) => {
    const breaks = lineMap[pi] ?? [0];
    const lineNodes: ReactNode[] = [];

    for (let li = 0; li < breaks.length; li++) {
      const start = breaks[li];
      const end = breaks[li + 1] ?? model.words.length;
      const content: ReactNode[] = [];
      let wordCursor = -1;
      const lineIndex = globalLine;

      for (const piece of model.pieces) {
        if (piece.type === "word") {
          wordCursor += 1;
          if (wordCursor >= start && wordCursor < end) {
            content.push(
              <span key={piece.key} className="inline">
                {piece.node}
              </span>,
            );
          }
        } else if (wordCursor >= start && wordCursor < end - 1) {
          content.push(<span key={piece.key}>{piece.value}</span>);
        }
      }

      lineNodes.push(
        <span key={`${model.key}-line-${li}`} className="block overflow-hidden">
          <span
            className="block w-full will-change-transform"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible
                ? "translate3d(0,0,0)"
                : "translate3d(0,18px,0)",
              transition: `opacity ${duration}s cubic-bezier(0.22,1,0.36,1) ${
                lineIndex * stagger
              }s, transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${
                lineIndex * stagger
              }s`,
            }}
          >
            {content}
          </span>
        </span>,
      );
      globalLine += 1;
    }

    return (
      <p key={model.key} className={cn("relative", paragraphClassName)}>
        {lineNodes}
      </p>
    );
  });

  return (
    <div ref={rootRef} className={cn("relative", className)} style={style}>
      {/* Hidden measure copy keeps metrics stable while animated lines show */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex flex-col gap-6 opacity-0"
      >
        {models.map((model, pi) => renderFlatParagraph(model, pi))}
      </div>
      <div className="flex flex-col gap-6">{paragraphsNodes}</div>
    </div>
  );
}
