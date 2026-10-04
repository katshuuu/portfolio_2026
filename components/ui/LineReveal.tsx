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
  type ReactElement,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type LineRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
};

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

/**
 * Line-by-line reveal on scroll. Text stays visible until a real below-fold
 * entrance, then lines animate in without a blank flash on first paint.
 */
export function LineReveal({
  children,
  className,
  delay = 0,
  stagger = 0.09,
  duration = 0.55,
}: LineRevealProps) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLParagraphElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const enteredBelow = useRef(false);
  const [lineBreaks, setLineBreaks] = useState<number[] | null>(null);
  const [animating, setAnimating] = useState(false);

  const pieces = useMemo(() => toPieces(children), [children]);
  const words = useMemo(
    () => pieces.filter((p): p is Extract<Piece, { type: "word" }> => p.type === "word"),
    [pieces],
  );

  const measure = () => {
    const root = measureRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-lr-word]"));
    if (!els.length) {
      setLineBreaks([0]);
      return;
    }
    const breaks = [0];
    let top = els[0].offsetTop;
    els.forEach((el, i) => {
      if (i === 0) return;
      if (Math.abs(el.offsetTop - top) > 2) {
        breaks.push(i);
        top = el.offsetTop;
      }
    });
    setLineBreaks(breaks);
  };

  useLayoutEffect(() => {
    if (reduce) return;
    measure();
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    void document.fonts?.ready?.then(() => measure());
    return () => ro.disconnect();
  }, [reduce, pieces]);

  useEffect(() => {
    if (reduce) return;
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          enteredBelow.current = true;
          return;
        }
        if (enteredBelow.current) {
          setAnimating(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  if (reduce || !lineBreaks || !animating) {
    return (
      <p ref={rootRef} className={cn(className)}>
        <span ref={measureRef}>
          {pieces.map((piece) =>
            piece.type === "space" ? (
              <span key={piece.key}>{piece.value}</span>
            ) : (
              <span key={piece.key} data-lr-word className="inline">
                {piece.node}
              </span>
            ),
          )}
        </span>
      </p>
    );
  }

  const lineNodes: ReactNode[] = [];
  for (let li = 0; li < lineBreaks.length; li++) {
    const start = lineBreaks[li];
    const end = lineBreaks[li + 1] ?? words.length;
    const content: ReactNode[] = [];
    let wordCursor = -1;

    for (const piece of pieces) {
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
      <span key={`line-${li}`} className="block overflow-hidden">
        <span
          className="line-reveal-line block w-full"
          style={{
            animationDelay: `${delay + li * stagger}s`,
            animationDuration: `${duration}s`,
          }}
        >
          {content}
        </span>
      </span>,
    );
  }

  return (
    <p ref={rootRef} className={cn("relative", className)}>
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 opacity-0"
      >
        {pieces.map((piece) =>
          piece.type === "space" ? (
            <span key={`m-${piece.key}`}>{piece.value}</span>
          ) : (
            <span key={`m-${piece.key}`} data-lr-word className="inline">
              {piece.node}
            </span>
          ),
        )}
      </span>
      {lineNodes}
    </p>
  );
}
