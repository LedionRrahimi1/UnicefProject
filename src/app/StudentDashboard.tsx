import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Clock, ArrowRight, TrendingUp, Star, ChevronRight, Sparkles, Award } from "lucide-react";
import { useApp } from "./store";
import { assignmentService, authService, gamificationService, materialService, studentService } from "./services";
import { ALL_BADGES } from "./mockData";
import type { Assignment, Material, StudentLevel, StudentBadge, XPTransaction } from "./types";
import { useT } from "./useT";
import { toast } from "sonner";
import { isSupabaseEnabled } from "./supabase";

type RecentRewards = {
  recentXP: XPTransaction[];
  recentBadges: StudentBadge[];
  weeklyXP: number;
};

export default function StudentDashboard() {
  const { user, login } = useApp();
  const { t } = useT();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materialsById, setMaterialsById] = useState<Record<string, Material>>({});
  const [level, setLevel] = useState<StudentLevel | null>(null);
  const [recentRewards, setRecentRewards] = useState<RecentRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsClass, setNeedsClass] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const loadDashboard = async (uid: string) => {
    if (isSupabaseEnabled()) {
      const roster = await studentService.getById(uid);
      if (!roster) {
        setNeedsClass(true);
        setLoading(false);
        return;
      }
      setNeedsClass(false);
    }
    const [asgns, lvl, rewards, materials] = await Promise.all([
      assignmentService.getForStudent(uid),
      gamificationService.getStudentLevel(uid),
      gamificationService.getRecentRewards(uid),
      materialService.getAll(),
    ]);
    const map: Record<string, Material> = {};
    materials.forEach(m => { map[m.id] = m; });
    setAssignments(asgns);
    setMaterialsById(map);
    setLevel(lvl);
    setRecentRewards(rewards);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    loadDashboard(user.id)
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setJoining(true);
    setJoinError("");
    try {
      const updated = await authService.joinClass(user.id, joinCode);
      login(updated);
      toast.success(t("sd.joinedClass", { class: updated.class ?? "" }));
      setLoading(true);
      await loadDashboard(user.id);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : t("sd.joinFailed"));
    } finally {
      setJoining(false);
    }
  };

  const pending = assignments.filter(a => a.status === "pending" || a.status === "in-progress");
  const completed = assignments.filter(a => a.status === "completed");
  const getMaterial = (id: string) => materialsById[id];
  const badgeName = (badgeId: string) => ALL_BADGES.find(b => b.id === badgeId)?.name ?? badgeId;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-9 h-9 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (needsClass) {
    return (
      <div className="max-w-md mx-auto w-full space-y-5 py-8">
        <div className="ui-card p-6 sm:p-8">
          <h1 className="text-xl font-extrabold tracking-tight mb-2">{t("sd.joinTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-6">{t("sd.joinHint")}</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label htmlFor="class-code" className="block mb-2">{t("login.joinCode")}</label>
              <input
                id="class-code"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder="E9TMCT"
                required
                maxLength={8}
                className="ui-input tracking-widest font-bold uppercase"
              />
            </div>
            {joinError && (
              <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl p-3.5 font-medium">
                {joinError}
              </div>
            )}
            <button type="submit" disabled={joining} className="ui-btn-primary w-full">
              {joining ? t("common.loading") : t("sd.joinBtn")}
            </button>
          </form>
        </div>
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
          {user?.class ? `${t("common.class")} ${user.class}` : t("sd.tagline")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5 relative">
          <span className="ui-chip bg-white/20 text-white backdrop-blur-sm">
            <Star size={12} fill="currentColor" /> {level?.totalXP ?? 0} {t("common.stars")}
          </span>
          <span className="ui-chip bg-white/20 text-white backdrop-blur-sm">
            <BookOpen size={12} /> {t("sd.completedCount", { n: completed.length })}
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
                {pending.map(a => {
                  const mat = getMaterial(a.materialId);
                  return (
                    <Link
                      key={a.id}
                      to={`/student/read/${a.materialId}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">{mat?.title ?? "Material"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock size={12} /> {a.deadline ?? "—"}
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-muted-foreground shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="ui-card p-8 text-center">
              <p className="font-semibold mb-1">{t("sd.noTasks")}</p>
              <p className="text-sm text-muted-foreground">{t("sd.waitTeacher")}</p>
            </div>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="ui-section-title mb-3">{t("sd.completed")}</h2>
              <div className="space-y-2">
                {completed.slice(0, 5).map(a => {
                  const mat = getMaterial(a.materialId);
                  return (
                    <Link
                      key={a.id}
                      to={`/student/results/${a.id}`}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border hover:bg-muted/40 transition-colors"
                    >
                      <span className="text-sm font-medium truncate">{mat?.title ?? "—"}</span>
                      <span className="text-sm font-bold text-primary shrink-0">{a.score}%</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-5">
          <div className="ui-card p-5">
            <h2 className="ui-section-title mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> {t("sr.currentLevel")}
            </h2>
            <p className="text-3xl font-extrabold text-primary">{t("sd.level", { n: level?.level ?? 1 })}</p>
            <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
              <Star size={14} className="text-warning" fill="currentColor" />
              {level?.totalXP ?? 0} {t("common.stars")}
            </p>
            {(level?.progressPercentage ?? 0) > 0 && (
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${level?.progressPercentage ?? 0}%` }} />
              </div>
            )}
            <Link to="/student/rewards" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              {t("sd.viewRewards")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="ui-card p-5">
            <h2 className="ui-section-title mb-3">{t("sd.recentRewards")}</h2>
            {!recentRewards || (recentRewards.recentXP.length === 0 && recentRewards.recentBadges.length === 0) ? (
              <p className="text-sm text-muted-foreground">{t("sd.noRewardsYet")}</p>
            ) : (
              <div className="space-y-3">
                {recentRewards.recentBadges.map(b => (
                  <div key={b.id} className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Award size={14} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{badgeName(b.badgeId)}</p>
                      {b.teacherMessage && (
                        <p className="text-xs text-muted-foreground mt-0.5">{b.teacherMessage}</p>
                      )}
                    </div>
                  </div>
                ))}
                {recentRewards.recentXP.slice(0, 4).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground truncate">{tx.reason}</span>
                    <span className="font-bold text-primary shrink-0 inline-flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> +{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
