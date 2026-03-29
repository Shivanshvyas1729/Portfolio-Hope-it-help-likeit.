import rawData from "./portfolio.yaml?raw";
import YAML from "yaml";

export interface ProfileImage {
  type: "local" | "url";
  value: string;
  position: "left" | "right" | "center";
}

export interface CTA {
  label: string;
  link: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  items: string[];
}

export interface Service {
  title: string;
  description: string;
  icon?: string;
}

export interface ProjectMedia {
  type: "image" | "video";
  url: string;
  caption?: string;
}

export interface Project {
  id: number;
  title: string;
  category: string[];
  description: string;
  tech: string[];
  github: string;
  live: string;
  featured: boolean;
  impact: string;
  architectureImage?: string;
  media?: ProjectMedia[];
  howItWorks?: string;
}

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export interface PortfolioData {
  home?: {
    featuredProjectsCount?: number;
    featuredProjectIds?: number[];
  };
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    location: string;
    profileImage: ProfileImage;
  };
  hero: {
    headline: string[];
    description: string;
    ctas: CTA[];
  };
  stats: {
    projectsCount: number;
    experienceCount: number;
  };
  about: {
    description: string;
    marqueeTexts: string[];
    certifications: string[];
  };
  education: Education[];
  experience: Experience[];
  skills: {
    categories: SkillCategory[];
  };
  techStack: {
    featured: string[];
    all: string[];
  };
  services: Service[];
  projects: Project[];
  emailjs: EmailJSConfig;
  resume?: {
    url: string;
  };
}

let parsedData: Partial<PortfolioData> = {};

try {
  parsedData = YAML.parse(rawData);
} catch (error) {
  console.error("Failed to parse portfolio.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedData = { projects: [], skills: { categories: [] }, techStack: { featured: [], all: [] } } as any;
}

export const portfolioData: PortfolioData = parsedData as PortfolioData;

export const getFeaturedProjects = (): Project[] => {
  const config = portfolioData.home;
  const allProjects = portfolioData.projects || [];

  if (config?.featuredProjectsCount !== undefined && config.featuredProjectsCount < 0) {
    console.warn("Portfolio Config Warning: featuredProjectsCount cannot be negative. Defaulting to 3.");
  }

  if (config?.featuredProjectIds && config.featuredProjectIds.length > 0) {
    const uniqueIds = Array.from(new Set(config.featuredProjectIds));
    const matched = uniqueIds
      .map((id) => allProjects.find((p) => p.id === id))
      .filter((p): p is Project => p !== undefined);

    if (matched.length !== uniqueIds.length) {
      console.warn("Portfolio Config Warning: Some featuredProjectIds were invalid and safely ignored.");
    }
    return matched;
  }

  const limit = (config?.featuredProjectsCount !== undefined && config.featuredProjectsCount >= 0) 
    ? config.featuredProjectsCount 
    : 3;

  return allProjects.filter((p) => p.featured).slice(0, limit);
};

export const getCategories = () => {
  const allCats = portfolioData.projects.flatMap((p) => (p.category || []).map(c => c.trim()).filter(Boolean));
  return ["All", ...Array.from(new Set(allCats))];
};

export const hasContent = (section: unknown[] | string | undefined | null) => {
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === "string") return section.trim().length > 0;
  return !!section;
};
