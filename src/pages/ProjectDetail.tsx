import { useParams, Link } from "react-router-dom";
import { portfolioData } from "@/data/portfolioData";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import { ArrowLeft, Github, ExternalLink, Play } from "lucide-react";
import { useState } from "react";

const ProjectDetail = () => {
  const { id } = useParams();
  const project = portfolioData.projects.find((p) => p.id === Number(id));
  const [activeMedia, setActiveMedia] = useState(0);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold mb-4">Project not found</h1>
          <Link to="/" className="text-primary hover:underline">Go back home</Link>
        </div>
      </div>
    );
  }

  const hasMedia = project.media && project.media.length > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="section-padding pt-28">
        <div className="container mx-auto max-w-5xl">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to Projects
          </Link>

          {/* Top: Title + Media side by side */}
          <div className={`grid gap-8 mb-8 ${hasMedia ? "md:grid-cols-[1fr,1fr]" : ""}`}>
            {/* Left: Project Info */}
            <div>
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">{project.title}</h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-3">
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card-hover text-sm font-medium">
                    <Github size={16} /> GitHub
                  </a>
                )}
                {project.live && (
                  <a href={project.live} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] transition-all">
                    <ExternalLink size={16} /> Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Right: Media Gallery */}
            {hasMedia && (
              <div className="space-y-3">
                {/* Active media display */}
                <div className="glass-card rounded-xl overflow-hidden aspect-video">
                  {project.media![activeMedia].type === "image" ? (
                    <img
                      src={project.media![activeMedia].url}
                      alt={project.media![activeMedia].caption || project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={project.media![activeMedia].url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {project.media![activeMedia].caption && (
                  <p className="text-xs text-muted-foreground text-center">{project.media![activeMedia].caption}</p>
                )}
                {/* Thumbnails */}
                {project.media!.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {project.media!.map((m, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveMedia(i)}
                        className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          i === activeMedia ? "border-primary" : "border-border/30 opacity-60 hover:opacity-100"
                        }`}
                      >
                        {m.type === "image" ? (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <Play size={14} className="text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Impact */}
          {project.impact && (
            <div className="glass-card p-4 mb-6">
              <h3 className="text-sm font-medium text-primary mb-1">Impact</h3>
              <p className="text-foreground">⚡ {project.impact}</p>
            </div>
          )}

          {/* How it Works */}
          {project.howItWorks && (
            <div className="glass-card p-4 mb-6">
              <h3 className="text-sm font-medium text-primary mb-1">How It's Built</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{project.howItWorks}</p>
            </div>
          )}

          {/* Tech Stack */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-primary mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">{t}</span>
              ))}
            </div>
          </div>

          {/* Architecture Image */}
          {project.architectureImage && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-primary mb-3">Architecture</h3>
              <img src={project.architectureImage} alt="Architecture" className="rounded-xl border border-border w-full" />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
