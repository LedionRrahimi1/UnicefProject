import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Upload, FileText, ChevronRight, ChevronLeft, Check, Wand2,
  Users, Sliders, BookOpen, X, File,
} from "lucide-react";
import { toast } from "sonner";
import { materialService, aiService } from "./services";
import { MOCK_CLASSES, MOCK_STUDENTS } from "./mockData";

const STEPS = ["Ngarko materialin", "Zgjidh audiencën", "Adaptimi", "Konfirmimi"];

const AI_STEPS = [
  "Duke analizuar materialin...",
  "Duke thjeshtësuar tekstin...",
  "Duke krijuar përmbledhjen...",
  "Duke identifikuar fjalët e vështira...",
  "Duke krijuar pyetjet...",
  "Materiali është gati! ✓",
];

export default function MaterialCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [aiStepIdx, setAiStepIdx] = useState(-1);
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 1
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  // Step 2
  const [audience, setAudience] = useState<"class" | "student">("class");
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0].id);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Step 3
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState(2);
  const [length, setLength] = useState("mesatar");
  const [numQ, setNumQ] = useState(5);
  const [switches, setSwitches] = useState({
    summary: true, keyPoints: true, vocab: true, quiz: true, translate: false, audio: false, teacherNotes: true,
  });

  const handleFile = async (f: File) => {
    setFile(f);
    if (f.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(f.name)) {
      try {
        const content = await f.text();
        if (content.trim().length > 0) setText(content);
      } catch {
        // keep file reference; user can still paste text
      }
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const studentsInClass = MOCK_STUDENTS.filter(s => {
    const cls = MOCK_CLASSES.find(c => c.id === selectedClass);
    return cls && s.class === cls.name.replace("Klasa ", "");
  });

  const canProceed = () => {
    if (step === 0) return text.trim().length > 20 || file !== null;
    if (step === 1) return audience === "class" || selectedStudents.length > 0;
    if (step === 2) return true;
    return true;
  };

  const resolveTitle = () => {
    if (title.trim()) return title.trim();
    if (file) return file.name.replace(/\.[^.]+$/, "");
    const fromText = text.trim().split(/[.\n]/)[0]?.trim().slice(0, 60);
    return fromText || "Material i ri";
  };

  const resolveSubject = () => subject.trim() || "Lëndë e përgjithshme";

  const handleContinue = () => {
    if (!canProceed()) return;
    if (step === 2) {
      const nextTitle = resolveTitle();
      const nextSubject = resolveSubject();
      if (nextTitle !== title) setTitle(nextTitle);
      if (nextSubject !== subject) setSubject(nextSubject);
    }
    setStep(s => s + 1);
  };

  const runAI = async () => {
    const finalTitle = resolveTitle();
    const finalSubject = resolveSubject();
    if (!title.trim()) setTitle(finalTitle);
    if (!subject.trim()) setSubject(finalSubject);

    const sourceText = text.trim() || (file ? `Material nga skedari: ${file.name}` : "");
    if (sourceText.length < 20) {
      toast.error("Shto tekst më të gjatë (të paktën 20 karaktere) para se të adaptohet me AI.");
      return;
    }

    setProcessing(true);
    setAiStepIdx(0);

    const progressTimer = window.setInterval(() => {
      setAiStepIdx(prev => (prev < AI_STEPS.length - 2 ? prev + 1 : prev));
    }, 1800);

    try {
      const adapted = await aiService.adaptMaterial({
        text: sourceText,
        title: finalTitle,
        subject: finalSubject,
        level,
        length,
        numQuestions: numQ,
        includeSummary: switches.summary,
        includeKeyPoints: switches.keyPoints,
        includeVocab: switches.vocab,
        includeQuiz: switches.quiz,
        includeTeacherNotes: switches.teacherNotes,
        includeTranslation: switches.translate,
      });

      window.clearInterval(progressTimer);
      setAiStepIdx(AI_STEPS.length - 1);

      const mat = await materialService.create({
        title: finalTitle,
        subject: finalSubject,
        class: MOCK_CLASSES.find(c => c.id === selectedClass)?.name.replace("Klasa ", "") ?? "VI-1",
        originalText: sourceText,
        simplifiedText: adapted.simplifiedText,
        summary: adapted.summary,
        keyPoints: adapted.keyPoints,
        vocabulary: adapted.vocabulary,
        quiz: adapted.quiz,
        teacherNotes: adapted.teacherNotes,
        estimatedMinutes: Math.max(10, Math.round(adapted.simplifiedText.split(/\s+/).length / 120) * 5),
      });

      toast.success("Materiali u adaptua me sukses nga AI!");
      await new Promise(r => setTimeout(r, 500));
      navigate(`/teacher/materials/${mat.id}/review`);
    } catch (err) {
      window.clearInterval(progressTimer);
      setProcessing(false);
      setAiStepIdx(-1);
      const message = err instanceof Error ? err.message : "Diçka shkoi keq me AI.";
      toast.error(message);
    }
  };

  const simplificationLabels = ["Adaptim i lehtë", "Adaptim mesatar", "Adaptim i avancuar"];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Krijo material të ri</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Ngarko dhe adapto materialin mësimor me ndihmën e AI.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs text-center hidden sm:block ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-card rounded-2xl border border-border p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Ngarko materialin</h2>
            <div className="flex gap-2 mb-4">
              {[{ id: "text", label: "Shkruaj / ngjit tekst" }, { id: "file", label: "Ngarko skedar" }].map(opt => (
                <button key={opt.id} onClick={() => setInputMode(opt.id as any)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${inputMode === opt.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {inputMode === "text" ? (
              <textarea value={text} onChange={e => setText(e.target.value)} rows={8}
                placeholder="Ngjit ose shkruaj tekstin mësimor këtu... (minimum 20 karaktere)"
                className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground resize-none"
                aria-label="Teksti mësimor" />
            ) : (
              <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
                onKeyDown={e => e.key === "Enter" && fileRef.current?.click()}
                aria-label="Zona e ngarkimit të skedarit">
                <Upload size={32} className="text-muted-foreground mx-auto mb-3" />
                {file ? (
                  <div className="flex items-center gap-2 justify-center text-sm">
                    <File size={16} className="text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-destructive" aria-label="Hiq skedarin">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-sm mb-1">Zvarrit skedarin këtu ose kliko</p>
                    <p className="text-xs text-muted-foreground">PDF, Word, JPG, PNG · Maksimumi 10MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} aria-label="Zgjidh skedar" />
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Zgjidh audiencën</h2>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "class", label: "Të gjithë klasën" }, { id: "student", label: "Nxënës të caktuar" }].map(opt => (
                <button key={opt.id} onClick={() => setAudience(opt.id as any)}
                  className={`py-3 rounded-xl text-sm font-medium border-2 transition-colors ${audience === opt.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Klasa</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground" aria-label="Zgjidh klasën">
                {MOCK_CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {audience === "student" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Zgjidh nxënës</label>
                <div className="space-y-2">
                  {studentsInClass.map(s => (
                    <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedStudents.includes(s.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                      <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)} className="accent-primary w-4 h-4" />
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{s.name[0]}</div>
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{s.readingLevel}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-lg">Adaptimi</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Titulli i materialit *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="p.sh. Fotosinteza"
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground" aria-label="Titulli" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Lënda *</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="p.sh. Biologji"
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground" aria-label="Lënda" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Niveli i thjeshtësimit</label>
              <div className="grid grid-cols-3 gap-2">
                {simplificationLabels.map((label, i) => (
                  <button key={i} onClick={() => setLevel(i + 1)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-colors ${level === i + 1 ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Gjatësia e dëshiruar</label>
              <div className="flex gap-2">
                {["shkurtër", "mesatar", "gjatë"].map(opt => (
                  <button key={opt} onClick={() => setLength(opt)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-colors capitalize ${length === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Numri i pyetjeve: {numQ}</label>
              <input type="range" min={3} max={10} value={numQ} onChange={e => setNumQ(Number(e.target.value))}
                className="w-full accent-primary" aria-label="Numri i pyetjeve" />
            </div>

            <div>
              <p className="text-sm font-medium mb-3">Elementet e gjenerimit</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {Object.entries(switches).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    summary: "Krijon përmbledhje", keyPoints: "Pikat kryesore",
                    vocab: "Fjalor i vështirë", quiz: "Kuiz",
                    translate: "Përkthim", audio: "Audio", teacherNotes: "Shënime për mësuesen",
                  };
                  return (
                    <label key={key} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${val ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                      <span className="text-sm">{labels[key]}</span>
                      <div onClick={() => setSwitches(prev => ({ ...prev, [key]: !prev[key as keyof typeof switches] }))}
                        className={`w-10 h-5 rounded-full relative transition-colors ${val ? "bg-primary" : "bg-muted-foreground/30"}`} role="switch" aria-checked={val}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${val ? "left-5" : "left-0.5"}`} />
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && !processing && (
          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Konfirmimi</h2>
            <div className="bg-warning-muted border border-warning/20 rounded-xl p-4 text-sm text-warning-muted-foreground">
              Permbajtja e gjeneruar nga AI duhet të shqyrtohet nga mësuesi para publikimit.
            </div>
            <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Titulli</span><span className="font-medium">{title}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Lënda</span><span className="font-medium">{subject}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Thjeshtësimi</span><span className="font-medium">{simplificationLabels[level - 1]}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pyetje</span><span className="font-medium">{numQ}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Audienca</span><span className="font-medium">{audience === "class" ? MOCK_CLASSES.find(c => c.id === selectedClass)?.name : `${selectedStudents.length} nxënës`}</span></div>
            </div>
          </div>
        )}

        {processing && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Wand2 size={28} className="text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">AI po përpunon materialin...</h2>
              <p className="text-sm text-muted-foreground">Ju lutemi prisni disa sekonda.</p>
            </div>
            <div className="space-y-2 max-w-xs mx-auto">
              {AI_STEPS.map((s, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm transition-all ${i <= aiStepIdx ? "opacity-100" : "opacity-30"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${i < aiStepIdx ? "bg-success" : i === aiStepIdx ? "bg-primary animate-pulse" : "bg-muted"}`}>
                    {i < aiStepIdx ? <Check size={10} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={i <= aiStepIdx ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!processing && (
        <div className="flex items-center justify-between">
          <button onClick={() => step === 0 ? window.history.back() : setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium">
            <ChevronLeft size={16} /> {step === 0 ? "Anulo" : "Prapa"}
          </button>
          {step < 3 ? (
            <button type="button" onClick={handleContinue} disabled={!canProceed()}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none">
              Vazhdo <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={runAI}
              className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25">
              <Wand2 size={16} /> Adapto me AI
            </button>
          )}
        </div>
      )}
    </div>
  );
}
