import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const Skills = () => {
  const skills = useCMSData(d => d.skills) || initialData.skills;
  const categories = skills?.categories || initialData.skills.categories;

  if (!hasContent(categories)) return null;

  const isCompact = categories.length > 4;

  return (
    <section id="skills" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Skills</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-12">
            My <span className="gradient-text">Core Stack</span>
          </h3>
        </AnimatedSection>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${isCompact ? "260px" : "300px"}), 1fr))` }}
        >
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.title} delay={i * 0.1}>
              <div className="glass-card-hover p-6 h-full">
                <h4 className="font-heading font-semibold text-foreground mb-4">{cat.title}</h4>
                <div className="flex flex-wrap gap-2">
                  {(cat.items || []).map((item) => (
                    <motion.span
                      key={item}
                      whileHover={{ scale: 1.08 }}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20 cursor-default transition-colors hover:bg-primary/20"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
