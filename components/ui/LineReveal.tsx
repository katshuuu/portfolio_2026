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
 * Line-by-line reveal that preserves paragraph geometry:
 * words stay inline; opacity animates by measured line index.
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
  const [visible, setVisible] = useState(false);
  /** per-paragraph: wordIndex → global line index */
  const [wordLines, setWordLines] = useState<number[][] | null>(null);

  const models = useMemo<ParagraphModel[]>(
    () =>
      paragraphs.map((node, i) => ({
        key: `p-${i}`,
        pieces: toPieces(node, `bio${i}`),
      })),
    [paragraphs],
  );

  const measure = () => {
    const root = rootRef.current;
    if (!root) return;

    let globalLine = 0;
    const byPara: number[][] = models.map((_, pi) => {
      const els = Array.from(
        root.querySelectorAll<HTMLElement>(`[data-bio-p="${pi}"][data-lr-word]`),
      );
      if (!els.length) return [];
      const lines: number[] = [];
      let top = els[0].offsetTop;
      let localLine = 0;
      els.forEach((el, i) => {
        if (i > 0 && Math.abs(el.offsetTop - top) > 2) {
          localLine += 1;
          top = el.offsetTop;
        }
        lines.push(globalLine + localLine);
      });
      globalLine += localLine + 1;
      return lines;
    });

    setWordLines(byPara);
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
        if (cancelled || !entry?.isIntersecting) return;
        setVisible(true);
        io.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    const t = window.setTimeout(() => {
      if (cancelled) return;
      const r = el.getBoundingClientRect();
      const inView =
        r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.05;
      if (inView) setVisible(true);
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      io.disconnect();
    };
  }, [reduce]);

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-6", className)} style={style}>
      {models.map((model, pi) => {
        let wordIdx = -1;
        return (
          <p key={model.key} className={cn(paragraphClassName)}>
            {model.pieces.map((piece) => {
              if (piece.type === "space") {
                return <span key={piece.key}>{piece.value}</span>;
              }
              wordIdx += 1;
              const line = wordLines?.[pi]?.[wordIdx] ?? 0;
              const shown = reduce || visible;
              return (
                <span
                  key={piece.key}
                  data-bio-p={pi}
                  data-lr-word
                  className="inline"
                  style={{
                    opacity: shown ? 1 : 0,
                    transition: `opacity ${duration}s cubic-bezier(0.22,1,0.36,1) ${
                      line * stagger
                    }s`,
                  }}
                >
                  {piece.node}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
