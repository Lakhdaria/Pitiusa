"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

export type WordFadeHandle = {
  setProgress: (t: number) => void;
};

/**
 * Splits text into words, each independently opacity-controlled. The
 * parent drives a single 0→1 progress value (typically from a pinned
 * scroll section); each word occupies an equal linear slice of that
 * range and fades in within its slice, so words light up one after
 * another as progress advances — and dim back down just as smoothly
 * if it reverses.
 */
const WordFade = forwardRef<
  WordFadeHandle,
  { text: string; className?: string; as?: "span" | "p" | "h2" }
>(function WordFade({ text, className = "" }, ref) {
  const words = useMemo(() => text.split(" "), [text]);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(t: number) {
        const n = words.length;
        spanRefs.current.forEach((el, i) => {
          if (!el) return;
          const start = i / n;
          const end = (i + 1) / n;
          const local = (t - start) / (end - start);
          const opacity = Math.max(0.05, Math.min(1, local));
          el.style.opacity = `${opacity}`;
        });
      },
    }),
    [words.length]
  );

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          ref={(el) => {
            spanRefs.current[i] = el;
          }}
          style={{ opacity: 0.05, display: "inline-block" }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
});

export default WordFade;
