import { notFound } from "next/navigation";
import Link from "next/link";
import { simulations } from "@/content/simulations";
import { Plane, Helicopter, Car, Drone } from "lucide-react";
import type { Metadata } from "next";

const icons = {
  plane: Plane,
  helicopter: Helicopter,
  car: Car,
  drone: Drone,
};

export function generateStaticParams() {
  return simulations.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const simulation = simulations.find((s) => s.slug === slug);
  if (!simulation) return {};
  return {
    title: `${simulation.title} — Pitiusa Art Station`,
    description: simulation.summary,
  };
}

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const simulation = simulations.find((s) => s.slug === slug);
  if (!simulation) notFound();

  const Icon = icons[simulation.icon];

  return (
    <main className="animate-[reveal-fade_600ms_ease-out_forwards] bg-ink px-6 py-32 md:px-12 md:py-40">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/#art-station"
          className="text-sm text-bone-dim transition-colors hover:text-oak"
        >
          ← Retour
        </Link>

        <div className="mt-10 flex flex-col items-start">
          <Icon className="h-12 w-12 text-oak" />
          <h1 className="mt-6 font-display text-4xl leading-tight text-bone md:text-6xl">
            {simulation.title}
          </h1>
        </div>

        <div className="mt-10 flex flex-col gap-6">
          {simulation.paragraphs.map((paragraph, i) => (
            <p key={i} className="text-lg leading-relaxed text-bone-dim">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </main>
  );
}
