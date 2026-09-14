"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { product } from "@/content/pitiusa";
import WordFade, { type WordFadeHandle } from "./WordFade";

const materials = product.materials.charAt(0).toUpperCase() + product.materials.slice(1);
const TITLE = "Une sculpture, jusqu'à ce qu'elle prenne vie.";
const lines = [
  `${materials}, façonnés par un réseau d'artisans français.`,
  "À l'intérieur, la technologie la plus avancée que le marché puisse offrir — retour de force, environnements 3D, écran incurvé — au service d'une expérience que rien d'autre ne propose.",
];

export default function ProductSection() {
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<WordFadeHandle>(null);
  const line0Ref = useRef<WordFadeHandle>(null);
  const line1Ref = useRef<WordFadeHandle>(null);

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

      titleRef.current?.setProgress(Math.min(1, progress / 0.3));
      line0Ref.current?.setProgress(Math.max(0, Math.min(1, (progress - 0.28) / 0.3)));
      line1Ref.current?.setProgress(Math.max(0, Math.min(1, (progress - 0.56) / 0.3)));
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

  if (reduced) {
    return (
      <section id="art-station" className="relative bg-ink px-6 py-28 md:px-12 md:py-40">
        <div className="relative mx-auto max-w-4xl">
          <h2 className="font-display text-5xl leading-tight text-bone md:text-7xl">{TITLE}</h2>
          <div className="mt-10 flex flex-col gap-6">
            {lines.map((line, i) => (
              <p key={i} className="max-w-3xl text-2xl leading-relaxed text-bone-dim md:text-3xl">
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="art-station"
      ref={wrapperRef}
      className="relative bg-ink"
      style={{ height: "260svh" }}
    >
      <div className="sticky top-0 flex h-svh w-full items-center overflow-hidden px-6 md:px-12">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-oak/10 blur-[160px]" />

        <div className="relative mx-auto max-w-4xl">
          <WordFade
            ref={titleRef}
            text={TITLE}
            className="font-display text-5xl leading-tight text-bone md:text-7xl"
          />
          <div className="mt-10 flex flex-col gap-6">
            <WordFade
              ref={line0Ref}
              text={lines[0]}
              className="block max-w-3xl text-2xl leading-relaxed text-bone-dim md:text-3xl"
            />
            <WordFade
              ref={line1Ref}
              text={lines[1]}
              className="block max-w-3xl text-2xl leading-relaxed text-bone-dim md:text-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
