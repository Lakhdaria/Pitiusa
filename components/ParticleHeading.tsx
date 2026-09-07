"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Particle = {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

const MAX_PARTICLES_DESKTOP = 60000;
const MAX_PARTICLES_MOBILE = 9000;

export default function ParticleHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const skipCanvas = reduced;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (skipCanvas) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let animationId = 0;
    let ready = false;
    let cancelled = false;
    let inView = false;
    const particleColor = "#211e1a";

    const build = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      const desktop = width >= 768;
      // Cap device pixel ratio harder on mobile: this canvas is redrawn
      // every frame, so backing-store resolution directly sets the cost
      // of every clearRect/fillRect call.
      const dpr = Math.min(window.devicePixelRatio || 1, desktop ? 2 : 1.5);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fixed dark ink tone — kept in sync manually with --color-bone in
      // globals.css rather than read at runtime, since a stale/empty
      // lookup here would silently fall back to an invisible colour.

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      const fontSize = Math.round(width * (desktop ? 0.078 : 0.14));
      const lineHeight = fontSize * 1.18;
      offCtx.font = `600 ${fontSize}px "Fraunces Variable", Georgia, serif`;
      offCtx.textBaseline = "middle";
      offCtx.textAlign = "center";
      offCtx.fillStyle = "#fff";

      const words = text.split(" ");
      const maxLineWidth = width * 0.94;
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (offCtx.measureText(test).width > maxLineWidth && current) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);

      const totalHeight = lines.length * lineHeight;
      const startY = height / 2 - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        offCtx.fillText(line, width / 2, startY + i * lineHeight);
      });

      const { data } = offCtx.getImageData(0, 0, width, height);
      const maxParticles = desktop ? MAX_PARTICLES_DESKTOP : MAX_PARTICLES_MOBILE;
      const step = Math.max(1, Math.round(Math.sqrt((width * height) / maxParticles)));
      const next: Particle[] = [];
      const sizeBase = desktop ? 0.9 : 1.3;
      const sizeRange = desktop ? 0.6 : 0.8;

      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          const alpha = data[(py * width + px) * 4 + 3];
          if (alpha > 120) {
            next.push({
              homeX: px,
              homeY: py,
              x: px + (Math.random() - 0.5) * 70,
              y: py + (Math.random() - 0.5) * 70,
              vx: 0,
              vy: 0,
              size: sizeBase + Math.random() * sizeRange,
            });
          }
        }
      }

      particles = next;
      ready = true;
    };

    const step = () => {
      if (ready) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = particleColor;
        for (const p of particles) {
          const dxHome = p.homeX - p.x;
          const dyHome = p.homeY - p.y;
          p.vx += dxHome * 0.022;
          p.vy += dyHome * 0.022;

          const dxMouse = p.x - mouseX;
          const dyMouse = p.y - mouseY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          const repelRadius = 90;
          if (distMouse < repelRadius) {
            const force = (1 - distMouse / repelRadius) * 6.5;
            const angle = Math.atan2(dyMouse, dxMouse);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          p.vx *= 0.82;
          p.vy *= 0.82;
          p.x += p.vx;
          p.y += p.vy;

          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      }
      animationId = requestAnimationFrame(step);
    };

    const startLoop = () => {
      if (!animationId) animationId = requestAnimationFrame(step);
    };
    const stopLoop = () => {
      cancelAnimationFrame(animationId);
      animationId = 0;
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    const onResize = () => build();
    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (inView) startLoop();
    };

    // Only run the physics loop while this heading is actually on screen —
    // it sits inside a long sticky "pause" section, so it would otherwise
    // keep simulating tens of thousands of particles long after scrolling
    // past it.
    const observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView && !document.hidden) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    observer.observe(container);

    document.fonts.ready.then(() => {
      if (cancelled) return;
      build();
      if (inView) startLoop();
    });

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      observer.disconnect();
      stopLoop();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [skipCanvas, text]);

  if (skipCanvas) {
    return (
      <h2
        className={`flex h-full w-full items-center justify-center text-center font-display text-4xl leading-tight text-bone md:text-6xl ${className}`}
      >
        {text}
      </h2>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-full w-full ${className}`}
      role="heading"
      aria-level={2}
      aria-label={text}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
