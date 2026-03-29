import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork, Image as ImageIcon } from "lucide-react";
import type { Project } from "@/data/portfolioData";
import { Link } from "react-router-dom";
import { useGithubStats } from "@/hooks/useGithubStats";

interface Props {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: Props) => {
  const { stats, loading } = useGithubStats(project.github);
  const [imageLoaded, setImageLoaded] = useState(false);
  const mediaUrl = project.media?.[0]?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -6 }}
      className="glass-card-hover flex flex-col h-full group overflow-hidden"
    >
      {/* Media Thumbnail Block */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {mediaUrl ? (
          <>
            {/* Image Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <img 
              src={mediaUrl} 
              alt={project.title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Subtle Gradient Overlay for visual weight */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5">
            <ImageIcon className="text-muted-foreground/40 w-12 h-12" />
          </div>
        )}

        {/* Categories floating inside Image (Top Left) */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {Array.isArray(project.category) && project.category.slice(0, 2).map((cat, i) => (
            <span key={i} className="text-[10px] text-primary bg-background/80 backdrop-blur-md px-2 py-0.5 rounded-full font-medium shadow-sm border border-primary/20">
              {cat.trim()}
            </span>
          ))}
          {Array.isArray(project.category) && project.category.length > 2 && (
            <span className="text-[10px] text-muted-foreground bg-background/80 backdrop-blur-md px-1.5 py-0.5 rounded-full shadow-sm">
              +{project.category.length - 2}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <Link to={`/project/${project.id}`} className="block mb-2 mt-2">
          <h3 className="font-heading font-semibold text-foreground text-lg group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3 min-h-[60px] flex-1">{project.description}</p>

        {project.impact && (
          <p className="text-xs text-accent mb-4 italic line-clamp-1">⚡ {project.impact}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-5 items-center">
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>
          ))}
          {project.tech.length > 4 && (
            <span className="text-[10px] text-muted-foreground">+{project.tech.length - 4} more</span>
          )}
        </div>

        {/* Footer (Stats & Links) */}
        <div className="flex gap-4 mt-auto items-center justify-between pt-4 border-t border-border/40">
          <div className="flex gap-3">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/link mb-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={14} className="group-hover/link:text-primary transition-colors" /> GitHub
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group/link"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} className="group-hover/link:text-primary transition-colors" /> Live
              </a>
            )}
          </div>

          {/* GitHub Live Stats */}
          {project.github && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {loading ? (
                <>
                  <div className="w-8 h-3 bg-muted animate-pulse rounded" />
                  <div className="w-8 h-3 bg-muted animate-pulse rounded" />
                </>
              ) : stats ? (
                <>
                  <div className="flex items-center gap-1" title="Stars">
                    <Star size={12} className="text-yellow-500/80" /> {stats.stars}
                  </div>
                  <div className="flex items-center gap-1" title="Forks">
                    <GitFork size={12} className="text-accent/80" /> {stats.forks}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
