import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, BookOpen, Eye, Copy, Trash2, Users } from "lucide-react";
import { materialService } from "./services";
import type { Material } from "./types";
import { toast } from "sonner";
import { useT } from "./useT";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning-muted text-warning-muted-foreground",
  approved: "bg-secondary text-secondary-foreground",
  published: "bg-success-muted text-success-muted-foreground",
};

export default function TeacherMaterials() {
  const { t } = useT();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const statusLabels: Record<string, string> = {
    draft: t("status.draft"),
    review: t("status.review"),
    approved: t("status.approved"),
    published: t("status.published"),
  };

  useEffect(() => {
    materialService.getAll().then(m => { setMaterials(m); setLoading(false); });
  }, []);

  const filtered = materials.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    await materialService.delete(id);
    setMaterials(prev => prev.filter(m => m.id !== id));
    toast.success(t("tm.deleted"));
  };

  const filterOptions = [
    { val: "all", label: t("common.all") },
    { val: "draft", label: t("status.draft") },
    { val: "review", label: t("status.review") },
    { val: "approved", label: t("status.approved") },
    { val: "published", label: t("status.published") },
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("tm.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("tm.subtitle")}</p>
        </div>
        <Link to="/teacher/materials/new"
          className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25">
          <Plus size={16} /> {t("tm.create")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-1.5 flex-1 min-w-48">
          <Search size={15} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("tm.search")}
            className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-full" aria-label={t("tm.search")} />
        </div>
        <div className="flex gap-1.5 bg-card border border-border rounded-xl p-1">
          {filterOptions.map(opt => (
            <button key={opt.val} onClick={() => setFilter(opt.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === opt.val ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-3 bg-muted rounded w-1/2 mb-5" />
              <div className="h-2 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <BookOpen size={36} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground mb-1">{t("tm.empty")}</p>
          <p className="text-sm text-muted-foreground mb-4">{t("tm.emptyHint")}</p>
          <Link to="/teacher/materials/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} /> {t("tm.create")}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <div key={m.id} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-3">
                  <h3 className="font-semibold text-foreground truncate">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.subject} · {t("common.class")} {m.class}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusColors[m.status]}`}>
                  {statusLabels[m.status]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Users size={12} /> {m.studentCount}</span>
                <span>{m.createdAt}</span>
                <span>~{m.estimatedMinutes}min</span>
              </div>

              {m.completionRate > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{t("tm.completion")}</span>
                    <span>{m.completionRate}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${m.completionRate}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1.5 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/teacher/materials/${m.id}/review`}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Eye size={12} /> {t("common.view")}
                </Link>
                <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Copy size={12} /> {t("common.copy")}
                </button>
                <button onClick={() => handleDelete(m.id)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors ml-auto">
                  <Trash2 size={12} /> {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
