import { useState, useEffect } from "react";

export interface GithubStats {
  stars: number;
  forks: number;
  lastUpdated: string;
}

interface CacheEntry {
  data: GithubStats;
  timestamp: number;
}

const MEMORY_CACHE = new Map<string, CacheEntry>();
const CACHE_EXPIRY = 3600000; // 1 hour in ms
const MAX_RETRIES = 2;

export const extractRepoPath = (url?: string): string | null => {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== "github.com") return null;
    
    // Remove .git and trailing slashes safely
    const path = parsedUrl.pathname.replace(/\.git$/, "").replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`; // owner/repo safely isolated
    }
  } catch {
    return null; // Ignore invalid URLs gracefully
  }
  return null;
};

const getFromCache = (repoPath: string): GithubStats | null => {
  const now = Date.now();
  
  // 1. Check Memory Cache globally first
  const mem = MEMORY_CACHE.get(repoPath);
  if (mem && (now - mem.timestamp < CACHE_EXPIRY)) return mem.data;

  // 2. Check Local Storage second
  try {
    const localRaw = localStorage.getItem(`github_stats_${repoPath}`);
    if (localRaw) {
      const local: CacheEntry = JSON.parse(localRaw);
      if (now - local.timestamp < CACHE_EXPIRY) {
        // Hydrate memory cache internally to prevent future heavy lookups
        MEMORY_CACHE.set(repoPath, local);
        return local.data;
      } else {
        localStorage.removeItem(`github_stats_${repoPath}`);
      }
    }
  } catch {
    // Mute errors if localStorage throws security/quota exceptions
  }
  return null;
};

const setCache = (repoPath: string, data: GithubStats) => {
  const entry: CacheEntry = { data, timestamp: Date.now() };
  MEMORY_CACHE.set(repoPath, entry);
  try {
    localStorage.setItem(`github_stats_${repoPath}`, JSON.stringify(entry));
  } catch {
    // Safely ignore local storage blocking rules
  }
};

export const useGithubStats = (githubUrl?: string) => {
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const repoPath = extractRepoPath(githubUrl);
    
    if (!repoPath) {
      setLoading(false);
      return; 
    }

    const loadData = async (attempt = 1) => {
      const cached = getFromCache(repoPath);
      if (cached) {
        setStats(cached);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://api.github.com/repos/${repoPath}`);
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        const extracted: GithubStats = {
          stars: data.stargazers_count || 0,
          forks: data.forks_count || 0,
          lastUpdated: data.updated_at || new Date().toISOString()
        };

        setCache(repoPath, extracted);
        setStats(extracted);
        setLoading(false);
        
      } catch (err) {
        if (attempt < MAX_RETRIES) {
          setTimeout(() => loadData(attempt + 1), 1000 * attempt);
        } else {
          console.warn(`Failed to fetch GitHub stats for ${repoPath} after retries.`);
          setError(true);
          setLoading(false);
        }
      }
    };

    loadData();
  }, [githubUrl]);

  return { stats, loading, error };
};
