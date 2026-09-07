"use client";

import Image from "next/image";
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
  color: string;
};

const IMAGE_SRC = "/images/chassis-top.jpg";
const MAX_PARTICLES = 6500;

export default function ArtStationParticles() {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let animationId = 0;
    let ready = false;

    const img = new window.Image();
    img.src = IMAGE_SRC;

    const build = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.drawImage(img, 0, 0, width, height);

      let data: Uint8ClampedArray;
      try {
        data = offCtx.getImageData(0, 0, width, height).data;
      } catch {
        return;
      }

      // Sample the flat render background from a corner pixel, then keep
      // only points that differ enough from it — isolating the object's
      // silhouette without needing a separate cut-out asset.
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];

      const step = Math.max(3, Math.round(Math.sqrt((width * height) / MAX_PARTICLES)));
      const next: Particle[] = [];

      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          const idx = (py * width + px) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          if (dist > 34) {
            next.push({
              homeX: px,
              homeY: py,
              x: px + (Math.random() - 0.5) * 30,
              y: py + (Math.random() - 0.5) * 30,
              vx: 0,
              vy: 0,
              size: 0.85 + Math.random() * 0.9,
              color: `rgb(${r}, ${g}, ${b})`,
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
        for (const p of particles) {
          const dxHome = p.homeX - p.x;
          const dyHome = p.homeY - p.y;
          p.vx += dxHome * 0.02;
          p.vy += dyHome * 0.02;

          const dxMouse = p.x - mouseX;
          const dyMouse = p.y - mouseY;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          const repelRadius = 100;
          if (distMouse < repelRadius) {
            const force = (1 - distMouse / repelRadius) * 6.5;
            const angle = Math.atan2(dyMouse, dxMouse);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }

          p.vx *= 0.83;
          p.vy *= 0.83;
          p.x += p.vx;
          p.y += p.vy;

          ctx.fillStyle = p.color;
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

    img.onload = () => {
      build();
      animationId = requestAnimationFrame(step);
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  if (reduced) {
    return (
      <div className="relative mx-auto aspect-square w-full max-w-2xl overflow-hidden rounded-sm md:max-w-3xl">
        <Image
          src={IMAGE_SRC}
          alt="Structure interne de la Pitiusa Art Station"
          fill
          sizes="(min-width: 768px) 60vw, 90vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative mx-auto aspect-square w-full max-w-2xl md:max-w-3xl">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
