"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Variant = "up" | "scale" | "left" | "right";

const variantClass: Record<Variant, string> = {
  up: "reveal-up",
  scale: "reveal-scale",
  left: "reveal-left",
  right: "reveal-right",
};

export default function Reveal({
  children,
  delayMs = 0,
  variant = "up",
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  variant?: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animationDelay = `${delayMs}ms`;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} className={`reveal ${variantClass[variant]} ${className}`}>
      {children}
    </div>
  );
}
