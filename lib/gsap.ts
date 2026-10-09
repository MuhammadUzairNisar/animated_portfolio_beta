"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  // Phones resize the viewport as the URL bar slides away; re-measuring every
  // pin on that would make the page jump mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** Animations run only for readers who have not asked for less motion. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
/** The pinned 3D sequences need room; below this they fall back to a stack. */
export const WIDE = "(min-width: 1024px)";

export { gsap, ScrollTrigger, useGSAP };
