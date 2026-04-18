import { motion } from "framer-motion";
import { portfolioData as initialData } from "@/data/portfolioData";
import { useCMSData } from "@/context/CMSContext";
import { ArrowRight, ChevronDown } from "lucide-react";
import defaultProfileImg from "@/assets/profile-placeholder.jpg";

const Hero = () => {
  const hero = useCMSData(d => d.hero) || initialData.hero;
  const personal = useCMSData(d => d.personal) || initialData.personal;
  const stats = useCMSData(d => d.stats) || initialData.stats;

  return (
    <section id="home" className="relative min-h-screen flex items-center particle-bg overflow-hidden">
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid md:grid-cols-[1fr,auto] gap-12 items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium"
          >
            {personal?.title || initialData.personal.title}
          </motion.div>

          <div className="mb-6">
            {(hero?.headline || initialData.hero.headline).map((line, i) => (
              <motion.h1
                key={i}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.6 }}
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] ${
                  i === 1 ? "gradient-text" : ""
                }`}
              >
                {line}
              </motion.h1>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8 leading-relaxed"
          >
            {hero?.description || initialData.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-wrap gap-4 mb-12"
          >
            {(hero?.ctas || initialData.hero.ctas).map((cta, i) => (
              <a
                key={cta.label}
                href={cta.link}
                className={`group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                  i === 0
                    ? "bg-primary text-primary-foreground hover:shadow-[0_0_30px_-5px_hsl(var(--primary)/0.5)] hover:scale-105"
                    : "glass-card text-foreground hover:border-primary/40"
                }`}
              >
                {cta.label}
                {i === 0 && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex gap-8"
          >
            <div>
              <span className="text-3xl font-heading font-bold gradient-text">{(stats?.projectsCount || initialData.stats.projectsCount)}+</span>
              <p className="text-muted-foreground text-sm mt-1">Projects</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <span className="text-3xl font-heading font-bold gradient-text">{(stats?.experienceCount || initialData.stats.experienceCount)}+</span>
              <p className="text-muted-foreground text-sm mt-1">Years Learning</p>
            </div>
          </motion.div>
        </div>

        {/* Profile Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`hidden md:block ${(personal?.profileImage?.position || 'right') === 'left' ? 'order-first' : 'order-last'}`}
        >
          <div className="relative w-72 h-72 lg:w-80 lg:h-80">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl animate-glow-pulse" />
            <img
              src={
                !personal?.profileImage?.value || personal.profileImage.value.includes('profile-placeholder')
                  ? defaultProfileImg
                  : personal.profileImage.value
              }
              alt={personal?.name || initialData.personal.name}
              width={320}
              height={320}
              className="relative rounded-2xl object-cover w-full h-full glow-border shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            />
          </div>
        </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground z-20"
      >
        <ChevronDown size={24} />
      </motion.div>
    </section>
  );
};

export default Hero;
