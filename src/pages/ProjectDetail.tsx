import { useParams, Link } from "react-router-dom";
import { portfolioData as initialData } from "@/data/portfolioData";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { ArrowLeft, Github, ExternalLink, Play, Lock } from "lucide-react";
import { useState } from "react";
import { ResourcesModal } from "@/components/portfolio/ResourcesModal";
import { useCMSData } from "@/context/CMSContext";

const ProjectDetail = () => {
  const { id } = useParams();
  const cmsProjects = useCMSData(d => d.projects) || initialData.projects;
  const project = cmsProjects.find((p) => p.id === Number(id));
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
      <SEO 
        title={project.title} 
        description={project.description} 
        image={project.media?.[0]?.url} 
      />
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
              <div className="flex flex-wrap gap-2">
                {Array.isArray(project.category) && project.category.map((cat, i) => (
                  <span key={i} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium shadow-sm border border-primary/20">
                    {cat.trim()}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mt-3 mb-4">{project.title}</h1>
              <div className="mb-6">
                <h2 className="text-sm font-medium text-primary mb-1">Overview</h2>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{project.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-medium text-primary mb-1">Problem Statement</h2>
                {project.problem_statement ? (
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{project.problem_statement}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add your problem statement here]</p>
                )}
              </div>

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
                {(project.resources?.length ?? 0) > 0 && (
                  <ResourcesModal project={project}>
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-all border border-border">
                      <Lock size={16} className="text-primary" /> View Resources
                    </button>
                  </ResourcesModal>
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

          {/* What You Will Learn */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-3">What You Will Learn</h3>
            {project.learning_outcomes && project.learning_outcomes.length > 0 ? (
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {project.learning_outcomes.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            ) : (
              <ul className="list-disc pl-5 text-muted-foreground/50 italic space-y-1">
                <li>[Add learning outcomes here]</li>
              </ul>
            )}
          </div>

          {/* Impact */}
          {project.impact && (
            <div className="glass-card p-4 md:p-6 mb-6">
              <h3 className="text-lg font-medium text-primary mb-2">Impact</h3>
              <p className="text-foreground">⚡ {project.impact}</p>
            </div>
          )}

          {/* High-Level Architecture */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-3">High-Level Architecture</h3>
            {project.architecture ? (
              <p className="text-muted-foreground leading-relaxed mb-4">{project.architecture}</p>
            ) : (
              <p className="text-muted-foreground/50 italic mb-4">[Add architecture description here]</p>
            )}
            
            {project.architectureImage ? (
              <img 
                src={project.architectureImage} 
                alt="Architecture" 
                className="w-full max-h-[70vh] object-contain rounded-xl border border-border bg-muted/5 mx-auto" 
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground/50 italic">
                [Insert Architecture Diagram Here]
              </div>
            )}
          </div>

          {/* Technical Implementation */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-xl font-medium text-primary mb-6">Technical Implementation</h3>
            
            {/* Tech Stack */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-foreground mb-2">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">{t}</span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Objectives */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Objectives</h4>
                {project.objectives && project.objectives.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.objectives.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add objectives here]</p>
                )}
              </div>

              {/* Success Criteria */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Success Criteria</h4>
                {project.success_criteria && project.success_criteria.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.success_criteria.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add success criteria here]</p>
                )}
              </div>

              {/* Data Sources */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Data Sources</h4>
                {project.data_sources && project.data_sources.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.data_sources.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add data sources here]</p>
                )}
              </div>

              {/* Target Variable */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Target Variable</h4>
                {project.target_variable ? (
                  <p className="text-muted-foreground text-sm">{project.target_variable}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add target variable here]</p>
                )}
              </div>

              {/* Features */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Features</h4>
                {project.features && project.features.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.features.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add features here]</p>
                )}
              </div>

              {/* Preprocessing */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Preprocessing</h4>
                {project.preprocessing && project.preprocessing.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.preprocessing.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add preprocessing steps here]</p>
                )}
              </div>

              {/* Modeling */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Modeling</h4>
                {project.modeling && project.modeling.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.modeling.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add modeling steps here]</p>
                )}
              </div>

              {/* Evaluation Metrics */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Evaluation Metrics</h4>
                {project.evaluation_metrics && project.evaluation_metrics.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.evaluation_metrics.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add evaluation metrics here]</p>
                )}
              </div>

              {/* Validation Strategy */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Validation Strategy</h4>
                {project.validation_strategy ? (
                  <p className="text-muted-foreground text-sm">{project.validation_strategy}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add validation strategy here]</p>
                )}
              </div>

              {/* Explainability */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Explainability</h4>
                {project.explainability ? (
                  <p className="text-muted-foreground text-sm">{project.explainability}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add explainability here]</p>
                )}
              </div>

              {/* Deployment */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Deployment</h4>
                {project.deployment ? (
                  <p className="text-muted-foreground text-sm">{project.deployment}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add deployment details here]</p>
                )}
              </div>
            </div>
            
            <hr className="my-6 border-border" />
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Risks */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Risks & Mitigation</h4>
                {project.risks && project.risks.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.risks.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add risks and mitigations here]</p>
                )}
              </div>

              {/* Ethics */}
              <div>
                <h4 className="text-sm font-bold text-foreground mb-1">Ethics & Privacy</h4>
                {project.ethics && project.ethics.length > 0 ? (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-1">
                    {project.ethics.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">[Add ethics and privacy considerations here]</p>
                )}
              </div>
            </div>
          </div>

          {/* Open Resources */}
          <div className="glass-card p-4 md:p-6 mb-6">
            <h3 className="text-lg font-medium text-primary mb-4">Open Resources</h3>
            {project.open_resources && project.open_resources.length > 0 ? (
              <div className="flex flex-col gap-2">
                {project.open_resources.map((res, i) => (
                  <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
                    <ExternalLink size={14} /> {res.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground/50 italic text-sm">[No open resources available]</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetail;
