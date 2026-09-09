"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollProgress } from "@/lib/useScrollProgress";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useIsDesktop } from "@/lib/useIsDesktop";

export default function Hero() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const sectionEl = useRef<HTMLElement | null>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const [mounted, setMounted] = useState(false);

  // Drive the load-in sequence from React state rather than a named
  // @keyframes animation, so it never silently breaks if the keyframes
  // get renamed or removed elsewhere. Two rAFs guarantee the browser has
  // painted the initial (hidden) state before we flip to visible, so the
  // CSS transition actually has something to animate from.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  // Cursor parallax on the hero image — a few px of drift, purely decorative.
  // Applied to an inner layer only: the layer that clips the photo (and
  // therefore defines where the white frame's edge sits) never moves, so
  // the parallax can never drift over the border regardless of cursor
  // position. Desktop-only (no real cursor on touch), and paused whenever
  // the hero scrolls out of view so this rAF loop doesn't run forever.
  useEffect(() => {
    if (reduced || !isDesktop) return;
    const section = sectionEl.current;
    if (!section) return;

    let raf = 0;
    let running = false;
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
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${curX.toFixed(
          2
        )}px, ${curY.toFixed(2)}px, 0) scale(1.08)`;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      window.addEventListener("mousemove", onMove, { passive: true });
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [reduced, isDesktop]);

  // As the hero scrolls out, the headline gains weight and fades all the
  // way out — a genuine disappearance, not just a partial dim — so the
  // transition into the next section reads as intentional.
  const onProgress = useCallback((progress: number) => {
    const el = headlineRef.current;
    if (!el) return;
    // A full-viewport hero starts already "half through" this generic
    // 0→1 scroll range (it never enters from below the fold) — so treat
    // 0.5 as the resting, fully-opaque baseline and only fade from there
    // as the section actually scrolls away.
    const fade = Math.max(0, Math.min(1, (progress - 0.5) / 0.5));
    const weight = 380 + fade * 260;
    el.style.setProperty("font-variation-settings", `'wght' ${weight.toFixed(0)}`);
    el.style.opacity = `${Math.max(0, 1 - fade * 1.4)}`;
    el.style.transform = `translate3d(0, ${(fade * 32).toFixed(1)}px, 0)`;
  }, []);

  const sectionRef = useScrollProgress<HTMLElement>({
    onProgress,
    disabled: reduced,
  });

  return (
    <section
      ref={(el) => {
        sectionRef.current = el;
        sectionEl.current = el;
      }}
      className="relative h-svh min-h-[640px] w-full overflow-hidden bg-surface"
    >
      <div className="absolute inset-0 overflow-hidden rounded-[1.25rem] bg-white px-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] md:rounded-[1.5rem] md:px-3">
        {/* Static clipping window: fixed size and position, defines the
            visible frame. Never transforms, so the white border it sits
            inside stays put no matter what the layer below is doing. */}
        <div className="relative h-full w-full overflow-hidden rounded-[0.85rem] md:rounded-[1rem]">
          <div ref={parallaxRef} className="absolute inset-0">
            <Image
              src="/images/interior-side.jpg"
              alt="Pitiusa Art Station installée dans un séjour, écran affichant le logo Pitiusa"
              fill
              priority
              sizes="100vw"
              className={`object-cover object-[65%_center] transition-opacity duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oak/10 blur-[140px]" />

      <div className="relative z-10 flex h-full flex-col items-start justify-start px-6 pt-32 text-left md:px-12 md:pt-40">
        <h1
          ref={headlineRef}
          className={`max-w-2xl font-display text-5xl leading-[1.05] transition-all duration-700 ease-out md:text-7xl ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{
            transitionDelay: "600ms",
            fontVariationSettings: "'wght' 380",
            color: "#3d2410",
            textShadow: "0 2px 28px rgba(255,255,255,0.55), 0 1px 3px rgba(0,0,0,0.25)",
          }}
        >
          Nous ne construisons pas un simulateur. Nous créons une nouvelle
          catégorie d&rsquo;art.
        </h1>
      </div>
    </section>
  );
}
