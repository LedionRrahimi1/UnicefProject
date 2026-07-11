import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, ArrowRight, TrendingUp, Star, ChevronRight, Sparkles } from "lucide-react";
import { useApp } from "./store";
import { assignmentService, gamificationService, materialService } from "./services";
import type { Assignment, Material, StudentLevel } from "./types";
import { useT } from "./useT";

export default function StudentDashboard() {
  const { user } = useApp();
  const { t } = useT();
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
        <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="rounded-3xl p-6 sm:p-7 text-white relative overflow-hidden bg-gradient-to-br from-primary via-[#6B63F0] to-[#8B7CF7] shadow-[var(--shadow-md)]">
        <div className="absolute -top-6 -right-6 opacity-[0.12] pointer-events-none">
          <Sparkles size={140} />
        </div>
        <p className="text-white/80 text-sm font-semibold mb-1">{t("sd.welcome")}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight relative">
          {t("sd.hello", { name: user?.name?.split(" ")[0] ?? "" })}
        </h1>
        <p className="text-white/85 mt-2 text-sm sm:text-base relative max-w-md">
          {t("sd.tagline")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5 relative">
          <span className="ui-chip bg-white/20 text-white backdrop-blur-sm">
            <Star size={12} fill="currentColor" /> {t("sd.completedCount", { n: completed.length })}
          </span>
          <span className="ui-chip bg-white/20 text-white backdrop-blur-sm">
            <BookOpen size={12} /> {t("sd.activeCount", { n: pending.length })}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {pending.length > 0 ? (
            <section>
              <h2 className="ui-section-title mb-3">{t("sd.yourTasks")}</h2>
              <div className="space-y-3">
                {pending.map(asgn => {
                  const mat = getMaterial(asgn.materialId);
                  if (!mat) return null;
                  return (
                    <div key={asgn.id} className="ui-card-hover p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground text-base leading-snug">{mat.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{mat.subject} · {t("sd.due", { date: asgn.deadline })}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <BookOpen size={22} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                          <span className="inline-flex items-center gap-1.5"><Clock size={14} /> ~{mat.estimatedMinutes} min</span>
                          {asgn.status === "in-progress" && (
                            <span className="ui-chip bg-primary/10 text-primary">{t("status.inProgress")}</span>
                          )}
                        </div>
                        <Link to={`/student/read/${asgn.materialId}`} className="ui-btn-primary text-sm min-h-11 px-5">
                          {asgn.status === "in-progress" ? t("sd.continue") : t("sd.start")} <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="ui-card p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-muted-foreground" />
              </div>
              <p className="font-bold text-lg">{t("sd.noTasks")}</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                {t("sd.noTasksHint")}
              </p>
            </div>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="ui-section-title mb-3">{t("sd.completed")}</h2>
              <div className="space-y-2.5">
                {completed.map(asgn => {
                  const mat = getMaterial(asgn.materialId);
                  if (!mat) return null;
                  return (
                    <div key={asgn.id} className="ui-card p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
                      <div className="w-10 h-10 rounded-full bg-success-muted flex items-center justify-center shrink-0">
                        <Star size={16} className="text-success" fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{mat.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{asgn.completedAt}</p>
                      </div>
                      <span className="font-extrabold text-success text-sm">{asgn.score}%</span>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link to={`/student/practice/${asgn.materialId}`} className="ui-btn-secondary text-xs min-h-10 flex-1 sm:flex-none px-3">
                          {t("sd.flashcards")}
                        </Link>
                        <Link to={`/student/results/${asgn.id}`} className="ui-btn-ghost text-xs text-primary min-h-10 flex-1 sm:flex-none">
                          {t("sd.results")}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          {level && (
            <div className="ui-card p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-sm shadow-primary/30">
                  {level.level}
                </div>
                <div>
                  <p className="font-extrabold text-foreground text-lg">{t("sd.level", { n: level.level })}</p>
                  <p className="text-sm text-muted-foreground inline-flex items-center gap-1 font-medium">
                    <Star size={12} className="text-primary" fill="currentColor" /> {level.totalXP} {t("common.stars")}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-2 font-semibold">
                  <span>{level.currentLevelXP} {t("common.stars")}</span>
                  <span>{level.nextLevelXP} {t("common.stars")}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-[#8B7CF7] rounded-full transition-all duration-500"
                    style={{ width: `${level.progressPercentage}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
                  {t("sd.starsToNext", { n: level.nextLevelXP - level.totalXP, next: level.level + 1 })}
                </p>
              </div>

              {recentRewards?.weeklyXP > 0 && (
                <div className="flex items-center gap-2 text-sm font-semibold text-success-muted-foreground bg-success-muted rounded-2xl p-3 mb-3">
                  <TrendingUp size={15} /> {t("sd.starsThisWeek", { n: recentRewards.weeklyXP })}
                </div>
              )}

              <Link to="/student/rewards" className="ui-btn-secondary w-full text-sm text-primary border-primary/25">
                {t("sd.viewRewards")} <ChevronRight size={14} />
              </Link>
            </div>
          )}

          <div className="rounded-2xl p-5 bg-secondary border border-primary/10">
            <Sparkles size={18} className="text-primary mb-2" />
            <p className="text-sm font-bold text-secondary-foreground">{t("sd.progressMsg")}</p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Çdo material që lexon të sjell diçka të re. Vazhdo kështu!
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
