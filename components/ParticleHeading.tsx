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

const MAX_PARTICLES = 60000;

export default function ParticleHeading({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
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
    let particleColor = "#ede6d8";

    const build = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particleColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--color-bone")
          .trim() || "#ede6d8";

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;

      const isDesktop = width >= 768;
      const fontSize = Math.round(width * (isDesktop ? 0.078 : 0.14));
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
      const step = Math.max(1, Math.round(Math.sqrt((width * height) / MAX_PARTICLES)));
      const next: Particle[] = [];

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
              size: 0.9 + Math.random() * 0.6,
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
      if (document.hidden) {
        cancelAnimationFrame(animationId);
        animationId = 0;
      } else if (!animationId) {
        animationId = requestAnimationFrame(step);
      }
    };

    document.fonts.ready.then(() => {
      if (cancelled) return;
      build();
      animationId = requestAnimationFrame(step);
    });

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, text]);

  if (reduced) {
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
