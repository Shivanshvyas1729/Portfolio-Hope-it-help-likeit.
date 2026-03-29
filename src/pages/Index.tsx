import Navbar from "@/components/portfolio/Navbar";
import Hero from "@/components/portfolio/Hero";
import About from "@/components/portfolio/About";
import SEO from "@/components/portfolio/SEO";
import Education from "@/components/portfolio/Education";
import Experience from "@/components/portfolio/Experience";
import Skills from "@/components/portfolio/Skills";
import TechSphere from "@/components/portfolio/TechSphere";
import Services from "@/components/portfolio/Services";
import Projects from "@/components/portfolio/Projects";
import Contact from "@/components/portfolio/Contact";
import Footer from "@/components/portfolio/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <SEO />
    <Navbar />
    <Hero />
    <About />
    <Education />
    <Experience />
    <Skills />
    <TechSphere />
    <Services />
    <Projects />
    <Contact />
    <Footer />
  </div>
);

export default Index;
