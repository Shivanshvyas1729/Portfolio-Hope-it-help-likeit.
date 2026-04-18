import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { Brain, BarChart3, Sparkles, Zap, Cog } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, typeof Brain> = { Brain, BarChart3, Sparkles, Zap, Cog };

const Services = () => {
  const services = useCMSData(d => d.services) || initialData.services;

  if (!hasContent(services)) return null;

  return (
    <section id="services" className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-2">Services</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            What I <span className="gradient-text">Can Build</span>
          </h3>
          <p className="text-muted-foreground max-w-xl mb-12">
            Have an idea? I can build it — from concept to deployment.
          </p>
        </AnimatedSection>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 280px), 1fr))` }}
        >
          {(services || []).map((service, i) => {
            const Icon = iconMap[service.icon || "Cog"] || Cog;
            return (
              <AnimatedSection key={service.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="glass-card-hover p-6 h-full group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="text-primary" size={22} />
                  </div>
                  <h4 className="font-heading font-semibold text-foreground mb-2">{service.title}</h4>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </motion.div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
