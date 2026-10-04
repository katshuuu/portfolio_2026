import dynamic from "next/dynamic";
import { Hero } from "@/components/sections/Hero";
import { LazySection } from "@/components/layout/LazySection";

const About = dynamic(() =>
  import("@/components/sections/About").then((m) => m.About),
);
const MarqueeTapes = dynamic(() =>
  import("@/components/sections/MarqueeTapes").then((m) => m.MarqueeTapes),
);
const Projects = dynamic(() =>
  import("@/components/sections/Projects").then((m) => m.Projects),
);
const Skills = dynamic(() =>
  import("@/components/sections/Skills").then((m) => m.Skills),
);
const Contact = dynamic(() =>
  import("@/components/sections/Contact").then((m) => m.Contact),
);

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <LazySection minHeight="90vh">
        <About />
      </LazySection>
      <LazySection minHeight="360px" rootMargin="200px 0px">
        <MarqueeTapes />
      </LazySection>
      <LazySection minHeight="100vh">
        <Projects />
      </LazySection>
      <LazySection minHeight="100vh">
        <Skills />
      </LazySection>
      <LazySection minHeight="100vh" rootMargin="400px 0px">
        <Contact />
      </LazySection>
    </main>
  );
}
