import React, { useState, useEffect } from "react";
import { Award, Plus, Star, TrendingUp, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { gamificationService, studentService } from "./services";
import { ALL_BADGES } from "./mockData";
import type { Student, StudentLevel } from "./types";
import { toast } from "sonner";
import { useT } from "./useT";
import { useApp } from "./store";

export default function TeacherRewards() {
  const { t } = useT();
  const { user } = useApp();
  const [students, setStudents] = useState<Student[]>([]);
  const [levels, setLevels] = useState<(StudentLevel & { studentId: string; badgeCount: number })[]>([]);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [xpOpen, setXpOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBadge, setSelectedBadge] = useState(ALL_BADGES.filter(b => !b.isAutomatic)[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [xpAmount, setXpAmount] = useState(30);
  const [xpReason, setXpReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const list = await studentService.getAll(user.id);
      if (cancelled) return;
      setStudents(list);
      setSelectedStudent(list[0]?.id ?? "");
      if (list.length) {
        const d = await gamificationService.getTeacherRewardsOverview(list.map(s => s.id));
        if (!cancelled) setLevels(d as any);
      } else {
        setLevels([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const awardBadge = async () => {
    if (!selectedStudent || !user) return;
    await gamificationService.awardTeacherBadge(selectedStudent, selectedBadge, user.id, message, 0);
    toast.success(t("tr.awardTitle"));
    setBadgeOpen(false);
    setMessage("");
  };

  const awardXP = async () => {
    if (!xpReason.trim() || !selectedStudent || !user) return;
    const student = students.find(s => s.id === selectedStudent);
    await gamificationService.awardXP(selectedStudent, xpAmount, xpReason, "teacher", undefined, "teacher", user.id);
    toast.success(`${xpAmount} ${t("common.stars")} · ${student?.name ?? ""}`);
    setXpOpen(false);
    setXpReason("");
  };

  const teacherBadges = ALL_BADGES.filter(b => !b.isAutomatic);

  const tableHeaders = [
    t("common.student"),
    t("common.level"),
    t("tr.totalStars"),
    t("tr.progress"),
    t("tr.titles"),
    t("common.actions"),
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("tr.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("tr.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setBadgeOpen(true)}
            disabled={students.length === 0}
            className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Award size={16} /> {t("tr.awardTitle")}
          </button>
          <button
            onClick={() => setXpOpen(true)}
            disabled={students.length === 0}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Star size={16} fill="currentColor" /> {t("tr.awardStars")}
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">{t("tr.studentRewards")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("tr.alphaNote")}</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">{t("common.loading")}</div>
        ) : students.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">{t("tc.noStudents")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {tableHeaders.map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.sort((a, b) => a.name.localeCompare(b.name)).map(student => {
                  const lvl = levels.find(l => l.studentId === student.id);
                  return (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{student.name[0]}</div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={13} className="text-primary" />
                          <span className="font-semibold text-primary">{lvl?.level ?? 1}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{lvl?.totalXP ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, ((lvl?.totalXP ?? 0) % 100))}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{lvl?.badgeCount ?? 0}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => { setSelectedStudent(student.id); setXpOpen(true); }}
                          className="text-xs text-primary font-medium hover:underline"
                        >
                          + XP
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog.Root open={badgeOpen} onOpenChange={setBadgeOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-bold text-lg">{t("tr.awardTitle")}</Dialog.Title>
              <Dialog.Close className="p-2 rounded-lg hover:bg-muted"><X size={16} /></Dialog.Close>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("common.student")}</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full ui-input">
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Badge</label>
                <select value={selectedBadge} onChange={e => setSelectedBadge(e.target.value)} className="w-full ui-input">
                  {teacherBadges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("tr.personalMsg")}</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full ui-input min-h-20" />
              </div>
              <button type="button" onClick={awardBadge} className="ui-btn-primary w-full">{t("tr.awardTitle")}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={xpOpen} onOpenChange={setXpOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-bold text-lg">{t("tr.awardStars")}</Dialog.Title>
              <Dialog.Close className="p-2 rounded-lg hover:bg-muted"><X size={16} /></Dialog.Close>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("common.student")}</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full ui-input">
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">XP</label>
                <input type="number" value={xpAmount} onChange={e => setXpAmount(Number(e.target.value))} className="w-full ui-input" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("tr.reason")}</label>
                <input value={xpReason} onChange={e => setXpReason(e.target.value)} className="w-full ui-input" />
              </div>
              <button type="button" onClick={awardXP} className="ui-btn-primary w-full">
                <Plus size={16} /> {t("tr.awardStars")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
