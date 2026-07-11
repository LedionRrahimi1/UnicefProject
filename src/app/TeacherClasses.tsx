import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, Search, Filter, Plus, ChevronRight, AlertTriangle, Star, X } from "lucide-react";
import { studentService } from "./services";
import type { Student, ClassGroup } from "./types";
import { toast } from "sonner";
import { useT } from "./useT";

const statusColors: Record<string, string> = {
  "excellent": "bg-success-muted text-success-muted-foreground",
  "active": "bg-secondary text-secondary-foreground",
  "needs-support": "bg-warning-muted text-warning-muted-foreground",
};
const levelColors: Record<string, string> = {
  "Avancuar": "text-success",
  "Mesatar": "text-primary",
  "Bazik": "text-warning",
};
const levelKeys: Record<string, string> = {
  "Avancuar": "level.advanced",
  "Mesatar": "level.medium",
  "Bazik": "level.basic",
};

export default function TeacherClasses() {
  const { t } = useT();
  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    age: "12",
    classId: "",
    readingLevel: "Mesatar",
    audioEnabled: true,
    visualPreferred: true,
  });

  const statusLabels: Record<string, string> = {
    "excellent": t("status.excellent"),
    "active": t("status.active"),
    "needs-support": t("status.needsSupport"),
  };

  const refreshClasses = async () => {
    const list = await studentService.getClasses();
    setClasses(list);
    return list;
  };

  useEffect(() => {
    refreshClasses().then(list => {
      if (list.length && !selectedClass) setSelectedClass(list[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    studentService.getByClass(selectedClass.id).then(s => {
      setStudents(s);
      setLoading(false);
    });
  }, [selectedClass]);

  const openAddModal = () => {
    setForm({
      name: "",
      age: "12",
      classId: selectedClass?.id || classes[0]?.id || "",
      readingLevel: "Mesatar",
      audioEnabled: true,
      visualPreferred: true,
    });
    setAddOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cls = classes.find(c => c.id === form.classId) || selectedClass;
    if (!cls) {
      toast.error(t("tc.selectClass"));
      return;
    }
    setSaving(true);
    try {
      const student = await studentService.create({
        name: form.name,
        class: cls.name,
        age: Number(form.age),
        readingLevel: form.readingLevel,
        audioEnabled: form.audioEnabled,
        visualPreferred: form.visualPreferred,
      });
      toast.success(`${student.name} · ${cls.name}`);
      setAddOpen(false);
      const list = await refreshClasses();
      const updated = list.find(c => c.id === cls.id) || cls;
      setSelectedClass(updated);
      const refreshed = await studentService.getByClass(updated.id);
      setStudents(refreshed);
    } catch (err) {
      const message = err instanceof Error ? err.message : t("tc.addFailed");
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const tableHeaders = [
    t("common.student"),
    t("common.age"),
    t("tc.readingLevel"),
    t("common.materials"),
    t("common.score"),
    t("common.status"),
    t("common.actions"),
  ];

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("tc.title")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("tc.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors min-h-11"
        >
          <Plus size={16} /> {t("tc.addStudent")}
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {classes.map(cls => (
          <button key={cls.id} type="button" onClick={() => setSelectedClass(cls)}
            className={`text-left bg-card rounded-2xl border-2 p-5 transition-all hover:shadow-md ${selectedClass?.id === cls.id ? "border-primary shadow-sm shadow-primary/15" : "border-border hover:border-primary/30"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{t("tc.studentsCount", { n: cls.studentCount })}</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-xl p-2.5">
                <p className="text-xs text-muted-foreground">{t("common.materials")}</p>
                <p className="font-semibold">{cls.activeMaterials}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-2.5">
                <p className="text-xs text-muted-foreground">{t("common.average")}</p>
                <p className="font-semibold">{cls.averageScore}%</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedClass && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold">{selectedClass.name}</h2>
            <div className="flex-1" />
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5 w-full sm:w-auto">
              <Search size={15} className="text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("tc.search")}
                className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-full" aria-label={t("tc.search")} />
            </div>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              <Filter size={14} /> {t("tc.filter")}
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus size={14} /> {t("tc.addStudent")}
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">{t("common.loading")}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead className="bg-muted/40">
                  <tr>
                    {tableHeaders.map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {s.name[0]}
                          </div>
                          <span className="font-medium">{s.name}</span>
                          {s.status === "needs-support" && <AlertTriangle size={13} className="text-warning" aria-label={t("status.needsSupport")} />}
                          {s.status === "excellent" && <Star size={13} className="text-success" aria-label={t("status.excellent")} />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.age}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium text-xs ${levelColors[s.readingLevel] ?? ""}`}>
                          {t(levelKeys[s.readingLevel] ?? "level.medium")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.completedMaterials}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${s.score}%` }} />
                          </div>
                          <span className="font-medium">{s.score}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.visualPreferred && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t("common.visual")}</span>
                          )}
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s.status]}`}>
                            {statusLabels[s.status]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/teacher/students/${s.id}`}
                          className="text-xs text-primary hover:underline font-medium">
                          {t("tc.viewProfile")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">{t("tc.noStudents")}</div>
              )}
            </div>
          )}
        </div>
      )}

      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => !saving && setAddOpen(false)} />
          <div className="relative w-full max-w-md ui-card p-6 shadow-[var(--shadow-lg)]" role="dialog" aria-modal="true" aria-labelledby="add-student-title">
            <div className="flex items-center justify-between mb-5">
              <h2 id="add-student-title" className="text-lg font-extrabold tracking-tight">{t("tc.addStudent")}</h2>
              <button type="button" onClick={() => !saving && setAddOpen(false)} className="p-2 rounded-xl hover:bg-muted min-h-10 min-w-10 flex items-center justify-center" aria-label={t("common.close")}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block" htmlFor="stu-name">{t("tc.fullName")}</label>
                <input
                  id="stu-name"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="p.sh. Era Krasniqi"
                  className="ui-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block" htmlFor="stu-age">{t("common.age")}</label>
                  <input
                    id="stu-age"
                    type="number"
                    min={5}
                    max={20}
                    required
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    className="ui-input"
                  />
                </div>
                <div>
                  <label className="mb-2 block" htmlFor="stu-level">{t("tc.readingLevel")}</label>
                  <select
                    id="stu-level"
                    value={form.readingLevel}
                    onChange={e => setForm(f => ({ ...f, readingLevel: e.target.value }))}
                    className="ui-input"
                  >
                    <option value="Bazik">{t("level.basic")}</option>
                    <option value="Mesatar">{t("level.medium")}</option>
                    <option value="Avancuar">{t("level.advanced")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block" htmlFor="stu-class">{t("common.class")}</label>
                <select
                  id="stu-class"
                  required
                  value={form.classId}
                  onChange={e => setForm(f => ({ ...f, classId: e.target.value }))}
                  className="ui-input"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center justify-between px-4 py-3 rounded-2xl border border-primary/25 bg-primary/5 cursor-pointer min-h-12">
                <div>
                  <span className="text-sm font-bold text-foreground block">{t("tc.visualLearn")}</span>
                  <span className="text-xs text-muted-foreground">{t("tc.visualHint")}</span>
                </div>
                <input
                  type="checkbox"
                  checked={form.visualPreferred}
                  onChange={e => setForm(f => ({ ...f, visualPreferred: e.target.checked }))}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between px-4 py-3 rounded-2xl border border-border cursor-pointer min-h-12">
                <span className="text-sm font-medium">{t("tc.enableAudio")}</span>
                <input
                  type="checkbox"
                  checked={form.audioEnabled}
                  onChange={e => setForm(f => ({ ...f, audioEnabled: e.target.checked }))}
                  className="w-5 h-5 accent-primary"
                />
              </label>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setAddOpen(false)} disabled={saving} className="ui-btn-secondary flex-1">
                  {t("common.cancel")}
                </button>
                <button type="submit" disabled={saving} className="ui-btn-primary flex-1">
                  {saving ? t("tc.saving") : t("tc.addStudentBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
