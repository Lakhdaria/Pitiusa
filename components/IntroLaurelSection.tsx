"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { LaurelBranch } from "./icons";
import WordFade, { type WordFadeHandle } from "./WordFade";

const QUOTE =
  "Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia.";

export default function IntroLaurelSection() {
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<WordFadeHandle>(null);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    let ticking = false;
    let listening = false;

    const update = () => {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = wrapper.offsetHeight - vh;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

      const laurelT = Math.min(1, progress / 0.4);
      const titleT = Math.max(0, Math.min(1, (progress - 0.2) / 0.6));

      const laurelEase = 1 - Math.pow(1 - laurelT, 3);

      if (leftRef.current) {
        leftRef.current.style.opacity = `${0.05 + laurelEase * 0.95}`;
      }
      if (rightRef.current) {
        rightRef.current.style.opacity = `${0.05 + laurelEase * 0.95}`;
      }
      titleRef.current?.setProgress(titleT);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries[0]?.isIntersecting ?? false;
        if (intersecting && !listening) {
          listening = true;
          window.addEventListener("scroll", onScroll, { passive: true });
          window.addEventListener("resize", onScroll);
          update();
        } else if (!intersecting && listening) {
          listening = false;
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      },
      { rootMargin: "20% 0px 20% 0px", threshold: 0 }
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  const titleClass = "font-quote italic text-4xl leading-snug text-bone md:text-7xl";

  if (reduced) {
    return (
      <section className="bg-surface px-6 py-32 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:items-center md:gap-12">
          <LaurelBranch className="h-40 w-16 shrink-0 text-brass md:h-80 md:w-32 md:translate-y-8" />
          <p className={titleClass}>{QUOTE}</p>
          <LaurelBranch flip className="h-40 w-16 shrink-0 text-brass md:h-80 md:w-32 md:-translate-y-10" />
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative bg-surface" style={{ height: "220svh" }}>
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden px-6 md:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 text-center md:flex-row md:items-center md:gap-16">
          <div
            ref={leftRef}
            className="md:translate-y-8"
            style={{ opacity: 0, willChange: "opacity" }}
          >
            <LaurelBranch className="h-48 w-20 shrink-0 text-brass md:h-[26rem] md:w-40" />
          </div>
          <WordFade ref={titleRef} text={QUOTE} className={titleClass} />
          <div
            ref={rightRef}
            className="md:-translate-y-10"
            style={{ opacity: 0, willChange: "opacity" }}
          >
            <LaurelBranch flip className="h-48 w-20 shrink-0 text-brass md:h-[26rem] md:w-40" />
          </div>
        </div>
      </div>
    </section>
  );
}
