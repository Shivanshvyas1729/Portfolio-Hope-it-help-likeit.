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
  category: string;
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
  techStack: string[];
  services: Service[];
  projects: Project[];
  emailjs: EmailJSConfig;
}

export const portfolioData: PortfolioData = {
  personal: {
    name: "Shivansh Vyas",
    title: "Data Scientist | AI Engineer",
    email: "shivansh@example.com",
    phone: "+91 98765 43210",
    linkedin: "https://linkedin.com/in/shivanshvyas",
    github: "https://github.com/shivanshvyas",
    location: "Bhilwara, Rajasthan, India",
    profileImage: {
      type: "local",
      value: "/assets/profile-placeholder.jpg",
      position: "right",
    },
  },

  hero: {
    headline: [
      "Building Scalable",
      "AI Systems",
      "That Create",
      "Real Impact",
    ],
    description:
      "I specialize in designing and deploying intelligent systems — from machine learning pipelines to generative AI applications — that solve complex, real-world problems at scale.",
    ctas: [
      { label: "View Projects", link: "#projects" },
      { label: "Contact Me", link: "#contact" },
    ],
  },

  stats: {
    projectsCount: 5,
    experienceCount: 1,
  },

  about: {
    description:
      "A final-year B.Tech Computer Science student at MLV Textile & Engineering College, Bhilwara. I enjoy the process of solving problems with clean, scalable solutions. I have a genuine passion for pouring intelligence into systems that make a difference — from end-to-end ML pipelines to generative AI applications.",
    marqueeTexts: [
      "WE BUILD AI SYSTEMS",
      "WE CREATE INTELLIGENT PRODUCTS",
      "WE AUTOMATE REAL WORLD PROBLEMS",
    ],
    certifications: [
      "PW Data Science with Generative AI",
      "Krish Naik ADVANCE Data Science Programs",
    ],
  },

  education: [
    {
      degree: "B.Tech in Computer Science",
      institution: "MLV Textile & Engineering College, Bhilwara",
      year: "2023 – 2027",
      description: "Specializing in Data Science & AI Engineering",
    },
  ],

  experience: [
    {
      title: "AI Engineering Intern",
      company: "Company Name",
      duration: "2025",
      description:
        "Building ML pipelines and deploying intelligent automation systems for real-world applications.",
    },
  ],

  skills: {
    categories: [
      { title: "Programming", items: ["Python"] },
      {
        title: "Core AI/ML",
        items: ["Machine Learning", "Deep Learning", "NLP", "Data Analysis"],
      },
      { title: "Advanced AI", items: ["Generative AI", "Agentic AI"] },
      { title: "Tools & Infra", items: ["Docker", "FastAPI", "Git"] },
    ],
  },

  techStack: [
    "Python",
    "TensorFlow",
    "PyTorch",
    "Docker",
    "LangChain",
    "FastAPI",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "OpenAI",
  ],

  services: [
    {
      title: "AI & ML Solutions",
      description:
        "End-to-end intelligent systems from data collection to deployment.",
      icon: "Brain",
    },
    {
      title: "Data Science Projects",
      description:
        "Complete data science lifecycle — analysis, modeling, and visualization.",
      icon: "BarChart3",
    },
    {
      title: "Generative AI Apps",
      description:
        "RAG systems, chatbots, and content generation powered by LLMs.",
      icon: "Sparkles",
    },
    {
      title: "Intelligent Automation",
      description:
        "Automating complex workflows with AI-driven decision systems.",
      icon: "Zap",
    },
  ],

  projects: [
    {
      id: 1,
      title: "Intelligent Document Q&A System",
      category: "Generative AI",
      description:
        "A RAG-powered system that allows users to ask natural language questions from uploaded documents and receive precise, context-aware answers.",
      tech: ["LangChain", "OpenAI", "FAISS", "Streamlit"],
      github: "https://github.com/shivanshvyas/doc-qa",
      live: "",
      featured: true,
      impact: "Reduced document review time by 70%",
    },
    {
      id: 2,
      title: "Customer Churn Prediction",
      category: "Machine Learning",
      description:
        "End-to-end ML pipeline predicting customer churn with 92% accuracy using ensemble methods and feature engineering.",
      tech: ["Python", "Scikit-learn", "Pandas", "XGBoost"],
      github: "https://github.com/shivanshvyas/churn-prediction",
      live: "",
      featured: true,
      impact: "Improved retention targeting by 45%",
    },
    {
      id: 3,
      title: "Sentiment Analysis Engine",
      category: "NLP",
      description:
        "Deep learning NLP model for real-time sentiment analysis of social media posts with multi-language support.",
      tech: ["PyTorch", "Transformers", "FastAPI", "Docker"],
      github: "https://github.com/shivanshvyas/sentiment-engine",
      live: "",
      featured: true,
      impact: "Processes 10K+ posts per minute",
    },
    {
      id: 4,
      title: "Sales Data Dashboard",
      category: "Data Analysis",
      description:
        "Interactive analytics dashboard with automated reporting and trend visualization for business intelligence.",
      tech: ["Python", "Pandas", "Plotly", "Streamlit"],
      github: "https://github.com/shivanshvyas/sales-dashboard",
      live: "",
      featured: false,
      impact: "Automated weekly reporting saving 8 hours",
    },
  ],
};

// Utility functions
export const getFeaturedProjects = () =>
  portfolioData.projects.filter((p) => p.featured);

export const getCategories = () => [
  "All",
  ...Array.from(new Set(portfolioData.projects.map((p) => p.category))),
];

export const hasContent = (section: unknown[] | string | undefined | null) => {
  if (Array.isArray(section)) return section.length > 0;
  if (typeof section === "string") return section.trim().length > 0;
  return !!section;
};
