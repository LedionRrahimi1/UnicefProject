import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { Users, BookOpen, TrendingUp, Search, Filter, Plus, ChevronRight, AlertTriangle, Star, MoreVertical } from "lucide-react";
import { studentService } from "./services";
import type { Student, ClassGroup } from "./types";
import { MOCK_CLASSES } from "./mockData";

const statusColors: Record<string, string> = {
  "excellent": "bg-success-muted text-success-muted-foreground",
  "active": "bg-secondary text-secondary-foreground",
  "needs-support": "bg-warning-muted text-warning-muted-foreground",
};
const statusLabels: Record<string, string> = {
  "excellent": "Shkëlqyes",
  "active": "Aktiv",
  "needs-support": "Kërkon mbështetje",
};
const levelColors: Record<string, string> = {
  "Avancuar": "text-success",
  "Mesatar": "text-primary",
  "Bazik": "text-warning",
};

export default function TeacherClasses() {
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    studentService.getByClass(selectedClass.id).then(s => {
      setStudents(s); setLoading(false);
    });
  }, [selectedClass]);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Klasat dhe Nxënësit</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Menaxho klasat dhe nxënësit tuaj.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Shto nxënës
        </button>
      </div>

      {/* Class cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {MOCK_CLASSES.map(cls => (
          <button key={cls.id} onClick={() => setSelectedClass(cls)}
            className={`text-left bg-card rounded-2xl border-2 p-5 transition-all hover:shadow-md ${selectedClass?.id === cls.id ? "border-primary shadow-sm shadow-primary/15" : "border-border hover:border-primary/30"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold">{cls.name}</p>
                <p className="text-xs text-muted-foreground">{cls.studentCount} nxënës</p>
              </div>
              <ChevronRight size={16} className="ml-auto text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/50 rounded-xl p-2.5">
                <p className="text-xs text-muted-foreground">Materiale</p>
                <p className="font-semibold">{cls.activeMaterials}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-2.5">
                <p className="text-xs text-muted-foreground">Mesatare</p>
                <p className="font-semibold">{cls.averageScore}%</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Student table */}
      {selectedClass && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3 flex-wrap">
            <h2 className="font-semibold">{selectedClass.name}</h2>
            <div className="flex-1" />
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-1.5 w-full sm:w-auto">
              <Search size={15} className="text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Kërko nxënës..."
                className="bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground w-full" aria-label="Kërko nxënës" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors">
              <Plus size={14} /> Krijoni detyrë
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Duke ngarkuar...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead className="bg-muted/40">
                  <tr>
                    {["Nxënësi", "Mosha", "Niveli i leximit", "Materialet", "Rezultati", "Statusi", "Veprimet"].map(h => (
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
                          {s.status === "needs-support" && <AlertTriangle size={13} className="text-warning" aria-label="Kërkon mbështetje" />}
                          {s.status === "excellent" && <Star size={13} className="text-success" aria-label="Nxënës shkëlqyes" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s.age}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium text-xs ${levelColors[s.readingLevel] ?? ""}`}>{s.readingLevel}</span>
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
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[s.status]}`}>
                          {statusLabels[s.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/teacher/students/${s.id}`}
                          className="text-xs text-primary hover:underline font-medium">
                          Shiko profilin
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">Nuk u gjet asnjë nxënës.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
