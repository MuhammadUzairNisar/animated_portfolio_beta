import { Hero } from "@/components/portfolio/hero";
import { Nav } from "@/components/portfolio/nav";
import { ScrollProgress } from "@/components/portfolio/reveal";
import {
  About,
  Contact,
  Experience,
  Footer,
  Projects,
  Skills,
  StackMarquee,
} from "@/components/portfolio/sections";
import { SmoothScroll } from "@/components/portfolio/smooth-scroll";

export default function Home() {
  return (
    <>
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-80 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <ScrollProgress />
      <Nav />
      <main className="overflow-x-clip">
        <Hero />
        {/* The rest of the page is one panel that rises over the pinned hero. */}
        <div className="relative z-10 rounded-t-4xl border-t border-white/10 bg-background shadow-[0_-40px_80px_-20px_rgba(255,152,56,0.18)] motion-safe:mt-[-45svh]">
          <About />
          <Experience />
          <StackMarquee />
          <Projects />
          <Skills />
          <Contact />
        </div>
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </>
  );
}
