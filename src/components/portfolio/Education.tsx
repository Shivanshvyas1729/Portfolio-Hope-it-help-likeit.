import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { GraduationCap } from "lucide-react";

const Education = () => {
  const education = useCMSData(d => d.education) || initialData.education;

  if (!hasContent(education)) return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-8">Education</h2>
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 360px), 1fr))` }}>
            {(education || []).map((edu, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="glass-card-hover p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="text-primary" size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{edu.degree}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{edu.institution}</p>
                      <span className="inline-block mt-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{edu.year}</span>
                      {edu.description && <p className="text-muted-foreground text-sm mt-3">{edu.description}</p>}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Education;
