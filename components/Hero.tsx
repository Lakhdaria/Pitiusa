"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Hero() {
  const reduced = useReducedMotion();
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  // Cursor parallax on the hero image — a few px of drift, purely decorative.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 14;
      targetY = ny * 10;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      if (imageWrapRef.current) {
        imageWrapRef.current.style.transform = `translate3d(${curX.toFixed(
          2
        )}px, ${curY.toFixed(2)}px, 0) scale(1.04)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  // Kinetic type: as the hero scrolls out, the headline gains weight and
  // fades slightly, so the transition into the next section feels intentional.
  const onProgress = useCallback((progress: number) => {
    const el = headlineRef.current;
    if (!el) return;
    const weight = 380 + progress * 260;
    el.style.setProperty("font-variation-settings", `'wght' ${weight.toFixed(0)}`);
    el.style.opacity = `${1 - progress * 0.6}`;
    el.style.transform = `translate3d(0, ${(progress * 24).toFixed(1)}px, 0)`;
  }, []);

  const sectionRef = useScrollProgress<HTMLDivElement>({
    onProgress,
    disabled: reduced,
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-svh min-h-[640px] w-full overflow-hidden bg-ink"
    >
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          src="/images/interior-side.jpg"
          alt="Pitiusa Art Station installée dans un séjour, écran affichant le logo Pitiusa"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[65%_center] opacity-0 animate-[reveal-up_1800ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
          style={{ animationDelay: "150ms" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-ink/45" />
      <div className="pointer-events-none absolute -bottom-32 left-[10%] h-[420px] w-[420px] rounded-full bg-oak/20 blur-[120px]" />

      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-16 md:px-12 md:pb-24">
        <p
          className="mb-5 max-w-lg text-base text-bone-dim opacity-0 animate-[reveal-up_900ms_cubic-bezier(0.16,1,0.3,1)_forwards] md:text-lg"
          style={{ animationDelay: "900ms" }}
        >
          Chêne français tricentenaire. Frêne centenaire. Une pièce unique,
          façonnée à la main.
        </p>
        <h1
          ref={headlineRef}
          className="max-w-4xl font-display text-5xl leading-[1.05] text-bone opacity-0 animate-[reveal-up_1000ms_cubic-bezier(0.16,1,0.3,1)_forwards] md:text-7xl"
          style={{ animationDelay: "1050ms", fontVariationSettings: "'wght' 380" }}
        >
          Nous ne construisons pas un simulateur. Nous créons une nouvelle
          catégorie d&rsquo;art.
        </h1>
      </div>

      <div
        className="absolute bottom-6 left-1/2 z-10 h-10 w-6 -translate-x-1/2 rounded-full border border-bone-dim/40 opacity-0 animate-[reveal-up_900ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
        style={{ animationDelay: "1400ms" }}
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-oak animate-bounce" />
      </div>
    </section>
  );
}
