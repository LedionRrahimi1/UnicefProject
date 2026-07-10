import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, Headphones, BookOpen, Award, Clock, FileText, Star } from "lucide-react";
import { studentService, gamificationService } from "./services";
import type { Student, StudentLevel } from "./types";
import { WEEKLY_PROGRESS_DATA } from "./mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [level, setLevel] = useState<StudentLevel | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      studentService.getById(id),
      gamificationService.getStudentLevel(id),
    ]).then(([s, lvl]) => {
      setStudent(s ?? null);
      setLevel(lvl);
    });
  }, [id]);

  if (!student) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft size={16} /> Kthehu
      </button>

      {/* Profile header */}
      <div className="bg-card rounded-2xl border border-border p-6 flex items-start gap-5 flex-wrap">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
          {student.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground text-sm">Klasa {student.class} · {student.age} vjeç · Nivel: {student.readingLevel}</p>
          {level && (
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">Niveli {level.level}</span>
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Star size={11} className="text-primary" fill="currentColor" /> {level.totalXP} Yje</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <FileText size={14} /> Cakto material
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Award size={14} /> Dhuro titull
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Stats */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Statistikat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: BookOpen, label: "Materiale të kryera", value: student.completedMaterials },
              { icon: Star, label: "Rezultati mesatar", value: `${student.score}%` },
              { icon: Headphones, label: "Audio e aktivizuar", value: student.audioEnabled ? "Po" : "Jo" },
              { icon: Clock, label: "Fonti i preferuar", value: student.preferredFont },
            ].map(s => (
              <div key={s.label} className="bg-muted/40 rounded-xl p-3">
                <s.icon size={15} className="text-muted-foreground mb-1.5" />
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent difficulties */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Vështirësi të fundit</h2>
          <div className="space-y-2.5">
            {["Identifikimi i idesë kryesore", "Fjalori akademik", "Pyetje me përgjigje të shkurtër"].map(d => (
              <div key={d} className="flex items-center gap-2.5 p-3 bg-warning-muted rounded-xl border border-warning/20">
                <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                <span className="text-sm text-warning-muted-foreground">{d}</span>
              </div>
            ))}
          </div>

          {student.alertReason && (
            <div className="mt-3 p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
              <span className="font-medium">Vërejtja e sistemit:</span> {student.alertReason}
            </div>
          )}
        </div>

        {/* Progress chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Progresi gjatë kohës</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={WEEKLY_PROGRESS_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} name="Rezultati" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Preferences */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4">Preferencat e leximit</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: "Fonti", value: student.preferredFont },
              { label: "Audio", value: student.audioEnabled ? "I aktivizuar" : "I çaktivizuar" },
              { label: "Gjuha", value: student.language === "sq" ? "Shqip" : student.language },
              { label: "Nivel i pyetjeve", value: "Mesatar" },
              { label: "Gjatësia e tekstit", value: "Tekste më të shkurtra" },
              { label: "Thjeshtësimi", value: "Adaptim mesatar" },
            ].map(pref => (
              <div key={pref.label} className="bg-muted/40 rounded-xl px-4 py-3">
                <p className="text-xs text-muted-foreground mb-0.5">{pref.label}</p>
                <p className="text-sm font-medium capitalize">{pref.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
