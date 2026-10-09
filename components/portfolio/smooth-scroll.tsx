"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Inertial scrolling, driven from GSAP's ticker so the pinned sequences and
 * the scroll position never disagree by a frame. Skipped entirely for readers
 * who prefer reduced motion — they keep the browser's own scrolling.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Web fonts change line heights, which moves every trigger; measure again.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
