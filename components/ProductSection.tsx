import Reveal from "./Reveal";
import ScrollColorText from "./ScrollColorText";
import { product } from "@/content/pitiusa";

const introText =
  product.materials.charAt(0).toUpperCase() +
  product.materials.slice(1) +
  ", façonnés par un réseau d'artisans français. À l'intérieur, la technologie la plus avancée que le marché puisse offrir — retour de force, environnements 3D, écran incurvé — au service d'une expérience que rien d'autre ne propose.";

export default function ProductSection() {
  return (
    <section id="art-station" className="relative bg-ink px-6 py-28 md:px-12 md:py-40">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-oak/10 blur-[140px]" />

      <Reveal>
        <div className="relative mx-auto max-w-3xl">
          <h2 className="font-display text-4xl leading-tight text-bone md:text-6xl">
            Une sculpture, jusqu&rsquo;à ce qu&rsquo;elle prenne vie.
          </h2>
          <ScrollColorText
            text={introText}
            className="mt-8 max-w-2xl text-lg leading-relaxed md:text-xl"
          />
        </div>
      </Reveal>
    </section>
  );
}
