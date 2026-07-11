import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { Star, BookOpen, Library, Headphones, TrendingUp, Award, Lock, RefreshCw, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { gamificationService } from "./services";
import { ALL_BADGES } from "./mockData";
import type { StudentLevel, StudentBadge, BadgeProgress, Badge } from "./types";
import { useApp } from "./store";
import { useT } from "./useT";

const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-secondary text-secondary-foreground",
  rare: "bg-accent text-accent-foreground",
  special: "bg-warning-muted text-warning-muted-foreground",
  teacher: "bg-primary/10 text-primary",
};
const rarityLabels: Record<string, string> = {
  common: "I zakonshëm", uncommon: "Jo i zakonshëm",
  rare: "I rrallë", special: "I veçantë", teacher: "Shpërblim nga mësuesja",
};
const categoryIcons: Record<string, React.ElementType> = {
  reading: BookOpen, vocabulary: Library, audio: Headphones,
  progress: TrendingUp, quiz: Star, level: Award, teacher: Sparkles, comprehension: BookOpen, special: Star,
};

export default function StudentRewards() {
  const { user } = useApp();
  const { t, lang } = useT();
  const [level, setLevel] = useState<StudentLevel | null>(null);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [progress, setProgress] = useState<BadgeProgress[]>([]);
  const [xpHistory, setXpHistory] = useState<any[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<{ badge: Badge; earned: StudentBadge | null } | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!user) return;
    Promise.all([
      gamificationService.getStudentLevel(user.id),
      gamificationService.getStudentBadges(user.id),
      gamificationService.getBadgeProgress(user.id),
      gamificationService.getXPHistory(user.id),
    ]).then(([lvl, badges, prog, history]) => {
      setLevel(lvl);
      setStudentBadges(badges);
      setProgress(prog);
      setXpHistory(history.slice(0, 10));
    });
  }, [user]);

  const earnedIds = new Set(studentBadges.map(b => b.badgeId));
  const earnedBadges = ALL_BADGES.filter(b => earnedIds.has(b.id));
  const inProgressBadges = ALL_BADGES.filter(b => !earnedIds.has(b.id) && b.isAutomatic);
  const teacherBadges = studentBadges.filter(b => b.awardedBy === "teacher");

  const filterBadges = (badges: Badge[]) => {
    if (filter === "all") return badges;
    return badges.filter(b => b.category === filter || b.rarity === filter);
  };

  const BadgeIcon = ({ badge }: { badge: Badge }) => {
    const Icon = categoryIcons[badge.category] ?? Star;
    return <Icon size={24} />;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">{t("sr.title")}</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{t("sr.subtitle")}</p>
      </div>

      {/* Level card */}
      {level && (
        <div className="bg-gradient-to-r from-primary to-[#8B7CF7] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
          <div className="absolute right-4 top-4 opacity-10">
            <Sparkles size={80} />
          </div>
          <div className="flex items-center gap-5 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {level.level}
            </div>
            <div>
              <p className="text-sm text-white/80">{t("sr.currentLevel")}</p>
              <p className="text-2xl font-bold">{t("sd.level", { n: level.level })}</p>
              <p className="text-sm text-white/80 inline-flex items-center gap-1.5">
                <Star size={14} fill="currentColor" /> {t("sr.totalStars", { n: level.totalXP })}
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-2">
              <span className="inline-flex items-center gap-1"><Star size={10} fill="currentColor" /> {level.currentLevelXP} {t("common.stars")}</span>
              <span className="inline-flex items-center gap-1"><Star size={10} fill="currentColor" /> {level.nextLevelXP} {t("common.stars")} ({t("sd.level", { n: level.level + 1 })})</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${level.progressPercentage}%` }} />
            </div>
            <p className="text-xs text-white/70 mt-2 text-center">
              {t("sr.needMore", { n: level.nextLevelXP - level.totalXP, next: level.level + 1 })}
            </p>
          </div>
          <p className="mt-3 text-xs text-white/60 text-center italic">
            Çdo material që përfundon të sjell më afër nivelit tjetër.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: t("common.all") },
          { id: "reading", label: t("sr.reading") },
          { id: "comprehension", label: t("sr.comprehension") },
          { id: "vocabulary", label: t("sr.vocabulary") },
          { id: "level", label: t("sr.levels") },
          { id: "teacher", label: t("sr.teacher") },
        ].map(opt => (
          <button key={opt.id} onClick={() => setFilter(opt.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${filter === opt.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Earned badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">{t("sr.myTitles")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filterBadges(earnedBadges).map(badge => {
              const earned = studentBadges.find(b => b.badgeId === badge.id);
              const isTeacher = earned?.awardedBy === "teacher";
              return (
                <button key={badge.id} onClick={() => setSelectedBadge({ badge, earned: earned ?? null })}
                  className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/30 hover:shadow-md transition-all group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isTeacher ? "bg-primary/15" : "bg-primary/10"}`}>
                    <span className="text-primary">
                      <BadgeIcon badge={badge} />
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mb-2 leading-snug">{badge.description}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rarityColors[badge.rarity]}`}>
                      {rarityLabels[badge.rarity]}
                    </span>
                    {isTeacher && <span className="text-xs text-primary font-medium">{t("sr.fromTeacher")}</span>}
                  </div>
                  {earned?.earnedAt && (
                    <p className="text-xs text-muted-foreground mt-1.5">{t("sr.earned")}: {earned.earnedAt}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* In progress */}
      {inProgressBadges.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">{t("sr.inProgress")}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {inProgressBadges.slice(0, 4).map(badge => {
              const prog = progress.find(p => p.badgeId === badge.id);
              return (
                <div key={badge.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <Lock size={18} className="text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-muted-foreground">{badge.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                    {prog && (
                      <>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${prog.progressPercentage}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground">{prog.currentValue} nga {prog.targetValue}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Star History */}
      {xpHistory.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">{t("sr.starHistory")}</h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden shadow-sm">
            {xpHistory.map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star size={14} className="text-primary" fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{tx.reason}</p>
                  <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString(lang === "en" ? "en-US" : "sq-AL")}</p>
                </div>
                <span className="font-bold text-primary text-sm shrink-0 inline-flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> +{tx.amount} {t("common.stars")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      <Dialog.Root open={!!selectedBadge} onOpenChange={open => !open && setSelectedBadge(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6 z-50">
            {selectedBadge && (
              <>
                <Dialog.Title className="sr-only">{selectedBadge.badge.name}</Dialog.Title>
                <div className="text-center mb-5">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary"><BadgeIcon badge={selectedBadge.badge} /></span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{selectedBadge.badge.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{selectedBadge.badge.description}</p>
                </div>

                <div className="space-y-2 text-sm mb-5">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Kategoria</span>
                    <span className="font-medium">{selectedBadge.badge.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Rrallësia</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${rarityColors[selectedBadge.badge.rarity]}`}>
                      {rarityLabels[selectedBadge.badge.rarity]}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Shpërblim Yje</span>
                    <span className="font-bold text-primary inline-flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> +{selectedBadge.badge.xpReward} Yje
                    </span>
                  </div>
                  {selectedBadge.earned?.earnedAt && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("sr.earned")}</span>
                      <span className="font-medium">{selectedBadge.earned.earnedAt}</span>
                    </div>
                  )}
                  {selectedBadge.earned?.teacherMessage && (
                    <div className="py-2 border-b border-border">
                      <p className="text-muted-foreground mb-1">Mesazh nga mësuesja:</p>
                      <p className="italic text-foreground">"{selectedBadge.earned.teacherMessage}"</p>
                    </div>
                  )}
                </div>

                <Dialog.Close asChild>
                  <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors" aria-label={t("common.close")}>
                    {t("common.close")}
                  </button>
                </Dialog.Close>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
