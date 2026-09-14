"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Side = "top" | "bottom" | "left" | "right";

type Annotation = {
  dotX: number;
  dotY: number;
  side: Side;
  title: string;
  text: string;
};

// Coordinates are local to the image itself (0–100, both axes), measured
// directly off crops of front-detail-transp.png. Each caption sits on a
// different side of the image (top / left / bottom / right) for variety,
// with a short leader line rather than a long one.
const annotations: Annotation[] = [
  {
    dotX: 50,
    dotY: 27,
    side: "top",
    title: "Écran incurvé",
    text: "Un champ de vision continu, sans rupture ni reflet parasite.",
  },
  {
    dotX: 42,
    dotY: 37,
    side: "left",
    title: "Caissons acoustiques intégrés",
    text: "Le son est sculpté à même la coque, au plus près de l'oreille.",
  },
  {
    dotX: 50,
    dotY: 40,
    side: "bottom",
    title: "Retour de force haute-fidélité",
    text: "Le mouvement, les g et les conditions de piste, restitués en temps réel.",
  },
  {
    dotX: 58,
    dotY: 41,
    side: "right",
    title: "Navigation tactile embarquée",
    text: "Un écran unique condense toute la navigation — plus besoin de souris ni de clavier.",
  },
  {
    dotX: 35,
    dotY: 63,
    side: "left",
    title: "Chêne et frêne massifs",
    text: "Chaque coque est façonnée à la main par notre réseau d'artisans.",
  },
];

const COUNT = annotations.length;
const GAP = 16;
// Measured directly from the PNG's alpha channel: the actual subject
// (non-transparent pixels) only spans this fraction of the canvas —
// there's generous transparent padding on both sides we can use for
// left/right captions even when the image itself is shown at 100% width.
const SUBJECT_LEFT = 34.7;
const SUBJECT_RIGHT = 65.3;

function anchorFor(side: Side, dotX: number, dotY: number, imgLeft: number, imgTop: number, imgW: number, imgH: number) {
  const px = imgLeft + (dotX / 100) * imgW;
  const py = imgTop + (dotY / 100) * imgH;
  const subjectLeftPx = imgLeft + (SUBJECT_LEFT / 100) * imgW;
  const subjectRightPx = imgLeft + (SUBJECT_RIGHT / 100) * imgW;
  switch (side) {
    case "top":
      return { x: px, y: imgTop - GAP, translate: "translate(-50%, -100%)", align: "center" as const };
    case "bottom":
      return { x: px, y: imgTop + imgH + GAP, translate: "translate(-50%, 0%)", align: "center" as const };
    case "left":
      return { x: subjectLeftPx - GAP, y: py, translate: "translate(-100%, -50%)", align: "right" as const };
    case "right":
      return { x: subjectRightPx + GAP, y: py, translate: "translate(0%, -50%)", align: "left" as const };
  }
}

export default function AnatomySection() {
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const lastIndex = useRef(-1);

  useEffect(() => {
    if (reduced) return;
    const wrapper = wrapperRef.current;
    const diagram = diagramRef.current;
    const imageWrap = imageWrapRef.current;
    if (!wrapper || !diagram || !imageWrap) return;

    let ticking = false;
    let listening = false;

    const update = () => {
      ticking = false;
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollable = wrapper.offsetHeight - vh;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

      // Measured every frame — never a pre-guessed percentage.
      const diagramRect = diagram.getBoundingClientRect();
      const imgRect = imageWrap.getBoundingClientRect();
      const imgLeft = imgRect.left - diagramRect.left;
      const imgTop = imgRect.top - diagramRect.top;

      if (svgRef.current) {
        svgRef.current.setAttribute("viewBox", `0 0 ${diagramRect.width} ${diagramRect.height}`);
      }

      const continuous = progress * COUNT;
      const index = Math.min(COUNT - 1, Math.floor(continuous));
      const localT = continuous - index;
      const a = annotations[index];
      const anchor = anchorFor(a.side, a.dotX, a.dotY, imgLeft, imgTop, imgRect.width, imgRect.height);

      const dotPxX = imgLeft + (a.dotX / 100) * imgRect.width;
      const dotPxY = imgTop + (a.dotY / 100) * imgRect.height;

      if (index !== lastIndex.current) {
        lastIndex.current = index;
        if (titleRef.current) titleRef.current.textContent = a.title;
        if (textRef.current) textRef.current.textContent = a.text;
        if (captionRef.current) captionRef.current.style.textAlign = anchor.align;
      }

      const draw = Math.min(1, localT / 0.22);
      const captionIn = Math.max(0, Math.min(1, (localT - 0.22) / 0.14));
      const exit = Math.max(0, (localT - 0.72) / 0.28);
      const visible = 1 - exit;

      const dx = dotPxX - anchor.x;
      const dy = dotPxY - anchor.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (lineRef.current) {
        const line = lineRef.current;
        line.setAttribute("x1", `${anchor.x}`);
        line.setAttribute("y1", `${anchor.y}`);
        line.setAttribute("x2", `${dotPxX}`);
        line.setAttribute("y2", `${dotPxY}`);
        line.setAttribute("stroke-dasharray", `${len}`);
        line.style.strokeDashoffset = `${len * (1 - draw)}`;
        line.style.opacity = `${visible}`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPxX}px, ${dotPxY}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = `${Math.min(1, draw * 3) * visible}`;
      }
      if (captionRef.current) {
        captionRef.current.style.transform = `translate3d(${anchor.x}px, ${anchor.y}px, 0) ${anchor.translate}`;
        captionRef.current.style.opacity = `${captionIn * visible}`;
      }
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
      { rootMargin: "0px", threshold: 0 }
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
      <section id="anatomie" className="relative bg-surface px-6 py-32 md:px-12 md:py-44">
        <h2 className="mx-auto max-w-3xl text-center font-display text-4xl leading-tight text-bone md:text-6xl">
          Chaque détail a une raison d&rsquo;être.
        </h2>
        <div className="mx-auto mt-16 flex max-w-md flex-col gap-8">
          <div className="relative aspect-[1800/1013] w-full">
            <Image
              src="/images/front-detail-transp.png"
              alt="Vue de face du poste de pilotage de la Pitiusa Art Station"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <ol className="flex flex-col gap-6">
            {annotations.map((a, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-oak text-xs text-oak">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg text-bone">{a.title}</p>
                  <p className="mt-1 text-sm text-bone-dim">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrapperRef} className="relative bg-surface" style={{ height: `${COUNT * 95 + 40}svh` }}>
      <div className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden px-6 md:px-12">
        <h2 className="mb-6 max-w-3xl text-center font-display text-3xl leading-tight text-bone md:mb-8 md:text-5xl">
          Chaque détail a une raison d&rsquo;être.
        </h2>

        {/* Desktop: a large diagram stage. The image sits in normal flow
            (so the box naturally sizes to it); the dot/line are positioned
            from its *measured* rect. The caption always sits in one safe,
            centred zone below the image, so it's never at risk of running
            off either edge of the screen — only the line's direction and
            length vary per annotation. */}
        <div ref={diagramRef} className="relative mx-auto hidden w-full max-w-[1200px] pb-32 md:block">
          <div ref={imageWrapRef} className="relative mx-auto aspect-[1800/1013] w-full">
            <Image
              src="/images/front-detail-transp.png"
              alt="Vue de face du poste de pilotage de la Pitiusa Art Station"
              fill
              sizes="1200px"
              className="object-contain"
              priority
            />
          </div>

          <svg
            ref={svgRef}
            className="absolute inset-0 h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <line
              ref={lineRef}
              stroke="var(--color-oak)"
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span
            ref={dotRef}
            className="absolute left-0 top-0 z-10 h-3 w-3 rounded-full bg-oak ring-4 ring-oak/25"
            style={{ opacity: 0 }}
          />

          <div
            ref={captionRef}
            className="absolute left-0 top-0 w-64 text-center"
            style={{ opacity: 0 }}
          >
            <p ref={titleRef} className="font-display text-2xl text-bone" />
            <p ref={textRef} className="mt-3 text-base text-bone-dim" />
          </div>
        </div>

        {/* Mobile: static image + full stacked legend (no scroll-jacking on touch) */}
        <div className="mx-auto mt-2 flex w-full max-w-md flex-col gap-8 md:hidden">
          <div className="relative aspect-[1800/1013] w-full">
            <Image
              src="/images/front-detail-transp.png"
              alt="Vue de face du poste de pilotage de la Pitiusa Art Station"
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <ol className="flex flex-col gap-6 overflow-y-auto">
            {annotations.map((a, i) => (
              <li key={i} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-oak text-xs text-oak">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg text-bone">{a.title}</p>
                  <p className="mt-1 text-sm text-bone-dim">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
