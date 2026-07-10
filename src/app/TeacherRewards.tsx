import React, { useState, useEffect } from "react";
import { Award, Plus, Star, TrendingUp, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { gamificationService } from "./services";
import { MOCK_STUDENTS, ALL_BADGES } from "./mockData";
import type { StudentLevel } from "./types";
import { toast } from "sonner";

const rarityLabels: Record<string, string> = {
  common: "I zakonshëm", uncommon: "Jo i zakonshëm",
  rare: "I rrallë", special: "I veçantë", teacher: "Shpërblim nga mësuesja",
};
const rarityColors: Record<string, string> = {
  common: "bg-muted text-muted-foreground",
  uncommon: "bg-secondary text-secondary-foreground",
  rare: "bg-accent text-accent-foreground",
  special: "bg-warning-muted text-warning-muted-foreground",
  teacher: "bg-primary/10 text-primary",
};

export default function TeacherRewards() {
  const [levels, setLevels] = useState<(StudentLevel & { studentId: string; badgeCount: number })[]>([]);
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [xpOpen, setXpOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0].id);
  const [selectedBadge, setSelectedBadge] = useState(ALL_BADGES.filter(b => !b.isAutomatic)[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [xpAmount, setXpAmount] = useState(30);
  const [xpReason, setXpReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamificationService.getTeacherRewardsOverview(MOCK_STUDENTS.map(s => s.id)).then(d => {
      setLevels(d as any);
      setLoading(false);
    });
  }, []);

  const awardBadge = async () => {
    await gamificationService.awardTeacherBadge(selectedStudent, selectedBadge, "teacher-1", message, 0);
    toast.success(`Titulli u dhuruar me sukses!`);
    setBadgeOpen(false);
    setMessage("");
  };

  const awardXP = async () => {
    if (!xpReason.trim()) return;
    const student = MOCK_STUDENTS.find(s => s.id === selectedStudent);
    await gamificationService.awardXP(selectedStudent, xpAmount, xpReason, "teacher", undefined, "teacher", "teacher-1");
    toast.success(`${xpAmount} Yje iu dhuruan me sukses ${student?.name}.`);
    setXpOpen(false);
    setXpReason("");
  };

  const teacherBadges = ALL_BADGES.filter(b => !b.isAutomatic);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Yjet dhe Titujt</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Menaxho shpërblimet dhe motivoni nxënësit tuaj.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBadgeOpen(true)}
            className="flex items-center gap-2 border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
            <Award size={16} /> Dhuro titull
          </button>
          <button onClick={() => setXpOpen(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Star size={16} fill="currentColor" /> Dhuro Yje
          </button>
        </div>
      </div>

      {/* Student rewards table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Shpërblimet e nxënësve</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Renditje alfabetike. Nuk ka krahasim mes nxënësve.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-muted-foreground">Duke ngarkuar...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  {["Nxënësi", "Niveli", "Yje totale", "Progresi", "Tituj", "Veprime"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_STUDENTS.sort((a, b) => a.name.localeCompare(b.name)).map(student => {
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
                      <td className="px-4 py-3 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Star size={12} className="text-primary" fill="currentColor" />
                          {lvl?.totalXP ?? 0} Yje
                        </span>
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${lvl?.progressPercentage ?? 0}%` }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{lvl?.progressPercentage ?? 0}%</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                          {lvl?.badgeCount ?? 0} tituj
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => { setSelectedStudent(student.id); setBadgeOpen(true); }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            Titull
                          </button>
                          <button onClick={() => { setSelectedStudent(student.id); setXpOpen(true); }}
                            className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors inline-flex items-center gap-1">
                            <Star size={11} fill="currentColor" /> Yje
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Badge templates */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Titujt e mësueses</h2>
          <button className="flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Plus size={14} /> Krijo titull
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {teacherBadges.map(badge => (
            <div key={badge.id} className="border border-border rounded-xl p-3 hover:border-primary/30 hover:bg-primary/5 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{badge.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${rarityColors[badge.rarity]}`}>{rarityLabels[badge.rarity]}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Award Badge Modal */}
      <Dialog.Root open={badgeOpen} onOpenChange={setBadgeOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-semibold text-lg">Dhuro titull</Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted" aria-label="Mbyll"><X size={16} /></button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nxënësi</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Titulli</label>
                <div className="space-y-2">
                  {teacherBadges.map(b => (
                    <label key={b.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedBadge === b.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <input type="radio" name="badge" value={b.id} checked={selectedBadge === b.id} onChange={() => setSelectedBadge(b.id)} className="accent-primary" />
                      <Star size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Mesazh personal</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Shkruaj një mesazh inkurajues..."
                  rows={3} className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Dialog.Close asChild>
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Anulo</button>
              </Dialog.Close>
              <button onClick={awardBadge}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Dhuro titull
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Award Stars Modal */}
      <Dialog.Root open={xpOpen} onOpenChange={setXpOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6 z-50">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-semibold text-lg inline-flex items-center gap-2">
                <Star size={18} className="text-primary" fill="currentColor" /> Dhuro Yje
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1.5 rounded-lg hover:bg-muted" aria-label="Mbyll"><X size={16} /></button>
              </Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nxënësi</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50">
                  {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Sasia e Yjeve:{" "}
                  <span className="text-primary inline-flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {xpAmount} Yje
                  </span>
                </label>
                <input type="range" min={5} max={100} step={5} value={xpAmount} onChange={e => setXpAmount(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Arsyeja (e detyrueshme)</label>
                <textarea value={xpReason} onChange={e => setXpReason(e.target.value)}
                  placeholder="p.sh. Punë e shkëlqyer gjatë orës mësimore..."
                  rows={2} className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Dialog.Close asChild>
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Anulo</button>
              </Dialog.Close>
              <button onClick={awardXP} disabled={!xpReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5">
                <Star size={14} fill="currentColor" /> Dhuro Yje
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
