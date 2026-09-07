"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

const slides = [
  { src: "/images/interior-side.jpg", caption: "Une silhouette sculptée dans la matière." },
  { src: "/images/cockpit-top.jpg", caption: "Un poste de pilotage haute-fidélité." },
  { src: "/images/chassis-top.jpg", caption: "Une architecture entièrement modulable." },
  { src: "/images/rear-detail.jpg", caption: "Une œuvre pensée sous tous les angles." },
  { src: "/images/loft-top.jpg", caption: "Une présence qui redéfinit l'espace." },
];

const COUNT = slides.length;

export default function CarouselSection() {
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const captionRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const lastCardRect = useRef<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const scrollable = wrapper.offsetHeight - vh;
      const raw = scrollable > 0 ? -rect.top / scrollable : 0;
      const progress = Math.min(1, Math.max(0, raw));

      const segment = 1 / COUNT;
      const continuous = progress / segment; // fractional position across the deck
      const index = Math.min(COUNT - 1, Math.floor(continuous));
      const localT = continuous - index;
      const isDesktop = vw >= 768;
      const spacingVw = isDesktop ? 34 : 0;
      const spacingVh = isDesktop ? 0 : 30;

      const isLastFocused = index === COUNT - 1;

      slides.forEach((_, i) => {
        const card = cardRefs.current[i];
        const caption = captionRefs.current[i];
        if (!card) return;

        // The last card, once focused, breaks out of the deck entirely and
        // grows to cover the full viewport — handled as a special case.
        if (i === COUNT - 1 && isLastFocused) {
          if (!lastCardRect.current) {
            const r = card.getBoundingClientRect();
            lastCardRect.current = { top: r.top, left: r.left, width: r.width, height: r.height };
          }
          const start = lastCardRect.current;
          const growT = 1 - Math.pow(1 - Math.min(1, localT / 0.85), 3);
          const fadeT = Math.max(0, (localT - 0.86) / 0.14);

          const top = start.top * (1 - growT);
          const left = start.left * (1 - growT);
          const width = start.width + (vw - start.width) * growT;
          const height = start.height + (vh - start.height) * growT;

          card.style.position = "fixed";
          card.style.top = `${top}px`;
          card.style.left = `${left}px`;
          card.style.width = `${width}px`;
          card.style.height = `${height}px`;
          card.style.transform = "none";
          card.style.opacity = `${1 - fadeT}`;
          card.style.borderRadius = `${Math.max(0, 1.5 * (1 - growT)).toFixed(2)}rem`;
          card.style.zIndex = "40";
          card.style.filter = "none";
          if (caption) caption.style.opacity = `${1 - growT}`;
          return;
        }

        // Every other card (including the last one before it's focused)
        // sits on a smooth, continuously scroll-linked "coverflow" track.
        if (lastCardRect.current && i === COUNT - 1) {
          card.style.position = "";
          card.style.top = "";
          card.style.left = "";
          card.style.width = "";
          card.style.height = "";
          lastCardRect.current = null;
        }

        const offset = i - continuous;
        const absOffset = Math.abs(offset);
        const scale = Math.max(0.5, 1.06 - absOffset * 0.26);
        const opacity = Math.max(0, 1 - absOffset * 0.7);
        const brightness = Math.max(0.4, 1 - Math.min(absOffset, 1) * 0.55);

        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.width = "";
        card.style.height = "";
        card.style.zIndex = `${100 - Math.round(absOffset * 10)}`;
        card.style.borderRadius = "1.5rem";
        card.style.transform = isDesktop
          ? `translate3d(calc(-50% + ${(offset * spacingVw).toFixed(2)}vw), -50%, 0) scale(${scale.toFixed(3)})`
          : `translate3d(-50%, calc(-50% + ${(offset * spacingVh).toFixed(2)}vh), 0) scale(${scale.toFixed(3)})`;
        card.style.opacity = `${opacity.toFixed(3)}`;
        card.style.filter = `brightness(${brightness.toFixed(2)}) saturate(${brightness.toFixed(2)})`;
        if (caption) caption.style.opacity = `${Math.max(0, 1 - absOffset * 2.2).toFixed(2)}`;
      });
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <section className="bg-ink px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 font-display text-4xl text-bone md:text-5xl">
            En images
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {slides.map((s) => (
              <div
                key={s.src}
                className="relative aspect-[4/3] w-[45%] min-w-[220px] flex-1 overflow-hidden rounded-2xl shadow-xl"
              >
                <Image src={s.src} alt={s.caption} fill sizes="30vw" className="object-cover" />
                <p className="absolute bottom-4 left-4 font-display text-lg text-bone">{s.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      className="relative bg-ink"
      style={{ height: `${COUNT * 100}svh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={s.src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute left-1/2 top-1/2 aspect-[3/4] w-[46vw] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.35)] ring-1 ring-brass-dim/50 md:aspect-[4/3] md:w-[27vw]"
            style={{ borderRadius: "1.5rem", willChange: "transform, opacity" }}
          >
            <Image
              src={s.src}
              alt={s.caption}
              fill
              sizes="(min-width: 768px) 27vw, 46vw"
              className="object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
            <p
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              className="absolute bottom-6 left-6 right-6 font-display text-2xl text-bone md:bottom-10 md:left-10 md:text-4xl"
            >
              {s.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
