import { useState } from "react";
import { portfolioData, getCategories } from "@/data/portfolioData";
import ProjectCard from "@/components/portfolio/ProjectCard";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import { motion } from "framer-motion";

const AllProjects = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = getCategories();

  const filtered =
    activeCategory === "All"
      ? portfolioData.projects
      : portfolioData.projects.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="section-padding pt-28">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            All <span className="gradient-text">Projects</span>
          </h1>
          <p className="text-muted-foreground mb-8">Browse all my work by category.</p>

          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div
            layout
            className="grid gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
          >
            {filtered.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No projects in this category yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProjects;
