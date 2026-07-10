import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ChevronLeft, ChevronRight, Lightbulb, RotateCcw, X, Check } from "lucide-react";
import { assignmentService, gamificationService, materialService } from "./services";
import { useApp } from "./store";
import { toast } from "sonner";
import type { Material } from "./types";

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const { user } = useApp();
  const navigate = useNavigate();

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const m = await materialService.getById(id);
      setMaterial(m ?? null);
      if (m && user) {
        const asgn = await assignmentService.getByMaterialForStudent(m.id, user.id);
        if (asgn) setAssignmentId(asgn.id);
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!material || material.quiz.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Kuizi nuk u gjet për këtë material.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary hover:underline text-sm">← Kthehu</button>
      </div>
    );
  }

  const questions = material.quiz;
  const q = questions[currentIdx];
  const userAnswer = answers[q?.id];
  const isAnswered = userAnswer !== undefined;

  const handleAnswer = (ans: any) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [q.id]: ans }));
  };

  const submitAnswer = () => {
    if (!isAnswered || submitted) return;
    const isCorrect = q.type === "short"
      ? String(userAnswer).toLowerCase().includes(String(q.correct).toLowerCase())
      : userAnswer === q.correct;
    setSubmitted(true);
    setFeedback(isCorrect ? "Saktë! " + q.feedback : q.feedback);
  };

  const next = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSubmitted(false);
      setFeedback("");
      setShowHint(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correct = 0;
    questions.forEach(question => {
      const ans = answers[question.id];
      const isCorrect = question.type === "short"
        ? String(ans ?? "").toLowerCase().includes(String(question.correct).toLowerCase())
        : ans === question.correct;
      if (isCorrect) correct++;
    });
    const pct = Math.round((correct / questions.length) * 100);
    setScore(pct);
    setDone(true);

    if (assignmentId) {
      await assignmentService.complete(assignmentId, pct, 0, false);
    }

    if (user) {
      await gamificationService.awardXP(user.id, 20, `Plotësoi kuizin e '${material.title}'`, "quiz", material.id);
      if (pct >= 80) {
        await gamificationService.awardXP(user.id, 20, `Rezultat mbi 80% në '${material.title}'`, "quiz", material.id);
        toast.success("Shkëlqyer! +20 Yje shtesë për rezultatin mbi 80%!");
      }
      toast.success(`+20 Yje për plotësimin e kuizit!`);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-6 py-10">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 ${score >= 80 ? "bg-success-muted text-success-muted-foreground" : score >= 60 ? "bg-warning-muted text-warning-muted-foreground" : "bg-muted text-muted-foreground"}`}>
            {score}%
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {score >= 80 ? "Punë e shkëlqyer!" : score >= 60 ? "Jo keq!" : "Ke bërë përpjekje!"}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {score >= 80
              ? "Ke kuptuar shumë mirë materialin."
              : "Lexo materialin edhe njëherë dhe provo sërish."}
          </p>

          <div className="bg-muted/40 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-success-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-success-muted-foreground">
                {questions.filter(q2 => {
                  const ans = answers[q2.id];
                  return q2.type === "short"
                    ? String(ans ?? "").toLowerCase().includes(String(q2.correct).toLowerCase())
                    : ans === q2.correct;
                }).length}/{questions.length}
              </p>
              <p className="text-xs text-success">Saktë</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Pyetje</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {assignmentId && (
              <Link to={`/student/results/${assignmentId}`}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center">
                Shiko rezultatet
              </Link>
            )}
            <Link to="/student/dashboard"
              className="w-full py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors text-center">
              Kthehu te paneli
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5 py-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(`/student/read/${id}`)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /> Leximi
        </button>
        <p className="text-sm font-medium">{material.title}</p>
        <span className="text-xs text-muted-foreground">{currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIdx + (submitted ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h2 className="font-semibold text-lg leading-snug">{q.question}</h2>
          <button onClick={() => setShowHint(h => !h)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-colors ${showHint ? "bg-warning-muted text-warning-muted-foreground" : "border border-border hover:bg-muted"}`}>
            <Lightbulb size={12} /> Ndihmë
          </button>
        </div>

        {showHint && q.hint && (
          <div className="bg-warning-muted border border-warning/20 rounded-xl p-3 mb-4 text-sm text-warning-muted-foreground">
            {q.hint}
          </div>
        )}

        {q.type !== "short" && q.options && (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const selected = userAnswer === i;
              const isCorrect = i === q.correct;
              let cls = "border-2 border-border hover:border-primary/30 hover:bg-primary/5";
              if (submitted && selected && isCorrect) cls = "border-2 border-success bg-success-muted";
              else if (submitted && selected && !isCorrect) cls = "border-2 border-destructive/50 bg-destructive/5";
              else if (submitted && isCorrect) cls = "border-2 border-success bg-success-muted";
              else if (selected) cls = "border-2 border-primary bg-primary/10";

              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={submitted}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all text-sm font-medium flex items-center gap-3 ${cls}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-primary bg-primary text-white" : "border-current"}`}>
                    {submitted && isCorrect ? <Check size={14} className="text-success" /> :
                     submitted && selected && !isCorrect ? <X size={14} className="text-destructive" /> :
                     <span className="text-xs">{String.fromCharCode(65 + i)}</span>}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "short" && (
          <input type="text" value={userAnswer ?? ""} onChange={e => handleAnswer(e.target.value)}
            disabled={submitted} placeholder="Shkruaj përgjigjen tënde..."
            className="w-full bg-input-background border-2 border-border rounded-2xl px-5 py-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            aria-label="Përgjigja jote" />
        )}

        {submitted && feedback && (
          <div className={`mt-4 p-4 rounded-xl text-sm leading-relaxed ${userAnswer === q.correct || (q.type === "short" && String(userAnswer ?? "").toLowerCase().includes(String(q.correct).toLowerCase())) ? "bg-success-muted border border-success/25 text-success-muted-foreground" : "bg-warning-muted border border-warning/20 text-warning-muted-foreground"}`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={() => { setCurrentIdx(0); setAnswers({}); setSubmitted(false); setFeedback(""); setShowHint(false); setDone(false); }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <RotateCcw size={14} /> Rifillo
        </button>
        {!submitted ? (
          <button onClick={submitAnswer} disabled={!isAnswered}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50">
            Kontrollo
          </button>
        ) : (
          <button onClick={next}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
            {currentIdx < questions.length - 1 ? <>Vazhdo <ChevronRight size={16} /></> : "Përfundo"}
          </button>
        )}
      </div>
    </div>
  );
}
