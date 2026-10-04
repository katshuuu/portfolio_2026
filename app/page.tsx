import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";

const MarqueeTapes = dynamic(() =>
  import("@/components/sections/MarqueeTapes").then((m) => m.MarqueeTapes),
);
const Projects = dynamic(
  () => import("@/components/sections/Projects").then((m) => m.Projects),
  {
    loading: () => (
      <div className="min-h-[80vh]" aria-hidden />
    ),
  },
);
const Skills = dynamic(
  () => import("@/components/sections/Skills").then((m) => m.Skills),
  {
    loading: () => (
      <div className="min-h-[80vh]" aria-hidden />
    ),
  },
);
const Contact = dynamic(
  () => import("@/components/sections/Contact").then((m) => m.Contact),
  {
    loading: () => (
      <div className="min-h-[80vh] bg-black" aria-hidden />
    ),
  },
);

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
