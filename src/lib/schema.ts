import { z } from "zod";

// Base common types
const imageSchema = z.union([
  z.object({
    type: z.enum(["local", "url"]),
    value: z.string().url("Must be a valid URL").or(z.string().min(1, "Required")),
    position: z.enum(["left", "right", "center"]).default("right"),
  }),
  z.string().url("Must be a valid URL") // Simple string image fallback logic if needed
]);

// ─── PORTFOLIO SCHEMAS ───

export const HomeSchema = z.object({
  featuredProjectsCount: z.number().min(0).default(4),
});

export const PersonalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string(),
  linkedin: z.string().url(),
  github: z.string().url(),
  location: z.string(),
  profileImage: imageSchema,
});

export const HeroSchema = z.object({
  headline: z.array(z.string()),
  description: z.string().min(1, "Hero description required"),
  ctas: z.array(z.object({
    label: z.string(),
    link: z.string()
  })),
});

export const StatsSchema = z.object({
  projectsCount: z.number().min(0).default(0),
  experienceCount: z.number().min(0).default(0),
});

export const AboutSchema = z.object({
  description: z.string().min(1, "Description is required"),
  marqueeTexts: z.array(z.string()),
  certifications: z.array(z.string()),
});

export const EducationSchema = z.array(z.object({
  degree: z.string().min(1),
  institution: z.string().min(1),
  year: z.string().min(1),
  description: z.string().optional(),
}));

export const ExperienceSchema = z.array(z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  duration: z.string().min(1),
  description: z.string(),
}));

export const SkillsSchema = z.object({
  categories: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.string()),
  }))
});

export const TechStackSchema = z.object({
  featured: z.array(z.string()),
  all: z.array(z.string()),
});

export const ServicesSchema = z.array(z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
}));

export const ResumeSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

// Used if storing entire portfolio.yaml 
export const PortfolioSchema = z.object({
  home: HomeSchema.optional(),
  personal: PersonalSchema.optional(),
  hero: HeroSchema.optional(),
  stats: StatsSchema.optional(),
  about: AboutSchema.optional(),
  education: EducationSchema.optional(),
  experience: ExperienceSchema.optional(),
  skills: SkillsSchema.optional(),
  techStack: TechStackSchema.optional(),
  services: ServicesSchema.optional(),
  resume: ResumeSchema.optional(),
});

// ─── PROJECT SCHEMA ───

export const ProjectSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, "Title is required"),
  category: z.array(z.string()),
  description: z.string().min(1, "Description is required"),
  tech: z.array(z.string()),
  github: z.string().url().or(z.literal("")),
  live: z.string().url().or(z.literal("")),
  featured: z.boolean().default(false),
  impact: z.string().optional(),
  
  // Custom schema simplified (URLs only, no complex media)
  media: z.array(z.object({
    type: z.enum(["image", "video"]),
    url: z.string().url(),
    caption: z.string().optional()
  })).optional(),
  
  // Specific data science fields
  problem_statement: z.string().optional(),
  learning_outcomes: z.array(z.string()).optional(),
  architecture: z.string().optional(),
  architectureImage: z.string().url().or(z.literal("")).optional(), // allow empty string or valid URL
}).passthrough();

export const ProjectsArraySchema = z.array(ProjectSchema);

// ─── VALIDATOR ENGINE ───

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // Format errors nicely
    const errors = result.error.errors.map((e) => {
      const path = e.path.join(".");
      return path ? `${path}: ${e.message}` : e.message;
    });
    return { success: false, errors };
  }
}

export const GlobalSettingsSchema = z.object({
  ropeLightColors: z.array(z.string()).min(1).optional(),
  ropeLightSpeed: z.number().min(0.1).optional(),
  ropeLightThickness: z.number().min(0.5).optional(),
  ropeLightGlowIntensity: z.number().min(0).optional(),
  ropeLightColorLight: z.string().optional(),
  ropeLightColorDark: z.string().optional(),
  ropeLightAccentLight: z.string().optional(),
  ropeLightAccentDark: z.string().optional(),
  textHoverColors: z.array(z.string()).optional(),
  textTransitionSpeed: z.string().optional(),
  textLeaveSpeed: z.string().optional(),
  textAnimationSpeed: z.string().optional(),
  textBaseOpacity: z.number().min(0).max(1).optional(),
  textGlowIntensity: z.number().optional(),
});

// Global schema map to easily fetch specific section schemas later
export const SECTION_SCHEMAS: Record<string, z.ZodSchema<any>> = {
  settings: GlobalSettingsSchema,
  home: HomeSchema,
  personal: PersonalSchema,
  hero: HeroSchema,
  stats: StatsSchema,
  about: AboutSchema,
  education: EducationSchema,
  experience: ExperienceSchema,
  skills: SkillsSchema,
  techStack: TechStackSchema,
  services: ServicesSchema,
  resume: ResumeSchema,
  projects: ProjectsArraySchema,
};
