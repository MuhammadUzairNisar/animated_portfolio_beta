"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Lifts its content up out of the floor the first time it scrolls into view:
 * it starts tipped back in perspective and swings upright as it rises.
 * Readers who ask for reduced motion get the content in place, no movement.
 */
export function Reveal({
  delay = 0,
  y = 40,
  tilt = 22,
  children,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number; y?: number; tilt?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={
        reduce
          ? false
          : { opacity: 0, y, rotateX: tilt, scale: 0.96, transformPerspective: 1100 }
      }
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
      style={{ transformOrigin: "50% 100%" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Tied to the scrollbar rather than fired once: as the element travels up
 * through the bottom of the viewport it swings from tipped-back to upright,
 * and scrolling back up tips it away again. This is what makes the page feel
 * like a space you move through instead of a document you read.
 */
export function ScrollTilt({
  children,
  className,
  tilt = 28,
  depth = 120,
  from = 0.88,
}: {
  children: ReactNode;
  className?: string;
  /** Degrees it is tipped back before it arrives. */
  tilt?: number;
  /** How far below its resting place it starts, in px. */
  depth?: number;
  /** Starting scale. */
  from?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 55%"],
  });
  const p = scrollYProgress;
  const rotateX = useTransform(p, [0, 1], [tilt, 0]);
  const y = useTransform(p, [0, 1], [depth, 0]);
  const scale = useTransform(p, [0, 1], [from, 1]);
  const opacity = useTransform(p, [0, 0.6], [0, 1]);

  return (
    <div ref={ref} className={cn("[perspective:1200px]", className)}>
      <motion.div
        style={
          reduce
            ? undefined
            : { rotateX, y, scale, opacity, transformOrigin: "50% 100%" }
        }
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** Moves at its own speed against the scroll, for depth between layers. */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: ReactNode;
  className?: string;
  /** Fraction of the scroll it lags (positive) or leads (negative) by. */
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { y }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * A card that leans toward the pointer, with a soft light following it across
 * the surface. Touch screens never hover, so on a phone it simply sits flat.
 */
export function TiltCard({
  children,
  className,
  max = 9,
}: {
  children: ReactNode;
  className?: string;
  /** Furthest lean, in degrees. */
  max?: number;
}) {
  const reduce = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 20, mass: 0.5 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,152,56,0.14), transparent 60%)`;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div className={cn("h-full [perspective:1000px]", className)}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={reduce ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="group relative h-full"
      >
        {children}
        <motion.div
          aria-hidden="true"
          style={{ background: glare }}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </motion.div>
    </div>
  );
}

/** A thin bar along the top edge that fills as the page is read. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = scrollYProgress;
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-linear-to-r from-[#8e3a0b] via-primary to-[#fff3de]"
    />
  );
}

/**
 * Section titles swing up into place on the scroll, word by word, each one a
 * little behind the last.
 */
export function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 50%"],
  });
  const p = scrollYProgress;
  const words = title.split(" ");

  return (
    <div ref={ref} className="mb-12 [perspective:900px] md:mb-16">
      <Reveal y={16} tilt={0}>
        <p className="mb-3 font-display text-xs font-medium uppercase tracking-[0.25em] text-primary">
          {eyebrow}
        </p>
      </Reveal>
      <h2
        id={id}
        aria-label={title}
        className="max-w-2xl font-display text-3xl font-light tracking-[-0.02em] text-white sm:text-4xl md:text-5xl"
      >
        {words.map((w, i) => (
          <span key={i}>
            <Word progress={p} index={i} count={words.length} reduce={!!reduce}>
              {w}
            </Word>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </h2>
    </div>
  );
}

function Word({
  children,
  progress,
  index,
  count,
  reduce,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reduce: boolean;
}) {
  // Each word gets its own slice of the scroll, overlapping its neighbours.
  const start = (index / count) * 0.55;
  const end = start + 0.45;
  const rotateX = useTransform(progress, [start, end], [-90, 0]);
  const y = useTransform(progress, [start, end], ["0.6em", "0em"]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  return (
    <motion.span
      aria-hidden="true"
      className="inline-block"
      style={
        reduce
          ? undefined
          : { rotateX, y, opacity, transformOrigin: "50% 100%", transformPerspective: 600 }
      }
    >
      {children}
    </motion.span>
  );
}
