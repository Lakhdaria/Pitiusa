"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Helicopter, Car, Drone } from "lucide-react";
import type { Simulation } from "@/content/simulations";

const icons = {
  plane: Plane,
  helicopter: Helicopter,
  car: Car,
  drone: Drone,
};

export default function SimulationCard({ simulation }: { simulation: Simulation }) {
  const router = useRouter();
  const cardRef = useRef<HTMLButtonElement>(null);
  const [expanding, setExpanding] = useState(false);
  const Icon = icons[simulation.icon];

  const handleClick = () => {
    const card = cardRef.current;
    if (!card || expanding) return;

    const rect = card.getBoundingClientRect();
    const iconHTML = card.querySelector("svg")?.outerHTML ?? "";
    setExpanding(true);

    // Hide the original card in place (it keeps its grid slot, so
    // neighbouring cards never reflow) and animate a separate floating
    // clone instead — appended to <body>, entirely outside the grid.
    card.style.visibility = "hidden";

    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = "1rem";
    overlay.style.background = "var(--color-ink)";
    overlay.style.border = "1px solid var(--color-brass-dim)";
    overlay.style.zIndex = "60";
    overlay.style.overflow = "hidden";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.transition =
      "top 650ms cubic-bezier(0.16,1,0.3,1), left 650ms cubic-bezier(0.16,1,0.3,1), width 650ms cubic-bezier(0.16,1,0.3,1), height 650ms cubic-bezier(0.16,1,0.3,1), border-radius 480ms ease";

    // The icon + title ride along for the first part of the motion, then
    // fade — so the box doesn't just grow blank, it feels like the card
    // itself becomes the page.
    const inner = document.createElement("div");
    inner.style.display = "flex";
    inner.style.flexDirection = "column";
    inner.style.alignItems = "center";
    inner.style.gap = "16px";
    inner.style.color = "var(--color-oak)";
    inner.style.transition = "opacity 260ms ease, transform 400ms ease";
    inner.innerHTML = `${iconHTML}<span style="font-family:var(--font-display);font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:var(--color-bone);">${simulation.title}</span>`;
    overlay.appendChild(inner);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.top = "0px";
        overlay.style.left = "0px";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.borderRadius = "0px";
      });
    });

    window.setTimeout(() => {
      inner.style.opacity = "0";
      inner.style.transform = "scale(1.15)";
    }, 260);

    window.setTimeout(() => {
      router.push(`/simulations/${simulation.slug}`);
      // Give the new page a moment to paint underneath before clearing
      // the overlay, then fade it out so the handoff reads as one motion.
      window.setTimeout(() => {
        overlay.style.transition = "opacity 300ms ease";
        overlay.style.opacity = "0";
        window.setTimeout(() => overlay.remove(), 320);
      }, 120);
    }, 650);
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      aria-label={`En savoir plus sur ${simulation.title}`}
      className="group flex h-full w-full flex-col items-center justify-center gap-4 rounded-2xl border border-brass-dim/40 bg-ink px-8 py-12 text-center transition-all duration-300 hover:-translate-y-1 hover:border-oak/60 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
    >
      <Icon className="h-10 w-10 text-oak transition-transform duration-300 group-hover:scale-110" />
      <h3 className="font-display text-sm uppercase tracking-[0.18em] text-bone">
        {simulation.title}
      </h3>
      <p className="max-w-xs text-sm leading-relaxed text-bone-dim">
        {simulation.summary}
      </p>
      <span className="mt-1 text-xs uppercase tracking-[0.15em] text-oak opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        En savoir plus
      </span>
    </button>
  );
}
