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
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = wrapper.offsetHeight - vh;
      const raw = scrollable > 0 ? -rect.top / scrollable : 0;
      const progress = Math.min(1, Math.max(0, raw));

      const segment = 1 / COUNT;
      const rawIndex = progress / segment;
      const index = Math.min(COUNT - 1, Math.floor(rawIndex));
      const localT = rawIndex - index;

      frameRefs.current.forEach((el, i) => {
        if (!el) return;
        if (i < index) {
          el.style.opacity = "0";
          el.style.transform = "scale(1.04)";
        } else if (i === index) {
          const isLast = i === COUNT - 1;
          if (isLast) {
            const exitT = Math.max(0, (localT - 0.6) / 0.4);
            const scale = 1 + exitT * 1.8;
            el.style.opacity = `${1 - exitT}`;
            el.style.transform = `scale(${scale.toFixed(3)})`;
          } else {
            const outT = Math.max(0, (localT - 0.72) / 0.28);
            el.style.opacity = `${1 - outT}`;
            el.style.transform = `scale(${(1 + outT * 0.06).toFixed(3)})`;
          }
        } else {
          el.style.opacity = "0";
          el.style.transform = "scale(0.98)";
        }
      });

      dotRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.backgroundColor = i === index ? "var(--color-oak)" : "var(--color-brass-dim)";
        el.style.transform = i === index ? "scale(1.4)" : "scale(1)";
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
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-10 font-display text-4xl text-bone md:text-5xl">
            En images
          </h2>
          <div className="flex snap-x gap-6 overflow-x-auto pb-4">
            {slides.map((s) => (
              <div
                key={s.src}
                className="relative aspect-[4/3] w-[80%] shrink-0 snap-center md:w-[45%]"
              >
                <Image
                  src={s.src}
                  alt={s.caption}
                  fill
                  sizes="60vw"
                  className="rounded-sm object-cover"
                />
                <p className="absolute bottom-4 left-4 font-display text-xl text-bone md:text-2xl">
                  {s.caption}
                </p>
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
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-ink">
        {slides.map((s, i) => (
          <div
            key={s.src}
            ref={(el) => {
              frameRefs.current[i] = el;
            }}
            className="absolute inset-0"
            style={{
              opacity: i === 0 ? 1 : 0,
              willChange: "transform, opacity",
            }}
          >
            <Image
              src={s.src}
              alt={s.caption}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-ink/35" />
            <div className="absolute bottom-16 left-6 md:left-12">
              <p className="max-w-2xl font-display text-3xl text-bone md:text-5xl">
                {s.caption}
              </p>
            </div>
          </div>
        ))}

        <div className="absolute right-6 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3 md:right-12">
          {slides.map((_, i) => (
            <span
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="h-2 w-2 rounded-full transition-transform duration-300"
              style={{ backgroundColor: "var(--color-brass-dim)" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
