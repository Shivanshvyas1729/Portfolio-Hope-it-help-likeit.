import rawData from "./portfolio.yaml?raw";
import rawProjects from "./projects.yaml?raw";
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
  resources?: { label: string; url: string }[];
  problem_statement?: string;
  learning_outcomes?: string[];
  architecture?: string;
  objectives?: string[];
  success_criteria?: string[];
  data_sources?: string[];
  target_variable?: string;
  features?: string[];
  preprocessing?: string[];
  modeling?: string[];
  evaluation_metrics?: string[];
  validation_strategy?: string;
  explainability?: string;
  deployment?: string;
  risks?: string[];
  ethics?: string[];
  open_resources?: { label: string; url: string }[];
}

export interface Settings {
  ropeLightColors?: string[];
  ropeLightSpeed?: number;
  ropeLightThickness?: number;
  ropeLightGlowIntensity?: number;
  ropeLightColorLight?: string;
  ropeLightColorDark?: string;
  ropeLightAccentLight?: string;
  ropeLightAccentDark?: string;
  textHoverColors?: string[];
  textTransitionSpeed?: string;
  textLeaveSpeed?: string;
  textAnimationSpeed?: string;
  textBaseOpacity?: number;
  textGlowIntensity?: number;
}

export interface PortfolioData {
  home?: {
    featuredProjectsCount?: number;
    featuredProjectIds?: number[];
  };
  settings?: Settings;
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
  resume?: {
    url: string;
  };
}

let parsedData: Partial<PortfolioData> = {};
let parsedProjects: { projects: Project[] } = { projects: [] };

try {
  parsedData = YAML.parse(rawData);
} catch (error) {
  console.error("Failed to parse portfolio.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedData = { skills: { categories: [] }, techStack: { featured: [], all: [] } } as any;
}

try {
  parsedProjects = YAML.parse(rawProjects);
} catch (error) {
  console.error("Failed to parse projects.yaml. Ensure the YAML syntax is correct. Using safe fallback.", error);
  parsedProjects = { projects: [] };
}

// Fixed logic for sorting projects
const projects = (parsedProjects?.projects || []).slice();
projects.sort((a, b) => (b.id || 0) - (a.id || 0));

export const portfolioData: PortfolioData = {
  ...parsedData,
  projects
} as PortfolioData;

/**
 * PRODUCTION LIVE SYNC: 
 * Fetches the absolute latest YAML from GitHub Raw at runtime.
 * This allows "Instant" updates on the live site without waiting for a 3-minute Vercel build.
 */
export async function getLivePortfolioData(): Promise<PortfolioData> {
  if (typeof window === 'undefined') return portfolioData; // SSR fallback
  
  try {
    const RAW_BASE = "https://raw.githubusercontent.com/Shivanshvyas1729/My_personal_portfolio/main/src/data";
    const [pRes, sRes] = await Promise.all([
      fetch(`${RAW_BASE}/portfolio.yaml?t=${Date.now()}`),
      fetch(`${RAW_BASE}/projects.yaml?t=${Date.now()}`)
    ]);
    
    if (!pRes.ok || !sRes.ok) throw new Error("GitHub fetch failed");
    
    const pYaml = await pRes.text();
    const sYaml = await sRes.text();
    
    const pData = YAML.parse(pYaml);
    const sData = YAML.parse(sYaml);
    
    return {
      ...pData,
      projects: (sData?.projects || []).sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
    } as PortfolioData;
  } catch (e) {
    console.warn("CMS: Live refresh failed, using build-time bundle.", e);
    return portfolioData;
  }
}

export const getFeaturedProjects = (data: PortfolioData): Project[] => {
  const config = data.home;
  const allProjects = data.projects || [];

  if (config?.featuredProjectIds && config.featuredProjectIds.length > 0) {
    return Array.from(new Set(config.featuredProjectIds))
      .map((id) => allProjects.find((p) => p.id === id))
      .filter((p): p is Project => p !== undefined);
  }

  const limit = (config?.featuredProjectsCount !== undefined && config.featuredProjectsCount >= 0) 
    ? config.featuredProjectsCount 
    : 3;

  return allProjects.filter((p) => p.featured).slice(0, limit);
};

export const getCategories = (projects: Project[]) => {
  const allCats = projects.flatMap((p) => (p.category || []).map(c => c.trim()).filter(Boolean));
  return ["All", ...Array.from(new Set(allCats))];
};

export const hasContent = (section: unknown[] | string | undefined | null) => {
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === "string") return section.trim().length > 0;
  return !!section;
};
