"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowUpRight, Download, GraduationCap, Mail, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GithubIcon, LinkedinIcon } from "@/components/portfolio/icons";
import {
  Reveal,
  ScrollTilt,
  SectionHeading,
  TiltCard,
} from "@/components/portfolio/reveal";
import { gsap, MOTION_OK, useGSAP, WIDE } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import portrait from "@/public/muhammad-uzair-nisar.png";
import {
  competencies,
  education,
  experience,
  profile,
  projects,
  skills,
  stats,
} from "@/lib/resume";

const shell = "mx-auto w-full max-w-6xl px-6 sm:px-10";

/* --- about ---------------------------------------------------------------- */

/**
 * A paragraph that is read into existence: every word starts dim and lights
 * up as the scroll passes over it, so the eye is led through the text.
 */
function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".w",
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.08,
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              end: "bottom 55%",
              scrub: true,
            },
          }
        );
      });
    },
    { scope: ref }
  );

  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="w">{w}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

/**
 * The portrait, as a card that rises out of the floor and leans toward the
 * pointer, with the disc's orange glowing behind it. Name and role sit on a
 * gradient over the bottom of the photo.
 */
function Portrait() {
  return (
    <Reveal tilt={30} y={60} className="mx-auto w-full max-w-[20rem] md:sticky md:top-28">
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-primary/25 opacity-70 blur-3xl"
        />
        <TiltCard max={10}>
          <figure className="relative overflow-hidden rounded-3xl border border-white/15 bg-card shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
            <Image
              src={portrait}
              alt={`Portrait of ${profile.name}`}
              placeholder="blur"
              sizes="(min-width: 1024px) 20rem, (min-width: 768px) 17rem, 20rem"
              className="aspect-square h-auto w-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent px-5 pt-16 pb-5">
              <p className="font-display text-lg font-medium text-white">{profile.name}</p>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-white/65">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
                {profile.title}
              </p>
            </figcaption>
          </figure>
        </TiltCard>
      </div>
    </Reveal>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-24 md:py-32">
      <div className={shell}>
        <SectionHeading id="about-title" eyebrow="About" title="Architecture first. Delivery always." />

        <div className="grid items-start gap-12 md:grid-cols-[17rem_1fr] md:gap-14 lg:grid-cols-[20rem_1fr] lg:gap-20">
          <Portrait />

          <div className="space-y-12">
            <div className="space-y-6">
              <ScrubText
                text={profile.summary}
                className="font-display text-xl leading-snug font-light text-white md:text-2xl"
              />
              <ScrubText text={profile.summaryMore} className="text-lg leading-relaxed text-white/75" />
            </div>

            <Reveal delay={0.1}>
              <h3 className="mb-4 font-display text-sm font-medium uppercase tracking-[0.2em] text-white/45">
                Core competencies
              </h3>
              <ul className="flex flex-wrap gap-2">
                {competencies.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/75"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <ScrollTilt className="mt-20" tilt={35} depth={140}>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-background p-6 md:p-8">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-4xl font-light tracking-tight text-white md:text-5xl">
                    {s.value}
                  </span>
                  <span className="mt-2 block text-sm leading-snug text-white/55">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </ScrollTilt>
      </div>
    </section>
  );
}

/* --- experience ----------------------------------------------------------- */

/**
 * The roles are a deck of cards. Each one sticks a little lower than the last,
 * and as the next card slides up over it, it is pushed back into the screen —
 * shrinking, tipping away and going dark — so the newest role sits on top of
 * the history beneath it.
 */
export function Experience() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const cards = gsap.utils.toArray<HTMLElement>(".exp-card", ref.current);

        cards.forEach((card, i) => {
          // Rises out of the floor on the way in.
          gsap.fromTo(
            card,
            { rotateX: 32, y: 140, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 100%" },
            {
              rotateX: 0,
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "top 65%", scrub: true },
            }
          );

          const next = cards[i + 1];
          if (!next) return;
          const inner = card.querySelector(".exp-inner");
          const shade = card.querySelector(".exp-shade");
          const stickAt = () => parseFloat(getComputedStyle(next).top) || 0;

          // Then pushed back as the next one lands on it.
          const push = {
            trigger: next,
            start: "top bottom",
            end: () => `top ${stickAt()}px`,
            scrub: true,
            invalidateOnRefresh: true,
          };
          gsap.to(inner, {
            scale: 0.9,
            rotateX: -14,
            transformPerspective: 1200,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: push,
          });
          gsap.to(shade, { opacity: 0.65, ease: "none", scrollTrigger: push });
        });
      });
    },
    { scope: ref }
  );

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="scroll-mt-20 border-t border-white/5 py-24 md:py-32"
    >
      <div className={shell}>
        <SectionHeading
          id="experience-title"
          eyebrow="Experience"
          title="From junior engineer to team lead, at one company."
        />

        <div ref={ref} className="space-y-[12vh] pb-[8vh]">
          {experience.map((role, i) => (
            <div
              key={role.title}
              className="exp-card sticky"
              style={{ top: `calc(6rem + ${i * 1.75}rem)` }}
            >
              <article className="exp-inner relative overflow-hidden rounded-3xl border border-white/10 bg-card p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:p-10">
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -top-32 -right-32 size-72 rounded-full blur-3xl",
                    i === 0 ? "bg-primary/20" : "bg-primary/[0.07]"
                  )}
                />
                <div className="relative flex flex-col gap-6 md:flex-row md:gap-12">
                  <div className="md:w-64 md:shrink-0">
                    <span className="font-display text-sm tabular-nums text-primary">
                      0{experience.length - i}
                    </span>
                    <h3 className="mt-2 font-display text-2xl font-medium text-white md:text-3xl">
                      {role.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/60">{role.company}</p>
                    <p className="mt-1 font-display text-sm tabular-nums text-white/40">{role.period}</p>
                  </div>
                  <ul className="space-y-3">
                    {role.points.map((p) => (
                      <li key={p} className="flex gap-3 leading-relaxed text-white/70">
                        <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-primary/60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div aria-hidden="true" className="exp-shade pointer-events-none absolute inset-0 bg-black opacity-0" />
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- marquee -------------------------------------------------------------- */

/**
 * Two bands of the stack, laid on a tilted plane and slid against each other
 * by the scroll. A breather between the dense sections, and a reminder of the
 * range in one glance.
 */
export function StackMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const all = skills.flatMap((s) => s.items);
  const rowA = all.slice(0, Math.ceil(all.length / 2));
  const rowB = all.slice(Math.ceil(all.length / 2));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scroll = { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(".row-a", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: scroll });
        gsap.fromTo(".row-b", { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: scroll });
        gsap.fromTo(
          ".marquee-plane",
          { rotateX: 35, rotateZ: -6 },
          { rotateX: -10, rotateZ: -2, ease: "none", scrollTrigger: scroll }
        );
      });
    },
    { scope: ref }
  );

  const Row = ({ items, outline, className }: { items: string[]; outline?: boolean; className: string }) => (
    <div className={cn("flex w-max gap-10 whitespace-nowrap", className)}>
      {[...items, ...items].map((item, i) => (
        <span key={i} className="flex items-center gap-10">
          <span
            className={cn(
              "font-display text-5xl font-medium tracking-tight md:text-7xl",
              outline
                ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]"
                : "text-white/90"
            )}
          >
            {item}
          </span>
          <span className="size-2.5 rounded-full bg-primary" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative overflow-hidden border-y border-white/5 py-20 [perspective:900px] md:py-28"
    >
      <div className="marquee-plane space-y-6 [transform:rotateX(12deg)_rotateZ(-3deg)]">
        <Row items={rowA} className="row-a" />
        <Row items={rowB} outline className="row-b" />
      </div>
    </div>
  );
}

/* --- projects ------------------------------------------------------------- */

/**
 * On a wide screen the section pins and the projects pass through it
 * sideways, like a coverflow: each card swings in from the right edge turned
 * away, faces you square at the centre, and turns away again as it leaves.
 * On a phone they stack and rise into place instead.
 */
export function Projects() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ wide: WIDE, ok: MOTION_OK }, (ctx) => {
        const { wide, ok } = ctx.conditions as { wide: boolean; ok: boolean };
        if (!ok) return;

        const track = ref.current!.querySelector<HTMLElement>(".proj-track")!;
        const cards = gsap.utils.toArray<HTMLElement>(".proj-card", ref.current);

        if (!wide) {
          cards.forEach((card) =>
            gsap.fromTo(
              card,
              { rotateX: 30, y: 110, opacity: 0, transformPerspective: 1000, transformOrigin: "50% 100%" },
              {
                rotateX: 0,
                y: 0,
                opacity: 1,
                ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "top 65%", scrub: true },
              }
            )
          );
          return;
        }

        const distance = () => track.scrollWidth - window.innerWidth;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".proj-pin",
            pin: true,
            scrub: true,
            start: "top top",
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: () => -distance(), ease: "none" }, 0)
          .to(".proj-word", { xPercent: -30, ease: "none" }, 0)
          .fromTo(".proj-bar", { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);

        cards.forEach((card) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: card,
                containerAnimation: tl,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            })
            .fromTo(
              card,
              { rotateY: -42, z: -260, opacity: 0.3, transformPerspective: 1400 },
              { rotateY: 0, z: 0, opacity: 1, ease: "none" }
            )
            .to(card, { rotateY: 42, z: -260, opacity: 0.3, ease: "none" });
        });
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="projects"
      aria-labelledby="projects-title"
      className="relative scroll-mt-20 border-t border-white/5 pt-24 md:pt-32"
    >
      <div className={shell}>
        <SectionHeading
          id="projects-title"
          eyebrow="Key projects"
          title="Systems that institutions run on."
        />
      </div>

      <div className="proj-pin relative overflow-hidden pb-24 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:pb-0">
        {/* A giant word drifting behind the cards, slower than they move. */}
        <div
          aria-hidden="true"
          className="proj-word pointer-events-none absolute top-1/2 left-0 hidden -translate-y-1/2 font-display text-[24vw] leading-none font-bold tracking-tighter whitespace-nowrap text-transparent select-none [-webkit-text-stroke:1px_rgba(255,255,255,0.05)] lg:block"
        >
          BUILT TO SCALE
        </div>

        <div className="proj-track relative flex flex-col gap-5 px-6 sm:px-10 lg:w-max lg:flex-row lg:items-stretch lg:gap-10 lg:px-[calc(50vw-17rem)]">
          {projects.map((p, i) => (
            <div key={p.name} className="proj-card lg:w-[34rem] lg:shrink-0">
              <TiltCard>
                <article
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-card p-6 transition-colors duration-300 hover:border-primary/40 md:p-8 lg:min-h-[27rem]",
                    p.featured && "bg-linear-to-br from-[#1a120a] via-card to-card"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                      {p.client}
                    </p>
                    <span className="font-display text-sm tabular-nums text-white/30">
                      {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-white md:text-3xl">
                    {p.name}
                  </h3>
                  <p className="mt-3 leading-relaxed text-white/65">{p.summary}</p>
                  <ul className="mt-5 space-y-2 text-sm text-white/60">
                    {p.highlights.map((h) => (
                      <li key={h} className="flex gap-2.5">
                        <span aria-hidden="true" className="mt-[0.55em] size-1 shrink-0 rounded-full bg-primary" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                    {p.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-md bg-white/[0.05] px-2 py-1 text-xs whitespace-nowrap text-white/60"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </TiltCard>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 hidden h-px w-48 bg-white/10 lg:block">
          <div className="proj-bar h-full origin-left scale-x-0 bg-primary" />
        </div>
      </div>
    </section>
  );
}

/* --- skills & education --------------------------------------------------- */

/**
 * On a wide screen the skill groups stand on the faces of a slowly tilted
 * cylinder; the section pins and the scroll turns it, one face at a time.
 * The layout classes for that live in globals.css under `.ring-stage`, and are
 * only switched on while the sequence runs, so a phone, or a reader who wants
 * less motion, gets a plain grid.
 */
export function Skills() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${WIDE} and ${MOTION_OK}`, () => {
        const stage = ref.current!.querySelector<HTMLElement>(".ring-stage")!;
        const ring = stage.querySelector<HTMLElement>(".ring")!;
        const panels = gsap.utils.toArray<HTMLElement>(".ring-panel", ref.current);
        const n = panels.length;
        const step = 360 / n;
        const width = 300;
        const radius = Math.round(width / (2 * Math.tan(Math.PI / n))) + 40;

        stage.classList.add("is-active");
        panels.forEach((p, i) => {
          p.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
        });

        gsap.to(ring, {
          rotateY: -step * (n - 1),
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            pin: true,
            scrub: true,
            start: "top top",
            end: () => `+=${n * 280}`,
            snap: { snapTo: 1 / (n - 1), duration: 0.4, ease: "power2.inOut" },
          },
        });

        return () => {
          stage.classList.remove("is-active");
          panels.forEach((p) => (p.style.transform = ""));
        };
      });

      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        gsap.utils.toArray<HTMLElement>(".ring-panel", ref.current).forEach((p, i) =>
          gsap.fromTo(
            p,
            { rotateY: i % 2 ? -35 : 35, x: i % 2 ? 60 : -60, opacity: 0, transformPerspective: 1000 },
            {
              rotateY: 0,
              x: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: p, start: "top bottom", end: "top 70%", scrub: true },
            }
          )
        );
      });
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="skills"
      aria-labelledby="skills-title"
      className="scroll-mt-20 border-t border-white/5 py-24 md:py-32"
    >
      <div className={shell}>
        <SectionHeading id="skills-title" eyebrow="Toolkit" title="Full stack, end to end." />
      </div>

      <div className="ring-stage">
        <div className="ring-tilt">
          <ul className="ring mx-auto grid max-w-6xl gap-5 px-6 sm:grid-cols-2 sm:px-10 lg:grid-cols-3">
            {skills.map((s, i) => (
              <li
                key={s.group}
                className="ring-panel rounded-3xl border border-white/10 bg-card/95 p-6"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-sm font-medium uppercase tracking-[0.18em] text-primary">
                    {s.group}
                  </h3>
                  <span className="font-display text-xs tabular-nums text-white/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/85"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(shell, "mt-20 grid gap-5 md:grid-cols-2")}>
        {education.map((e, i) => (
          <Reveal key={e.degree} delay={i * 0.08}>
            <TiltCard max={6}>
              <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-card p-6">
                <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h3 className="font-display text-lg font-medium text-white">{e.degree}</h3>
                  <p className="mt-1 text-sm text-white/60">{e.school}</p>
                  <p className="mt-1 font-display text-sm tabular-nums text-white/40">{e.period}</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --- contact & footer ------------------------------------------------------ */

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative scroll-mt-20 overflow-hidden border-t border-white/5 py-28 md:py-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-full left-1/2 size-[56rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-[120px]"
      />
      <div className={cn(shell, "relative text-center")}>
        <ScrollTilt tilt={45} depth={160} from={0.8}>
          <p className="mb-4 font-display text-xs font-medium uppercase tracking-[0.25em] text-primary">
            Contact
          </p>
          <h2
            id="contact-title"
            className="mx-auto max-w-3xl font-display text-4xl font-light tracking-[-0.03em] text-white sm:text-5xl md:text-6xl"
          >
            Building something that has to scale?
          </h2>
          <p className="mx-auto mt-6 max-w-lg leading-relaxed text-white/60">
            I&apos;m looking for Principal Engineer and Team Lead roles — and
            always happy to talk architecture, AI-assisted engineering, or a
            hard problem you&apos;re stuck on.
          </p>
        </ScrollTilt>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <a href={`mailto:${profile.email}`}>
              <Mail />
              Email me
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
              <Phone />
              {profile.phone}
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href={profile.resume} download>
              <Download />
              Download resume
            </a>
          </Button>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex items-center justify-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <LinkedinIcon className="size-5" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <GithubIcon className="size-5" />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className={cn(shell, "flex flex-col items-center justify-between gap-3 py-8 text-sm text-white/40 sm:flex-row")}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a
          href="#top"
          className="inline-flex items-center gap-1 transition-colors duration-200 hover:text-white"
        >
          Back to top
          <ArrowUpRight className="size-3.5 -rotate-45" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
