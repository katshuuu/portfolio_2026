import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { MarqueeTapes } from "@/components/sections/MarqueeTapes";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";

/**
 * Eager sections = full page in first HTML payload.
 * Heavy WebGL / Matter.js stay dynamically imported inside Hero / Contact.
 */
export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <About />
      <MarqueeTapes />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
