import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Star, Clock, BookOpen, Headphones, RotateCcw, ChevronRight, Check, RefreshCw } from "lucide-react";
import { assignmentService, materialService } from "./services";
import type { Assignment, Material } from "./types";

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const asgn = await assignmentService.getById(id);
      setAssignment(asgn ?? null);
      if (asgn) {
        const mat = await materialService.getById(asgn.materialId);
        setMaterial(mat ?? null);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!assignment || !material) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Rezultati nuk u gjet.</p>
        <Link to="/student/dashboard" className="mt-4 text-primary hover:underline text-sm inline-block">← Kthehu te paneli</Link>
      </div>
    );
  }

  const score = assignment.score ?? 0;
  const wellUnderstood = material.quiz.slice(0, Math.ceil(material.quiz.length * score / 100));
  const needsReview = material.quiz.slice(Math.ceil(material.quiz.length * score / 100));

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-4">
      <div className={`rounded-2xl p-8 text-center text-white shadow-md transition-all ${score >= 80 ? "bg-gradient-to-br from-primary to-[#8B7CF7]" : score >= 60 ? "bg-gradient-to-br from-primary to-[#5B52C7]" : "bg-gradient-to-br from-[#C4A35A] to-[#B8954A]"}`}>
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Star size={32} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-bold mb-1">
          {score >= 80 ? "Punë e shkëlqyer!" : score >= 60 ? "Jo keq!" : "Ke bërë përpjekje!"}
        </h1>
        <p className="text-white/80 mb-4">Ke përfunduar materialin: <strong>{material.title}</strong></p>
        <div className="text-5xl font-bold mb-2">{score}%</div>
        <p className="text-white/80 text-sm">{Math.round(material.quiz.length * score / 100)} nga {material.quiz.length} përgjigje saktë</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: "Kohëzgjatja", value: `${assignment.timeSpentMinutes ?? 18} min` },
          { icon: BookOpen, label: "Fjalë të hapura", value: `${assignment.wordsOpened ?? 0}` },
          { icon: Headphones, label: "Audio e përdorur", value: assignment.audioUsed ? "Po" : "Jo" },
          { icon: RefreshCw, label: "Tentativa", value: `${assignment.attempts ?? 1}` },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <stat.icon size={18} className="text-muted-foreground mx-auto mb-2" />
            <p className="font-bold text-lg text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <p className="font-semibold text-primary mb-3 flex items-center gap-2">
          <Star size={16} className="text-primary" fill="currentColor" /> Yje të fituara
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center"><span className="text-foreground">Përfundimi i materialit</span><span className="font-bold text-primary inline-flex items-center gap-1"><Star size={12} fill="currentColor" /> +30 Yje</span></div>
          <div className="flex justify-between items-center"><span className="text-foreground">Plotësimi i kuizit</span><span className="font-bold text-primary inline-flex items-center gap-1"><Star size={12} fill="currentColor" /> +20 Yje</span></div>
          {score >= 80 && <div className="flex justify-between items-center"><span className="text-foreground">Rezultat mbi 80%</span><span className="font-bold text-success inline-flex items-center gap-1"><Star size={12} fill="currentColor" /> +20 Yje</span></div>}
          <div className="flex justify-between items-center pt-2 border-t border-border font-semibold">
            <span>Gjithsej</span>
            <span className="text-primary inline-flex items-center gap-1"><Star size={14} fill="currentColor" /> +{score >= 80 ? 70 : 50} Yje</span>
          </div>
        </div>
      </div>

      {wellUnderstood.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <Check size={16} className="text-success" /> Çfarë kuptove mirë
          </h2>
          <ul className="space-y-1.5">
            {wellUnderstood.map(q => (
              <li key={q.id} className="flex items-start gap-2 text-sm">
                <Check size={13} className="text-success mt-0.5 shrink-0" />
                <span className="text-foreground">{q.question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {needsReview.length > 0 && (
        <div className="bg-warning-muted border border-warning/20 rounded-2xl p-5">
          <h2 className="font-semibold flex items-center gap-2 mb-3 text-warning-muted-foreground">
            <RefreshCw size={16} /> Çfarë mund të lexosh sërisht
          </h2>
          <ul className="space-y-1.5">
            {needsReview.map(q => (
              <li key={q.id} className="flex items-start gap-2 text-sm text-warning-muted-foreground">
                <RotateCcw size={13} className="mt-0.5 shrink-0" />
                <span>{q.question}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Link to={`/student/read/${material.id}`}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-center flex items-center justify-center gap-2">
          <RotateCcw size={14} /> Lexo sërisht
        </Link>
        <Link to={`/student/quiz/${material.id}`}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-center flex items-center justify-center gap-2">
          <RefreshCw size={14} /> Provo sërisht
        </Link>
        <Link to="/student/dashboard"
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center flex items-center justify-center gap-2">
          Kthehu te detyrat <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
