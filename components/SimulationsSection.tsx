import Reveal from "./Reveal";
import LaurelQuote from "./LaurelQuote";
import SimulationCard from "./SimulationCard";
import { simulations } from "@/content/simulations";

export default function SimulationsSection() {
  return (
    <section className="relative bg-surface px-6 py-24 md:px-12 md:py-32">
      <LaurelQuote />

      <div className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 md:mt-20 md:grid-cols-4 md:gap-6">
        {simulations.map((simulation, i) => (
          <Reveal key={simulation.slug} delayMs={i * 90} className="h-full">
            <SimulationCard simulation={simulation} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
