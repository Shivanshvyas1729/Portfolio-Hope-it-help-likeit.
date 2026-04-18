import React, { useState } from 'react';
import { Project } from '@/data/portfolioData';
import { Plus, Edit3, Trash2, X, Github, ExternalLink, Star } from 'lucide-react';
import { DynamicForm } from './DynamicForm';
import { ProjectSchema } from '@/lib/schema';
import { useCMSState } from '@/context/CMSContext';

interface ProjectsAdminProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onSave: () => void;
  isLoading: boolean;
  mode: "local" | "github" | "unknown";
}

export const ProjectsAdmin: React.FC<ProjectsAdminProps> = ({ projects, onChange, onSave, isLoading, mode }) => {
  const { liveData } = useCMSState();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [tempProject, setTempProject] = useState<Partial<Project>>({});

  const hasPendingChanges = JSON.stringify(projects) !== JSON.stringify(liveData.projects);

  const handleEdit = (project: Project) => {
    setTempProject({ ...project });
    setEditingId(project.id);
  };

  const handleAddNew = () => {
    // Determine highest ID
    const highestId = projects.reduce((max, p) => (p.id || 0) > max ? p.id : max, 0);
    setTempProject({
      id: highestId + 1,
      title: "",
      category: [],
      description: "",
      tech: [],
      github: "",
      live: "",
      featured: false
    });
    setAddingNew(true);
  };

  const saveEdit = () => {
    if (!tempProject.title || !tempProject.description) {
      alert("Title and Description are required.");
      return;
    }

    if (addingNew) {
      onChange([tempProject as Project, ...projects]);
    } else {
      onChange(projects.map(p => p.id === tempProject.id ? tempProject as Project : p));
    }
    closeModal();
  };

  const deleteProject = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      onChange(projects.filter(p => p.id !== id));
    }
  };

  const closeModal = () => {
    setEditingId(null);
    setAddingNew(false);
    setTempProject({});
  };

  const isModalOpen = editingId !== null || addingNew;

  return (
    <div className="flex flex-col h-full bg-background relative">
      <div className="flex items-center justify-between mb-4 px-4 pt-4 shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-foreground font-heading">Manage Projects</h3>
          {hasPendingChanges && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
              Pending Changes
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddNew}
            className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={14} /> New Project
          </button>
          <button
            onClick={onSave}
            disabled={isLoading || !hasPendingChanges}
            className="px-4 py-1.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? "Saving..." : (mode === 'local' ? "Save to Local" : "Save to GitHub")}
          </button>
        </div>
      </div>

      {/* Grid of Projects */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map(p => (
            <div key={p.id} className="group glass-card border border-border/50 rounded-xl p-4 flex flex-col hover:border-primary/40 transition-colors relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(p)} className="p-1.5 bg-muted hover:bg-primary/10 hover:text-primary rounded text-muted-foreground transition-colors">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteProject(p.id)} className="p-1.5 bg-muted hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="flex items-start gap-2 mb-2 pr-16">
                {p.featured && <Star size={14} className="text-yellow-500 fill-yellow-500 mt-1 shrink-0" />}
                <h4 className="font-bold text-foreground leading-tight">{p.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{p.description}</p>
              
              <div className="mt-auto flex items-center gap-3">
                <div className="flex gap-1 flex-wrap flex-1">
                  {p.tech?.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">{t}</span>
                  ))}
                  {p.tech && p.tech.length > 3 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/50">+{p.tech.length - 3}</span>}
                </div>
                <div className="flex gap-2 shrink-0">
                  {p.github && <Github size={14} className="text-muted-foreground" />}
                  {p.live && <ExternalLink size={14} className="text-muted-foreground" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="glass-card shadow-2xl border-l border-border/50 flex flex-col h-full absolute right-0 w-full sm:w-[500px]">
             <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
               <h3 className="font-bold">{addingNew ? "New Project" : "Edit Project"}</h3>
               <button onClick={closeModal} className="p-1.5 rounded hover:bg-muted/60 text-muted-foreground transition-colors">
                 <X size={16} />
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-5">
                <DynamicForm 
                  schema={ProjectSchema} 
                  data={tempProject} 
                  onChange={setTempProject} 
                />
             </div>

             <div className="p-4 border-t border-border/50 bg-muted/10 flex justify-end gap-2">
               <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors">
                 Cancel
               </button>
               <button onClick={saveEdit} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors">
                 Apply to Preview
               </button>
               {mode === 'local' ? (
                 <button 
                   onClick={async () => {
                     saveEdit();
                     setTimeout(() => onSave(), 0);
                   }} 
                   className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg"
                 >
                   Apply & Save to Local
                 </button>
               ) : (
                 <button onClick={saveEdit} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-lg">
                   Apply Changes
                 </button>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
