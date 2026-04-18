import { portfolioData as initialData, hasContent } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import AnimatedSection from "./AnimatedSection";
import { Award } from "lucide-react";

const About = () => {
  const about = useCMSData(d => d.about) || initialData.about;
  
  const marqueeTexts = about?.marqueeTexts || initialData.about.marqueeTexts;
  const marquee = marqueeTexts.length < 3
    ? [...marqueeTexts, ...marqueeTexts, ...marqueeTexts]
    : [...marqueeTexts, ...marqueeTexts];

  return (
    <section id="about" className="section-padding overflow-hidden">
      {/* Marquee */}
      <div className="mb-16 -mx-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee">
          {marquee.map((text, i) => (
            <span key={i} className="text-6xl md:text-8xl font-heading font-bold text-foreground/5 md:text-foreground/10 mx-8 select-none tracking-tight">
              {text}
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto">
        <AnimatedSection>
          <h2 className="text-sm font-medium text-primary tracking-widest uppercase mb-4">About Me</h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {about?.description || initialData.about.description}
              </p>
            </div>
            {hasContent(about?.certifications) && (
              <div className="space-y-4">
                <h3 className="text-foreground font-heading font-semibold text-lg mb-4">Certifications</h3>
                {(about?.certifications || initialData.about.certifications).map((cert) => (
                  <div key={cert} className="glass-card-hover p-4 flex items-start gap-3">
                    <Award size={20} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default About;
