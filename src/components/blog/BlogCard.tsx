import { useState } from "react";
import { Calendar, Clock, Lock, Trash2, Loader2 } from "lucide-react";
import { BlogPost } from "@/pages/Blog";
import { apiFetch, API_ROUTES } from "@/lib/apiClient";

interface BlogCardProps {
  post: BlogPost;
  onClick: () => void;
  isAdmin: boolean;
  onDelete?: (post: BlogPost) => void;
}

export function BlogCard({ post, onClick, isAdmin, onDelete }: BlogCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open modal
    setConfirmDelete(true);
    setDeleteError("");
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
    setDeleteError("");
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    setDeleteError("");

    try {
      const { ok, data } = await apiFetch(API_ROUTES.deleteBlog, {
        password: sessionStorage.getItem("sitePassword") || "",
        postId:   post.id,
        postSlug: post.slug,
      });

      if (!ok) throw new Error((data as any).error || "Deletion failed");

      onDelete?.(post);
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <article
      onClick={!confirmDelete ? onClick : undefined}
      className={`glass-card p-6 md:p-8 rounded-2xl hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 relative
        ${post.draft ? "border-dashed border-destructive/50 opacity-80" : ""}
        ${confirmDelete ? "border-destructive/60 cursor-default" : "cursor-pointer"}
      `}
    >
      {/* ── Delete Confirmation Overlay ──────────────────────── */}
      {confirmDelete && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute inset-0 rounded-2xl bg-background/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 p-6 border border-destructive/30"
        >
          <Trash2 size={28} className="text-destructive" />
          <p className="text-sm font-semibold text-center text-foreground">
            Delete <span className="text-destructive">"{post.title}"</span>?
          </p>
          <p className="text-xs text-muted-foreground text-center">
            This will commit a deletion to GitHub. It cannot be undone easily.
          </p>
          {deleteError && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-md border border-destructive/20 text-center">
              {deleteError}
            </p>
          )}
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center gap-1.5 disabled:opacity-60"
            >
              {deleting
                ? <><Loader2 size={12} className="animate-spin" /> Deleting…</>
                : <><Trash2 size={12} /> Confirm Delete</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Card Header ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
            {post.category}
          </span>

          {post.featured && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
              Featured
            </span>
          )}

          {post.draft && isAdmin && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1">
              <Lock size={12} /> Draft
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground whitespace-nowrap">
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date).toLocaleDateString()}</span>
            {(post as any).readingTime && (
              <span className="flex items-center gap-1"><Clock size={12} /> {(post as any).readingTime} min read</span>
            )}
          </div>

          {/* Admin-only delete trigger */}
          {isAdmin && !confirmDelete && (
            <button
              onClick={handleDeleteClick}
              title="Delete post"
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <h2 className="text-xl md:text-2xl font-bold font-heading mb-3 text-foreground line-clamp-2">
        {post.title}
      </h2>

      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-5">
        {post.content.split("\n")[0].substring(0, 150)}...
      </p>

      {/* Tag Chips */}
      {post.type && post.type.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-border/30">
          {post.type.map((tag, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50 uppercase tracking-widest">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
