import Image from "next/image";
import Reveal from "./Reveal";

type Annotation = {
  dotX: number;
  dotY: number;
  labelY: number;
  side: "left" | "right";
  labelAnchor: number;
  title: string;
  text: string;
};

const annotations: Annotation[] = [
  {
    dotX: 50,
    dotY: 22,
    labelY: 18,
    side: "right",
    labelAnchor: 73,
    title: "Écran incurvé",
    text: "Un champ de vision continu, sans rupture ni reflet parasite.",
  },
  {
    dotX: 42.4,
    dotY: 40,
    labelY: 14,
    side: "left",
    labelAnchor: 27,
    title: "Caissons acoustiques intégrés",
    text: "Le son est sculpté à même la coque, au plus près de l'oreille.",
  },
  {
    dotX: 50,
    dotY: 50,
    labelY: 50,
    side: "left",
    labelAnchor: 27,
    title: "Retour de force haute-fidélité",
    text: "Le mouvement, les g et les conditions de piste, restitués en temps réel.",
  },
  {
    dotX: 54.6,
    dotY: 56,
    labelY: 78,
    side: "right",
    labelAnchor: 73,
    title: "Navigation tactile embarquée",
    text: "Un écran unique condense toute la navigation — plus besoin de souris ni de clavier.",
  },
  {
    dotX: 37.8,
    dotY: 64,
    labelY: 88,
    side: "left",
    labelAnchor: 27,
    title: "Chêne et frêne massifs",
    text: "Chaque coque est façonnée à la main par notre réseau d'artisans.",
  },
];

export default function AnatomySection() {
  return (
    <section id="anatomie" className="relative bg-surface px-6 py-32 md:px-12 md:py-44">
      <Reveal variant="scale">
        <h2 className="mx-auto max-w-3xl text-center font-display text-4xl leading-tight text-bone md:text-6xl">
          Chaque détail a une raison d&rsquo;être.
        </h2>
      </Reveal>

      {/* Desktop: centred diagram with diagonal leader lines, generously spaced */}
      <Reveal variant="scale" delayMs={150}>
        <div className="relative mx-auto mt-24 hidden h-[760px] max-w-6xl md:block">
          <div
            className="absolute top-0 h-full overflow-hidden rounded-sm"
            style={{ left: "31%", width: "38%" }}
          >
            <Image
              src="/images/cockpit-top.jpg"
              alt="Vue de dessus du poste de pilotage de la Pitiusa Art Station"
              fill
              sizes="440px"
              className="object-cover"
            />
          </div>

          <svg
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {annotations.map((a, i) => (
              <line
                key={i}
                x1={a.dotX}
                y1={a.dotY}
                x2={a.labelAnchor}
                y2={a.labelY}
                stroke="var(--color-brass)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {annotations.map((a, i) => (
            <span
              key={i}
              className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-oak ring-4 ring-oak/25"
              style={{ left: `${a.dotX}%`, top: `${a.dotY}%` }}
            />
          ))}

          {annotations.map((a, i) => (
            <div
              key={i}
              className="absolute w-64"
              style={{
                top: `${a.labelY}%`,
                transform: "translateY(-50%)",
                ...(a.side === "left"
                  ? { right: `${100 - a.labelAnchor}%`, textAlign: "right" as const }
                  : { left: `${a.labelAnchor}%`, textAlign: "left" as const }),
              }}
            >
              <p className="font-display text-xl text-bone">{a.title}</p>
              <p className="mt-2 text-base text-bone-dim">{a.text}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Mobile: image + stacked legend */}
      <div className="mx-auto mt-16 flex max-w-md flex-col gap-8 md:hidden">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm">
          <Image
            src="/images/cockpit-top.jpg"
            alt="Vue de dessus du poste de pilotage de la Pitiusa Art Station"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <ol className="flex flex-col gap-6">
          {annotations.map((a, i) => (
            <Reveal key={i} delayMs={i * 60}>
              <li className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-oak text-xs text-oak">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg text-bone">{a.title}</p>
                  <p className="mt-1 text-sm text-bone-dim">{a.text}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
