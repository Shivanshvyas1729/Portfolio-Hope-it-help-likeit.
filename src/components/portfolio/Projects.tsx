import { getFeaturedProjects, portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import ProjectCard from "./ProjectCard";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Projects = () => {
  const currentData = useCMSData(d => d) || initialData;
  const featured = getFeaturedProjects(currentData);

  if (!featured || featured.length === 0) {
    return (
      <section id="projects" className="section-padding">
        <div className="container mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
            <h3 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Featured <span className="gradient-text">Work</span>
            </h3>
            <div className="glass-card p-12 rounded-2xl max-w-2xl mx-auto border border-border/50">
              <p className="text-lg text-foreground font-medium mb-2">No featured projects found.</p>
              <p className="text-muted-foreground mb-6">The portfolio configuration currently has no featured projects selected.</p>
              <Link 
                to="/projects" 
                className="inline-flex px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Projects
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Projects</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-12">
            Featured <span className="gradient-text">Work</span>
          </h3>
        </AnimatedSection>

        <div
          className="grid gap-6 mb-8"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${featured.length <= 3 ? "340px" : "300px"}), 1fr))`,
          }}
        >
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>

        <AnimatedSection className="text-center">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            View All Projects <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Projects;
