import { portfolioData } from "@/data/portfolioData";
import { useProjectFilter } from "@/hooks/useProjectFilter";
import ProjectCard from "@/components/portfolio/ProjectCard";
import Navbar from "@/components/portfolio/Navbar";
import Footer from "@/components/portfolio/Footer";
import SEO from "@/components/portfolio/SEO";
import { motion, AnimatePresence } from "framer-motion";

const AllProjects = () => {
  const { categories, selectedCategory, setSelectedCategory, filteredProjects, counts } = useProjectFilter(portfolioData.projects);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title="All Projects" />
      <Navbar />
      <div className="flex-1 section-padding pt-28">
        <div className="container mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              All <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground">Browse all my work by category.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            {/* Sidebar Filter */}
            <aside className="w-full md:w-64 lg:w-72 shrink-0">
              <div className="sticky top-28 glass-card p-5 rounded-xl border border-border/50">
                <h3 className="text-lg font-heading font-semibold mb-4 text-foreground">Filter by Category</h3>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                        selectedCategory === cat
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="font-medium">{cat}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedCategory === cat 
                          ? "bg-primary-foreground/20 text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {counts[cat] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Project Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold text-foreground">
                  {selectedCategory === "All" ? "All Projects" : `${selectedCategory} Projects`}
                </h2>
                <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border/50">
                  Showing {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <motion.div 
                layout
                className="grid gap-6 md:gap-8"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))" }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProjectCard project={p} index={i} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredProjects.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center rounded-xl border border-border/50 mt-4"
                >
                  <p className="text-lg font-medium text-foreground mb-2">No projects found</p>
                  <p className="text-muted-foreground mb-6">Try selecting a different category from the sidebar.</p>
                  <button 
                    onClick={() => setSelectedCategory("All")}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Clear Filters
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AllProjects;
