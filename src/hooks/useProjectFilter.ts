import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Project } from "@/data/portfolioData";

export const useProjectFilter = (projects: Project[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category");
  
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Sync state with URL params on mount
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  const handleSetCategory = (category: string) => {
    setSelectedCategory(category);
    if (category === "All") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const categories = useMemo(() => {
    // 1. Extract, dedupe and normalize categories safely
    const rawCategories = projects.flatMap(p => 
      Array.isArray(p.category) ? p.category : []
    );
    
    const validCategories = rawCategories
      .filter(c => typeof c === 'string' && c.trim().length > 0)
      .map(c => c.trim());

    // Dedupe while preserving display casing (takes first seen casing)
    const uniqueMap = new Map<string, string>();
    validCategories.forEach(c => {
      const normalized = c.toLowerCase();
      if (!uniqueMap.has(normalized)) {
        uniqueMap.set(normalized, c);
      }
    });

    const unique = Array.from(uniqueMap.values());

    // 2. Sort categories (Priority + Alphabetical)
    const priority = ["Generative AI", "Machine Learning"];
    
    unique.sort((a, b) => {
      const idxA = priority.findIndex(p => p.toLowerCase() === a.toLowerCase());
      const idxB = priority.findIndex(p => p.toLowerCase() === b.toLowerCase());
      
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      
      return a.localeCompare(b);
    });

    return ["All", ...unique];
  }, [projects]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: projects.length };
    
    categories.forEach(c => {
      if (c !== "All") map[c] = 0;
    });

    projects.forEach(p => {
      if (!Array.isArray(p.category)) return;
      const pCatsNormalized = p.category.map(c => c.trim().toLowerCase());
      
      categories.forEach(c => {
        if (c !== "All" && pCatsNormalized.includes(c.toLowerCase())) {
          map[c]++;
        }
      });
    });

    return map;
  }, [categories, projects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory.toLowerCase() === "all") return projects;
    
    const normalizedTarget = selectedCategory.trim().toLowerCase();
    
    return projects.filter(p => {
      if (!Array.isArray(p.category)) return false;
      return p.category.some(c => c.trim().toLowerCase() === normalizedTarget);
    });
  }, [projects, selectedCategory]);

  return {
    categories,
    selectedCategory,
    setSelectedCategory: handleSetCategory,
    filteredProjects,
    counts
  };
};
