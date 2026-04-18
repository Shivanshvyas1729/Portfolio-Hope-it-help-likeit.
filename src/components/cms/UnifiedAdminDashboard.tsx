import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCMSState, useCMSActions } from '@/context/CMSContext';
import { useAuth } from '@/hooks/useAuth';
import { SECTION_SCHEMAS, validateData } from '@/lib/schema';
import { DynamicForm } from './DynamicForm';
import { ProjectsAdmin } from './ProjectsAdmin';
import { AdminPanel as BlogAdminPanel } from '../blog/AdminPanel';
import { Save, Minimize2, Maximize2, X, RefreshCw, AlertTriangle, ShieldCheck, ShieldAlert, ListRestart, ScrollText } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

const DEFAULT_W = 750;
const DEFAULT_H = 600;

export const UnifiedAdminDashboard = () => {
  const { 
    previewData, 
    previewMode, 
    safeMode, 
    cmsMode,
    forceLocalMode,
    isLocalEnvironment,
    auditLogs
  } = useCMSState();

  const { 
    setPreviewMode, 
    setSafeMode, 
    setForceLocalMode,
    updatePreviewSection, 
    refreshData,
    clearLogs
  } = useCMSActions();
  
  const { roles } = useAuth();
  const isEditorOnly = roles.includes("editor") && !roles.includes("admin");
  const userRole = roles.includes("admin") ? "admin" : "editor";

  // Position & Size State
  const [isMaximized, setIsMaximized] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem('cms-maximized') === 'true';
    return false;
  });

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('cms-dimensions');
      return saved ? JSON.parse(saved) : { w: DEFAULT_W, h: DEFAULT_H };
    }
    return { w: DEFAULT_W, h: DEFAULT_H };
  });

  const [activeTab, setActiveTab] = useState<'portfolio' | 'projects' | 'blog' | 'settings' | 'history' | 'logs'>('portfolio');
  const [localActiveSection, setLocalActiveSection] = useState<string>('hero');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isInteracting, setIsInteracting] = useState(false);

  const [conflictData, setConflictData] = useState<{
    latestSha: string;
    latestContent: string;
    section: string;
    pendingData: any;
    targetFile: string;
  } | null>(null);

  // Refs for dragging and resizing
  const panelRef = useRef<HTMLDivElement>(null);
  const geom = useRef({ x: 0, y: 0, w: dimensions.w, h: dimensions.h });
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });
  const resizeRef = useRef({ active: false, startW: 0, startH: 0, startX: 0, startY: 0 });

  const applyGeom = useCallback(() => {
    const el = panelRef.current;
    if (!el || isMaximized) return;
    el.style.transform = `translate3d(${geom.current.x}px, ${geom.current.y}px, 0)`;
    el.style.width = `${geom.current.w}px`;
    el.style.height = `${geom.current.h}px`;
  }, [isMaximized]);

  useEffect(() => {
    if (isMaximized) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    geom.current = {
      x: Math.max(8, vw / 2 - geom.current.w / 2),
      y: Math.max(72, vh / 2 - geom.current.h / 2),
      w: Math.min(geom.current.w, vw - 16),
      h: Math.min(geom.current.h, vh - 60),
    };
    applyGeom();
  }, [isMaximized, applyGeom]);

  useEffect(() => {
    localStorage.setItem('cms-maximized', String(isMaximized));
  }, [isMaximized]);

  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: geom.current.x, oy: geom.current.y };
    document.body.style.userSelect = "none";
    setIsInteracting(true);
  };

  const onHeaderPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    geom.current.x = drag.current.ox + (e.clientX - drag.current.sx);
    geom.current.y = drag.current.oy + (e.clientY - drag.current.sy);
    applyGeom();
  };

  const onHeaderPointerUp = () => {
    drag.current.active = false;
    document.body.style.userSelect = "";
    setIsInteracting(false);
  };

  const onResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeRef.current = {
      active: true,
      startW: geom.current.w,
      startH: geom.current.h,
      startX: e.clientX,
      startY: e.clientY
    };
    setIsInteracting(true);
  };

  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizeRef.current.active) return;
    const dx = e.clientX - resizeRef.current.startX;
    const dy = e.clientY - resizeRef.current.startY;
    geom.current.w = Math.max(500, resizeRef.current.startW + dx);
    geom.current.h = Math.max(400, resizeRef.current.startH + dy);
    applyGeom();
  };

  const onResizeEnd = () => {
    resizeRef.current.active = false;
    setIsInteracting(false);
    setDimensions({ w: geom.current.w, h: geom.current.h });
    localStorage.setItem('cms-dimensions', JSON.stringify({ w: geom.current.w, h: geom.current.h }));
  };

  const saveContent = async (section: string, data: any, overrideSha?: string) => {
    setIsLoading(true);
    setErrorMsg("");
    
    const isProject = section === 'projects';
    const filePath = isProject ? 'src/data/projects.yaml' : 'src/data/portfolio.yaml';
    const actionName = isProject ? "SAVE_PROJECTS" : `SAVE_SECTION:${section}`;

    logger.addLog({ 
      action: actionName, 
      status: "pending", 
      message: `Initiating save for ${section} to ${filePath}...`,
      metadata: { section, filePath, isSafeMode: safeMode }
    });

    const schema = SECTION_SCHEMAS[section];
    if (schema) {
      const validation = validateData(schema, data);
      if (validation.success === false) {
        const errorText = validation.errors.join(", ");
        setErrorMsg("Validation Failed: " + errorText);
        logger.addLog({ action: actionName, status: "error", message: `Validation failed: ${errorText}` });
        setIsLoading(false);
        return { success: false, error: errorText };
      }
    }

    try {
      const res = await fetch("/api/cms-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          sectionKey: section,
          newData: data,
          providedSha: overrideSha || undefined, 
          isSafeMode: safeMode,
          role: userRole
        })
      });

      const result = await res.json();
      
      if (res.status === 409) {
        setConflictData({
          latestSha: result.data.latestSha,
          latestContent: result.data.latestContent,
          section,
          pendingData: data,
          targetFile: filePath
        });
        logger.addLog({ action: actionName, status: "error", message: "Conflict detected (SHA mismatch). Overlay triggered." });
        toast.error("Conflict detected!");
        setIsLoading(false);
        return { success: false, error: "Conflict" };
      } 
      
      if (!result.success) {
        setErrorMsg(result.error || "Save Failed");
        logger.addLog({ action: actionName, status: "error", message: `Backend error: ${result.error}`, metadata: result });
        setIsLoading(false);
        return { success: false, error: result.error };
      } 

      logger.addLog({ 
        action: actionName, 
        status: "success", 
        message: `${section} persisted successfully to ${result.mode || 'backend'}.`,
        metadata: result
      });
      
      toast.success(result.message || "Saved successfully");
      setConflictData(null);
      if (!safeMode) await refreshData();
      
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      const msg = e.message || "Network failure";
      setErrorMsg("Network error: " + msg);
      logger.addLog({ action: actionName, status: "error", message: `Network/Runtime failure: ${msg}`, metadata: e });
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const handleConflictResolve = (action: 'overwrite' | 'cancel') => {
    if (action === 'cancel') {
      setConflictData(null);
      return;
    }
    if (conflictData) {
      saveContent(conflictData.section, conflictData.pendingData, conflictData.latestSha);
    }
  };

  const fetchHistory = async (file: string) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/cms-history?filePath=${file}`);
      const result = await res.json();
      if (result.success) setHistoryLogs(result.data.commits || []);
      else setErrorMsg(result.error || "Failed to load history");
    } catch {
      setErrorMsg("Failed to load history");
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    if (activeTab === 'history') fetchHistory('src/data/portfolio.yaml');
  }, [activeTab]);

  const activeSectionData = useMemo(() => {
    return (previewData as any)[localActiveSection] || {};
  }, [previewData, localActiveSection]);

  const syncStatus = useMemo(() => {
    if (forceLocalMode) return { label: 'Local (Forced)', color: 'bg-amber-500/20 text-amber-500', icon: '🚧' };
    if (cmsMode === 'local') return { label: 'Local Mode', color: 'bg-green-500/20 text-green-500', icon: '🏠' };
    if (cmsMode === 'github') return { label: 'Cloud Sync', color: 'bg-blue-500/20 text-blue-500', icon: '☁️' };
    return { label: 'Connecting...', color: 'bg-muted text-muted-foreground', icon: '⏳' };
  }, [cmsMode, forceLocalMode]);

  const containerStyle: React.CSSProperties = isMaximized 
    ? { 
        position: 'fixed', 
        inset: 0, 
        zIndex: 90,
        width: '100% !important',
        height: '100% !important',
        transform: 'none !important'
      } 
    : { 
        position: "fixed", 
        zIndex: 90, 
        width: geom.current.w,
        height: geom.current.h,
        transform: `translate3d(${geom.current.x}px, ${geom.current.y}px, 0)`,
        willChange: isInteracting ? 'transform, width, height' : 'auto'
      };

  return (
    <div
      ref={panelRef}
      style={containerStyle}
      className={`glass-card ${isMaximized ? 'rounded-none' : 'rounded-2xl shadow-2xl border border-primary/20'} flex flex-col overflow-hidden bg-background/95 backdrop-blur-3xl ${!isInteracting ? 'transition-[border-radius,width,height,transform] duration-300' : ''} ${isMinimized ? '!h-12 !w-80' : ''}`}
    >
      {/* HEADER */}
      <div 
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/10 cursor-grab active:cursor-grabbing shrink-0"
      >
        <div className="flex items-center gap-2 pointer-events-none">
           <span className="text-sm font-bold truncate max-w-[100px] sm:max-w-none">CMS Matrix</span>
           <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1.5 ${syncStatus.color}`}>
             <span>{syncStatus.icon}</span>
             <span>{syncStatus.label}</span>
           </div>
        </div>
        <div data-no-drag className="flex items-center gap-2">
           <button 
             onClick={() => setSafeMode(!safeMode)} 
             className={`hidden sm:flex px-2 py-1 items-center gap-1 text-[10px] font-bold rounded uppercase transition-colors ${safeMode ? 'bg-amber-500/20 text-amber-500' : 'bg-muted text-muted-foreground'}`}
           >
             {safeMode ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>} 
             Safe Mode
           </button>
           <label className="flex items-center gap-1.5 cursor-pointer text-[10px] uppercase font-bold text-muted-foreground ml-2">
             Preview
             <input type="checkbox" checked={previewMode} onChange={e => setPreviewMode(e.target.checked)} className="accent-primary" />
           </label>
           <div className="w-px h-4 bg-border mx-1" />
           <button onClick={() => setIsMaximized(!isMaximized)} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
              {isMaximized ? <Minimize2 size={14}/> : <Maximize2 size={14} />}
           </button>
           <button onClick={() => setIsMinimized(m => !m)} className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors">
              <X size={14} />
           </button>
        </div>
      </div>

      {conflictData && !isMinimized && (
        <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
           <AlertTriangle size={48} className="text-destructive mb-4" />
           <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">Conflict Detected</h2>
           <p className="text-sm text-foreground/80 my-3 max-w-sm">Another editor recently pushed changes. Your local version is out of sync.</p>
           <div className="flex gap-3 mt-4">
             <button onClick={() => handleConflictResolve('cancel')} className="px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium">Cancel</button>
             <button onClick={() => handleConflictResolve('overwrite')} className="px-5 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium flex items-center gap-2">
               Over-write <RefreshCw size={14} />
             </button>
           </div>
        </div>
      )}

      {!isMinimized && (
        <div className={`flex flex-1 overflow-hidden relative ${isInteracting ? 'pointer-events-none' : ''}`}>
          <div className="w-[180px] bg-muted/20 border-r border-border/40 flex flex-col p-3 gap-2 overflow-y-auto shrink-0">
             <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-2 px-2">Modules</div>
               {['portfolio', 'projects', 'blog', 'history', 'settings', 'logs'].map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab as any)}
                   className={`text-sm font-medium px-3 py-2 rounded-lg text-left transition-colors capitalize ${activeTab === tab ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-muted-foreground'}`}
                 >
                   {tab === 'logs' ? (
                     <span className="flex items-center gap-2">
                       {tab}
                       {auditLogs.some(l => l.status === 'error') && (
                         <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                       )}
                     </span>
                   ) : tab}
                 </button>
               ))}

             {activeTab === 'portfolio' && (
               <>
                 <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70 tracking-wider mb-1 mt-4 px-2">Sections</div>
                 {[
                   "home", "hero", "personal", "about", "projects-shortcut", "stats", "skills", "techStack", "services", "education", "experience", "resume"
                 ]
                 .filter(sec => !isEditorOnly || !["emailjs", "personal", "resume"].includes(sec))
                 .map(sec => (
                   <button 
                     key={sec} 
                     onClick={() => {
                       if (sec === 'projects-shortcut') setActiveTab('projects');
                       else setLocalActiveSection(sec);
                     }}
                     className={`text-[13px] font-medium px-3 py-1.5 rounded-lg text-left transition-colors capitalize ${
                       sec === 'projects-shortcut' ? 'text-primary/80 hover:bg-primary/5 italic' :
                       localActiveSection === sec ? 'bg-muted border border-border/50 text-foreground shadow-sm' : 
                       'hover:bg-muted/30 text-muted-foreground border border-transparent'
                     }`}
                   >
                     {sec === 'projects-shortcut' ? "→ Projects" : sec.replace(/([A-Z])/g, ' $1').trim()}
                   </button>
                 ))}
               </>
             )}
          </div>

          <div className="flex-1 flex flex-col bg-background/40 relative h-full overflow-hidden">
            {activeTab === 'portfolio' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {errorMsg && <div className="mb-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">{errorMsg}</div>}
                  {SECTION_SCHEMAS[localActiveSection] ? (
                    <DynamicForm
                      schema={SECTION_SCHEMAS[localActiveSection]}
                      data={activeSectionData}
                      onChange={(data) => updatePreviewSection(localActiveSection, data)}
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm">Select a section.</div>
                  )}
                </div>
                <div className="p-4 border-t border-border/40 bg-muted/10 shrink-0 flex items-center justify-end gap-3">
                  <button 
                    disabled={isLoading}
                    onClick={() => saveContent(localActiveSection, activeSectionData)}
                    className="px-5 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg"
                  >
                    {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
                    {isLoading ? "Saving..." : (cmsMode === 'local' || forceLocalMode ? `Save Local` : `Commit GitHub`)}
                  </button>
                </div>
              </>
            )}

            {activeTab === 'projects' && (
               <ProjectsAdmin
                 projects={(previewData as any).projects || []}
                 onChange={(proj) => updatePreviewSection('projects', proj)}
                 isLoading={isLoading}
                 mode={(forceLocalMode || cmsMode === 'local') ? 'local' : 'github'}
                 onSave={() => saveContent('projects', (previewData as any).projects || [])}
               />
            )}

            {activeTab === 'blog' && (
              <div className="flex-1 relative overflow-auto">
                <BlogAdminPanel onSuccess={() => toast.success(`Blog deployed!`)} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="font-bold">History</h3>
                   <div className="flex gap-2 text-xs">
                     <button onClick={() => fetchHistory('src/data/portfolio.yaml')} className="p-1 px-2 bg-muted rounded">Portfolio</button>
                     <button onClick={() => fetchHistory('src/data/projects.yaml')} className="p-1 px-2 bg-muted rounded">Projects</button>
                   </div>
                 </div>
                 {loadingHistory ? <RefreshCw size={24} className="animate-spin" /> : (
                   <div className="space-y-3">
                     {historyLogs.map(log => (
                       <div key={log.sha} className="p-3 rounded-lg border border-border/50 bg-muted/5 text-xs">
                         <p className="font-bold">{log.message}</p>
                         <p className="opacity-70">{new Date(log.date).toLocaleString()} • {log.author}</p>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><RefreshCw size={18} /> Sync Settings</h3>
                <div className="p-5 rounded-2xl border border-border/50 bg-muted/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Force Local Mode</p>
                      <p className="text-xs text-muted-foreground">Force-save to local filesystem.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={forceLocalMode} 
                      onChange={(e) => setForceLocalMode(e.target.checked)}
                      className="w-4 h-4" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40 shrink-0">
                  <div className="flex items-center gap-2">
                    <ScrollText size={18} className="text-primary" />
                    <h3 className="text-lg font-bold">Audit Logs</h3>
                  </div>
                  <button 
                    onClick={clearLogs}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/5"
                  >
                    <ListRestart size={14} />
                    Clear History
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-muted/5">
                  {auditLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/40">
                      <ScrollText size={32} className="mb-2 opacity-20" />
                      <p className="text-sm">No activity logs recorded yet.</p>
                    </div>
                  ) : (
                    auditLogs.map(log => (
                      <div key={log.id} className="group p-3 rounded-lg border border-border/30 bg-background/50 flex gap-4 text-[11px] font-mono leading-relaxed transition-all hover:border-primary/20 hover:bg-background shadow-sm">
                        <div className="text-muted-foreground/60 w-16 shrink-0 pt-0.5">{log.timestamp}</div>
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              log.status === 'success' ? 'bg-green-500/10 text-green-600' :
                              log.status === 'error' ? 'bg-red-500/10 text-red-600' :
                              'bg-blue-500/10 text-blue-600'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-muted-foreground/40 group-hover:opacity-100 opacity-0 transition-opacity">ID: {log.id}</span>
                          </div>
                          <div className="text-foreground/80">{log.message}</div>
                          {log.metadata && (
                            <details className="mt-1">
                              <summary className="text-[9px] cursor-pointer text-primary/60 hover:text-primary">View Metadata</summary>
                              <pre className="mt-2 p-2 rounded bg-muted/50 border border-border/20 overflow-x-auto text-[9px]">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isMaximized && !isMinimized && (
        <div 
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-[100] flex items-end justify-end p-1 group"
        >
          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full group-hover:bg-primary" />
        </div>
      )}
    </div>
  );
};
