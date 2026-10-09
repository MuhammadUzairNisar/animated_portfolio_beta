"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight, Download, MapPin } from "lucide-react";

import { EventHorizon } from "@/components/ui/event-horizon";
import { Button } from "@/components/ui/button";
import { useNarrow } from "@/hooks/use-narrow";
import { profile } from "@/lib/resume";

/**
 * The opening frame. The hole sits off to the right and the copy reads on the
 * scrim to the left; on a phone the whole arrangement turns through 90°, hole
 * low and copy high, as in the component's own demo.
 *
 * The section is taller than the screen and the frame inside it is pinned, so
 * the first stretch of scrolling does not move the page — it falls toward the
 * hole. The camera pushes in, the copy tips back into the distance, and the
 * next section rises over it.
 */
export function Hero() {
  const narrow = useNarrow();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Read straight off the scroll. Lenis already eases the scroll itself; a
  // spring on top of that makes the frame trail behind the wheel.
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The hole: pushed in on, and dimmed as the next section arrives over it.
  const holeScale = useTransform(p, [0, 1], [1, 1.55]);
  const holeOpacity = useTransform(p, [0.45, 1], [1, 0.25]);

  // The copy: tipped back and away into the frame.
  const copyRotateX = useTransform(p, [0, 0.7], [0, 38]);
  const copyY = useTransform(p, [0, 0.7], [0, -140]);
  const copyZ = useTransform(p, [0, 0.7], [0, -260]);
  const copyOpacity = useTransform(p, [0, 0.55], [1, 0]);
  const cueOpacity = useTransform(p, [0, 0.12], [1, 0]);

  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Introduction"
      className="relative h-svh w-full motion-safe:h-[175svh]"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={reduce ? undefined : { scale: holeScale, opacity: holeOpacity }}
        >
          {/* A single-pass black hole, cheap enough to keep running while the
              page scrolls over it. */}
          <EventHorizon
            className="h-svh"
            focus={narrow ? [0.5, 0.78] : [0.72, 0.46]}
            scrim={narrow ? "top" : "left"}
            scrimStrength={0.9}
            size={narrow ? 0.1 : 0.14}
            tilt={narrow ? 7 : 6}
            glow={narrow ? 0.85 : 1}
            resolution={narrow ? 0.6 : 0.75}
            starBrightness={0.6}
            starParallax={0.06}
          />
        </motion.div>

        <div className="relative z-10 flex h-svh items-start px-6 pt-28 perspective-distant sm:px-10 md:items-center md:pt-0 lg:px-20">
          <motion.div
            className="max-w-xl will-change-transform"
            style={
              reduce
                ? undefined
                : {
                    rotateX: copyRotateX,
                    y: copyY,
                    z: copyZ,
                    opacity: copyOpacity,
                    transformOrigin: "50% 100%",
                  }
            }
          >
            <motion.p
              {...item(0)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs text-white/70"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {profile.title} · Open to Principal / Lead roles
            </motion.p>

            <motion.h1
              {...item(1)}
              className="font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl lg:text-[4.5rem]"
            >
              Muhammad
              <br />
              Uzair Nisar
            </motion.h1>

            <motion.p
              {...item(2)}
              className="mt-6 max-w-md text-[0.98rem] leading-relaxed text-white/65 md:mt-7"
            >
              I architect and lead full-stack enterprise systems — ERP, LMS and
              SIMS platforms for institutions that can&apos;t afford downtime.
              Five years of turning complex requirements into software that
              holds up in production.
            </motion.p>

            <motion.p
              {...item(3)}
              className="mt-4 flex items-center gap-1.5 text-sm text-white/45"
            >
              <MapPin className="size-3.5" aria-hidden="true" />
              {profile.location}
            </motion.p>

            <motion.div {...item(4)} className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
              <Button asChild variant="light">
                <a href="#projects">
                  View my work
                  <ArrowDown />
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={profile.resume} download>
                  Download resume
                  <Download />
                </a>
              </Button>
              <Button asChild variant="ghost">
                <a href={`mailto:${profile.email}`}>
                  Get in touch
                  <ArrowUpRight />
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue: a dot sliding down a track, gone as soon as you move. */}
        {!reduce && (
          <motion.div
            aria-hidden="true"
            style={{ opacity: cueOpacity }}
            className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Scroll</span>
            <span className="relative h-10 w-px overflow-hidden bg-white/15">
              <motion.span
                className="absolute inset-x-0 top-0 h-3 bg-primary"
                animate={{ y: [-12, 40] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
