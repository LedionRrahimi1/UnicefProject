import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, ArrowRight, TrendingUp, Star, ChevronRight, Sparkles } from "lucide-react";
import { useApp } from "./store";
import { assignmentService, gamificationService, materialService } from "./services";
import type { Assignment, Material, StudentLevel } from "./types";

export default function StudentDashboard() {
  const { user } = useApp();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materialsById, setMaterialsById] = useState<Record<string, Material>>({});
  const [level, setLevel] = useState<StudentLevel | null>(null);
  const [recentRewards, setRecentRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const [asgns, lvl, rewards, materials] = await Promise.all([
        assignmentService.getForStudent(user.id),
        gamificationService.getStudentLevel(user.id),
        gamificationService.getRecentRewards(user.id),
        materialService.getAll(),
      ]);
      if (cancelled) return;
      const map: Record<string, Material> = {};
      materials.forEach(m => { map[m.id] = m; });
      setAssignments(asgns);
      setMaterialsById(map);
      setLevel(lvl);
      setRecentRewards(rewards);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const pending = assignments.filter(a => a.status === "pending" || a.status === "in-progress");
  const completed = assignments.filter(a => a.status === "completed");
  const getMaterial = (id: string) => materialsById[id];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gradient-to-r from-primary to-[#8B7CF7] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <Sparkles size={128} />
        </div>
        <h1 className="text-2xl font-bold">Përshëndetje, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-white/80 mt-1 text-sm">Vazhdo kështu! Sot ke material të ri për të lexuar.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold">{completed.length}</span> detyra të kryera
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-sm">
            <span className="font-bold">{pending.length}</span> detyra aktive
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {pending.length > 0 ? (
            <div>
              <h2 className="font-semibold mb-3">Detyrat e reja</h2>
              <div className="space-y-3">
                {pending.map(asgn => {
                  const mat = getMaterial(asgn.materialId);
                  if (!mat) return null;
                  return (
                    <div key={asgn.id} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-foreground">{mat.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{mat.subject} · Afati: {asgn.deadline}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen size={18} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} /> ~{mat.estimatedMinutes} min
                        </div>
                        {asgn.status === "in-progress" && (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full w-1/3" />
                            </div>
                            <span className="text-xs text-muted-foreground">Në progres</span>
                          </div>
                        )}
                        <Link to={`/student/read/${asgn.materialId}`}
                          className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                          {asgn.status === "in-progress" ? "Vazhdo" : "Fillo"} <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <BookOpen size={28} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">Nuk ke detyra të reja</p>
              <p className="text-sm text-muted-foreground mt-1">Kur mësuesja publikon një material, do të shfaqet këtu.</p>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 className="font-semibold mb-3">Të përfunduara</h2>
              <div className="space-y-2">
                {completed.map(asgn => {
                  const mat = getMaterial(asgn.materialId);
                  if (!mat) return null;
                  return (
                    <div key={asgn.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-success-muted flex items-center justify-center">
                        <Star size={14} className="text-success" fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{mat.title}</p>
                        <p className="text-xs text-muted-foreground">{asgn.completedAt}</p>
                      </div>
                      <span className="font-bold text-success text-sm">{asgn.score}%</span>
                      <Link to={`/student/results/${asgn.id}`} className="text-xs text-primary hover:underline">
                        Rezultatet
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {level && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-lg">
                  {level.level}
                </div>
                <div>
                  <p className="font-bold text-foreground">Niveli {level.level}</p>
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Star size={11} className="text-primary" fill="currentColor" /> {level.totalXP} Yje totale
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="inline-flex items-center gap-1"><Star size={10} className="text-primary" fill="currentColor" /> {level.currentLevelXP} Yje</span>
                  <span className="inline-flex items-center gap-1"><Star size={10} className="text-primary" fill="currentColor" /> {level.nextLevelXP} Yje</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-[#8B7CF7] rounded-full transition-all"
                    style={{ width: `${level.progressPercentage}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  {level.nextLevelXP - level.totalXP} Yje deri në Nivelin {level.level + 1}
                </p>
              </div>

              {recentRewards?.weeklyXP > 0 && (
                <div className="flex items-center gap-2 text-xs text-success-muted-foreground bg-success-muted rounded-xl p-2.5">
                  <TrendingUp size={13} /> +{recentRewards.weeklyXP} Yje këtë javë
                </div>
              )}

              <Link to="/student/rewards"
                className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-primary/30 text-primary text-xs font-medium hover:bg-primary/10 transition-colors">
                Shiko shpërblimet <ChevronRight size={12} />
              </Link>
            </div>
          )}

          <div className="bg-secondary border border-primary/15 rounded-2xl p-4">
            <Sparkles size={16} className="text-primary mb-2" />
            <p className="text-sm font-semibold text-secondary-foreground">Ke bërë përparim!</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Çdo material që lexon të sjell njohurie të reja. Vazhdo kështu!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
