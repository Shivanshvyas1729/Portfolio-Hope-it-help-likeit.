import { useState, useRef, useEffect, useCallback } from "react";
import { Save, Plus, Loader2, Link as LinkIcon, Trash2, GripHorizontal, Minimize2, Maximize2, Star, EyeOff } from "lucide-react";
import { BlogPost } from "@/pages/Blog";
import { apiFetch, API_ROUTES } from "@/lib/apiClient";

interface AdminPanelProps {
  onSuccess: (post: BlogPost) => void;
}

const DEFAULT_W = 420;
const DEFAULT_H = 580;
const MIN_W = 320;
const MIN_H = 300;

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <span className="relative group/tip inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 text-[11px] leading-relaxed bg-popover border border-border/50 text-muted-foreground rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover/tip:opacity-100 transition-opacity z-[100] text-center">
        {text}
      </span>
    </span>
  );
}

export function AdminPanel({ onSuccess }: AdminPanelProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "Notes",
    type: "",
    featured: false,
    draft: true
  });

  const [resources, setResources] = useState<{ label: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  // ── DOM ref for direct style mutation (zero-rerender during move) ──────────
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Persistent position/size in refs (not state) for smooth operations ────
  const geom = useRef({ x: 0, y: 0, w: DEFAULT_W, h: DEFAULT_H, ready: false });

  // ── Set initial position once on mount ────────────────────────────────────
  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    geom.current = {
      x: Math.max(8, vw - DEFAULT_W - 16),
      y: Math.max(72, vh - DEFAULT_H - 16),
      w: DEFAULT_W,
      h: DEFAULT_H,
      ready: true,
    };
    applyGeom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helper: push current geom directly onto the DOM node ──────────────────
  const applyGeom = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const { x, y, w, h } = geom.current;
    el.style.left   = `${x}px`;
    el.style.top    = `${y}px`;
    el.style.width  = `${w}px`;
    el.style.height = `${h}px`;
  }, []);

  // ── Clamp helper ──────────────────────────────────────────────────────────
  const clamp = (x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(0, Math.min(x, vw - w)),
      y: Math.max(0, Math.min(y, vh - 40)), // keep title-bar always visible
    };
  };

  // ── Drag ──────────────────────────────────────────────────────────────────
  const drag = useRef({ active: false, sx: 0, sy: 0, ox: 0, oy: 0 });

  const onHeaderPointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, sx: e.clientX, sy: e.clientY, ox: geom.current.x, oy: geom.current.y };
    document.body.style.userSelect = "none";
  }, []);

  const onHeaderPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.sx;
    const dy = e.clientY - drag.current.sy;
    const { x, y } = clamp(drag.current.ox + dx, drag.current.oy + dy, geom.current.w, geom.current.h);
    geom.current.x = x;
    geom.current.y = y;
    applyGeom();
  }, [applyGeom]);

  const onHeaderPointerUp = useCallback(() => {
    drag.current.active = false;
    document.body.style.userSelect = "";
  }, []);

  // ── Resize ────────────────────────────────────────────────────────────────
  const resize = useRef({ active: false, edge: "", sx: 0, sy: 0, ox: 0, oy: 0, ow: 0, oh: 0 });

  const startResize = useCallback((e: React.PointerEvent, edge: string) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    resize.current = {
      active: true, edge,
      sx: e.clientX, sy: e.clientY,
      ox: geom.current.x, oy: geom.current.y,
      ow: geom.current.w, oh: geom.current.h,
    };
    document.body.style.userSelect = "none";
  }, []);

  const onWindowPointerMove = useCallback((e: PointerEvent) => {
    const rs = resize.current;
    if (!rs.active) return;

    const dx = e.clientX - rs.sx;
    const dy = e.clientY - rs.sy;
    let { ox: x, oy: y, ow: w, oh: h } = rs;

    if (rs.edge.includes('e')) w = Math.max(MIN_W, rs.ow + dx);
    if (rs.edge.includes('s')) h = Math.max(MIN_H, rs.oh + dy);
    if (rs.edge.includes('w')) {
      const nw = Math.max(MIN_W, rs.ow - dx);
      x = rs.ox + (rs.ow - nw);
      w = nw;
    }
    if (rs.edge.includes('n')) {
      const nh = Math.max(MIN_H, rs.oh - dy);
      y = rs.oy + (rs.oh - nh);
      h = nh;
    }

    const clamped = clamp(x, y, w, h);
    geom.current = { ...geom.current, x: clamped.x, y: clamped.y, w, h };
    applyGeom();
  }, [applyGeom]);

  const onWindowPointerUp = useCallback(() => {
    resize.current.active = false;
    drag.current.active = false;
    document.body.style.userSelect = "";
  }, []);

  // Attach global pointer listeners for resize (avoids losing capture on fast moves)
  useEffect(() => {
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerUp);
    return () => {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerup", onWindowPointerUp);
    };
  }, [onWindowPointerMove, onWindowPointerUp]);

  // ── Form logic ────────────────────────────────────────────────────────────
  const addResource    = () => setResources([...resources, { label: "", url: "" }]);
  const updateResource = (idx: number, key: "label" | "url", val: string) => {
    const updated = [...resources];
    updated[idx][key] = val;
    setResources(updated);
  };
  const removeResource = (idx: number) => setResources(resources.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return setError("Title and content required");

    setLoading(true);
    setError("");

    const payload = {
      ...formData,
      type: formData.type.split(",").map(t => t.trim()).filter(Boolean),
      resources: resources.filter(r => r.label && r.url),
    };

    try {
      const { ok, data } = await apiFetch(API_ROUTES.saveBlog, {
        password: sessionStorage.getItem("sitePassword") || "",
        blogData: payload,
      });

      if (!ok) throw new Error((data as any).error || "Failed to commit");

      onSuccess({
        id: Date.now(),
        ...payload,
        date: new Date().toISOString(),
        slug: payload.title.replace(/\s+/g, "-").toLowerCase(),
      } as any);

      setFormData({ title: "", content: "", category: "Notes", type: "", featured: false, draft: true });
      setResources([]);
    } catch (err: any) {
      setError(err.message || "Failed to commit");
    }
    setLoading(false);
  };

  // ── Resize handle component ───────────────────────────────────────────────
  const Handle = ({ edge, cursor, className }: { edge: string; cursor: string; className: string }) => (
    <div
      className={`absolute z-20 select-none ${className}`}
      style={{ cursor }}
      onPointerDown={e => startResize(e, edge)}
    />
  );

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: DEFAULT_W,
        height: DEFAULT_H,
        zIndex: 60,
        willChange: "transform",
      }}
      className="glass-card rounded-2xl shadow-2xl border border-primary/20 flex flex-col overflow-hidden"
    >
      {/* ── Resize Handles (only when not minimized) ────────────────────── */}
      {!isMinimized && (
        <>
          <Handle edge="n"  cursor="n-resize"  className="top-0 left-3 right-3 h-1.5" />
          <Handle edge="s"  cursor="s-resize"  className="bottom-0 left-3 right-3 h-1.5" />
          <Handle edge="e"  cursor="e-resize"  className="right-0 top-3 bottom-3 w-1.5" />
          <Handle edge="w"  cursor="w-resize"  className="left-0 top-3 bottom-3 w-1.5" />
          <Handle edge="se" cursor="se-resize" className="bottom-0 right-0 w-4 h-4" />
          <Handle edge="sw" cursor="sw-resize" className="bottom-0 left-0 w-4 h-4" />
          <Handle edge="ne" cursor="ne-resize" className="top-0 right-0 w-4 h-4" />
          <Handle edge="nw" cursor="nw-resize" className="top-0 left-0 w-4 h-4" />
        </>
      )}

      {/* ── Drag Header ─────────────────────────────────────────────────── */}
      <div
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-primary/5 cursor-grab active:cursor-grabbing rounded-t-2xl shrink-0"
      >
        <h3 className="text-sm font-heading font-bold flex items-center gap-2 pointer-events-none select-none">
          <Save size={15} className="text-primary" /> Admin Matrix
        </h3>
        <div className="flex items-center gap-1">
          <GripHorizontal size={13} className="text-muted-foreground/40 pointer-events-none" />
          <button
            data-no-drag
            onClick={() => setIsMinimized(m => !m)}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground transition-colors ml-1"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Scrollable Form Body ─────────────────────────────────────────── */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                required
              />
            </div>

            {/* Category + Tags */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50"
                >
                  <option>Notes</option>
                  <option>Thoughts</option>
                  <option>Books</option>
                  <option>Links</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Tags (CSV)</label>
                <input
                  type="text"
                  placeholder="React, AI, Deep..."
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Content (MD)</label>
              <textarea
                rows={6}
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-background border border-border/50 rounded-lg p-2 text-sm focus:outline-none focus:border-primary/50 font-mono resize-none leading-relaxed"
                required
              />
            </div>

            {/* Resources */}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</label>
                <button type="button" onClick={addResource} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add Link
                </button>
              </div>
              {resources.map((res, i) => (
                <div key={i} className="flex gap-2 mb-2 items-center bg-muted/20 p-2 rounded-lg border border-border/30">
                  <LinkIcon size={14} className="text-muted-foreground shrink-0" />
                  <input
                    placeholder="Label"
                    value={res.label}
                    onChange={e => updateResource(i, "label", e.target.value)}
                    className="w-[38%] bg-transparent border-none text-xs focus:outline-none"
                  />
                  <input
                    placeholder="https://"
                    value={res.url}
                    onChange={e => updateResource(i, "url", e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none"
                  />
                  <button type="button" onClick={() => removeResource(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <div className="flex items-center gap-3 text-sm font-medium">

                {/* Featured with tooltip */}
                <Tooltip text="⭐ Featured posts appear with a gold star badge and can be filtered via the '★ Featured' button in the blog filter bar. Use this for your best or most important posts.">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="accent-primary"
                    />
                    <Star size={13} className={formData.featured ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"} />
                    Featured
                  </label>
                </Tooltip>

                {/* Draft with tooltip */}
                <Tooltip text="🔒 Draft posts are hidden from public visitors. Only you (as admin) can see them. Uncheck to publish the post live.">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.draft}
                      onChange={e => setFormData({ ...formData, draft: e.target.checked })}
                      className="accent-primary"
                    />
                    <EyeOff size={13} className={formData.draft ? "text-amber-400" : "text-muted-foreground"} />
                    Draft
                  </label>
                </Tooltip>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Commit Push
              </button>
            </div>

            {error && (
              <p className="text-xs text-center text-destructive bg-destructive/10 py-1.5 rounded-md border border-destructive/20">
                {error}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
