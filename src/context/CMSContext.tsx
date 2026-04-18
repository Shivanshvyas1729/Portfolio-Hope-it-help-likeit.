import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect } from "react";
import { portfolioData as initialPortfolioData, PortfolioData } from "@/data/portfolioData";
import { logger, AuditEntry } from "@/lib/logger";
import { toast } from "sonner";

interface CMSState {
  previewMode: boolean;
  safeMode: boolean;
  liveData: PortfolioData;
  previewData: PortfolioData;
  activeSection: string | null;
  cmsMode: "local" | "github" | "unknown";
  forceLocalMode: boolean;
  isLocalEnvironment: boolean;
  auditLogs: AuditEntry[];
}

interface CMSActions {
  setPreviewMode: (val: boolean) => void;
  setSafeMode: (val: boolean) => void;
  setForceLocalMode: (val: boolean) => void;
  updatePreviewSection: (section: string, data: any) => void;
  updateNestedField: (path: string, value: any) => void;
  setActiveSection: (sec: string | null) => void;
  refreshData: () => Promise<void>;
  clearLogs: () => void;
}

const CMSStateContext = createContext<CMSState | undefined>(undefined);
const CMSActionsContext = createContext<CMSActions | undefined>(undefined);

export const CMSProvider = ({ children }: { children: ReactNode }) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [safeMode, setSafeMode] = useState(false);
  const [cmsMode, setCmsMode] = useState<"local" | "github" | "unknown">("unknown");
  const [liveData, setLiveData] = useState<PortfolioData>(initialPortfolioData);
  const [previewData, setPreviewData] = useState<PortfolioData>(initialPortfolioData);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  const isLocalEnvironment = useMemo(() => {
    return typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  }, []);

  const [forceLocalMode, setForceLocalMode] = useState(false);

  // Client-only initialization to prevent hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem("cms-force-local") === "true";
    if (saved) setForceLocalMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("cms-force-local", String(forceLocalMode));
  }, [forceLocalMode]);

  // Subscribe to Logger
  useEffect(() => {
    return logger.subscribe(setAuditLogs);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      logger.addLog({ action: "REFRESH_DATA", status: "pending", message: "Fetching live content from backend..." });
      
      const portRes = await fetch("/api/cms-load?filePath=src/data/portfolio.yaml");
      const portJson = await portRes.json();
      
      if (portJson.mode) setCmsMode(portJson.mode);

      const projRes = await fetch("/api/cms-load?filePath=src/data/projects.yaml");
      const projJson = await projRes.json();

      let combinedData = { ...initialPortfolioData };
      if (portJson.success && portJson.data) {
        combinedData = { ...combinedData, ...portJson.data };
      }
      if (projJson.success && projJson.data?.projects) {
        combinedData = { ...combinedData, projects: projJson.data.projects };
      }

      setLiveData(combinedData);
      setPreviewData(combinedData);
      
      logger.addLog({ action: "REFRESH_DATA", status: "success", message: "Live content synchronized successfully." });
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.addLog({ action: "REFRESH_DATA", status: "error", message: `Failed to fetch data: ${errorMsg}`, metadata: e });
      toast.error("CMS Sync Failed");
    }
  }, []);

  // Initial Sync
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updatePreviewSection = useCallback((section: string, data: any) => {
    setPreviewData(prev => ({
      ...prev,
      [section]: data
    }) as PortfolioData);
    logger.addLog({ 
      action: "UPDATE_PREVIEW", 
      status: "success", 
      message: `Modified ${section} in preview.`,
      metadata: { section }
    });
  }, []);

  const updateNestedField = useCallback((path: string, value: any) => {
    setPreviewData(prev => {
      const keys = path.split('.');
      const next = { ...prev };
      let current: any = next;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = Array.isArray(current[key]) ? [...current[key]] : { ...current[key] };
        current = current[key];
      }
      
      current[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const stateValue = useMemo(() => ({
    previewMode,
    safeMode,
    liveData,
    previewData,
    activeSection,
    cmsMode,
    forceLocalMode,
    isLocalEnvironment,
    auditLogs
  }), [previewMode, safeMode, liveData, previewData, activeSection, cmsMode, forceLocalMode, isLocalEnvironment, auditLogs]);

  const actionsValue = useMemo(() => ({
    setPreviewMode,
    setSafeMode,
    setForceLocalMode,
    updatePreviewSection,
    updateNestedField,
    setActiveSection,
    refreshData,
    clearLogs: () => logger.clearLogs()
  }), [setPreviewMode, setSafeMode, setForceLocalMode, updatePreviewSection, updateNestedField, setActiveSection, refreshData]);

  return (
    <CMSStateContext.Provider value={stateValue}>
      <CMSActionsContext.Provider value={actionsValue}>
        {children}
        
        {/* UI Indicators */}
        {previewMode && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-md animate-pulse">
            Preview Mode Active
          </div>
        )}
        {safeMode && (
          <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
            Safe Mode (No Commits)
          </div>
        )}
      </CMSActionsContext.Provider>
    </CMSStateContext.Provider>
  );
};

export const useCMSState = () => {
  const ctx = useContext(CMSStateContext);
  if (!ctx) throw new Error("useCMSState must be used within a CMSProvider");
  return ctx;
};

export const useCMSActions = () => {
  const ctx = useContext(CMSActionsContext);
  if (!ctx) throw new Error("useCMSActions must be used within a CMSProvider");
  return ctx;
};

export function useCMSData<T>(selector: (data: PortfolioData) => T): T {
  const { previewMode, previewData, liveData } = useCMSState();
  const data = previewMode ? previewData : liveData;
  
  return useMemo(() => {
    try {
      return selector(data);
    } catch (e) {
      console.warn("CMS Selector failed, returning fallback from initialData", e);
      return selector(initialPortfolioData);
    }
  }, [data, selector]);
}

export const useCMS = () => {
  const state = useCMSState();
  const actions = useCMSActions();
  return { ...state, ...actions };
};
