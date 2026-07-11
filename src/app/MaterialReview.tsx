import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  AlertTriangle, Check, RefreshCw, BookOpen, Save, Globe, Languages,
  FileText, List, BookMarked, MessageSquare, ChevronLeft, ImageIcon,
  ChevronDown, ChevronUp, Headphones, Pause, Loader2,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { materialService, aiService } from "./services";
import type { Material, QuizQuestion } from "./types";
import { toast } from "sonner";
import { useT } from "./useT";
import MaterialQuizEditor from "./MaterialQuizEditor";
import LessonChatbot from "./LessonChatbot";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning-muted text-warning-muted-foreground",
  approved: "bg-secondary text-secondary-foreground",
  published: "bg-success-muted text-success-muted-foreground",
};

const regenOptions = [
  "Bëje më të shkurtër", "Bëje më të thjeshtë", "Shto shembuj",
  "Ndrysho pyetjet", "Shpjego termat qartë", "Shkruaj udhëzim vetjak",
];

function sourceLabel(originalText: string): string {
  const fileMatch = originalText.match(/Material nga skedari:\s*(.+)/i);
  if (fileMatch?.[1]) return fileMatch[1].trim();
  const firstLine = originalText.trim().split(/\n/)[0]?.trim() ?? "";
  if (firstLine.length <= 48) return firstLine || "Teksti origjinal";
  return `${firstLine.slice(0, 45)}…`;
}

export default function MaterialReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useT();
  const [material, setMaterial] = useState<Material | null>(null);
  const [activeTab, setActiveTab] = useState("simplified");
  const [regenOpen, setRegenOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const [editedText, setEditedText] = useState("");
  const [editedQuiz, setEditedQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [originalOpen, setOriginalOpen] = useState(false);
  const [enAudioLoading, setEnAudioLoading] = useState(false);
  const [enPlaying, setEnPlaying] = useState(false);
  const enAudioRef = useRef<HTMLAudioElement | null>(null);
  const enUrlsRef = useRef<string[]>([]);
  const enIndexRef = useRef(0);
  const enPlayingRef = useRef(false);

  const statusLabels: Record<string, string> = {
    draft: t("status.draft"),
    review: t("status.review"),
    approved: t("status.approved"),
    published: t("status.published"),
  };

  useEffect(() => {
    if (!id) return;
    materialService.getById(id).then(m => {
      setMaterial(m ?? null);
      setEditedText(m?.simplifiedText ?? "");
      setEditedQuiz(m?.quiz ? m.quiz.map(q => ({ ...q, options: q.options ? [...q.options] : [] })) : []);
      setLoading(false);
    });
  }, [id]);

  const stopEnglishAudio = useCallback(() => {
    enPlayingRef.current = false;
    setEnPlaying(false);
    const audio = enAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  useEffect(() => () => {
    stopEnglishAudio();
    enUrlsRef.current.forEach(u => URL.revokeObjectURL(u));
    enUrlsRef.current = [];
  }, [stopEnglishAudio]);

  const playEnglishChunk = useCallback(async (index: number) => {
    const urls = enUrlsRef.current;
    if (!urls.length || index >= urls.length) {
      enPlayingRef.current = false;
      setEnPlaying(false);
      return;
    }
    enIndexRef.current = index;
    let audio = enAudioRef.current;
    if (!audio) {
      audio = new Audio();
      enAudioRef.current = audio;
    }
    audio.pause();
    audio.src = urls[index];
    audio.onended = () => {
      if (!enPlayingRef.current) return;
      void playEnglishChunk(index + 1);
    };
    audio.onerror = () => {
      enPlayingRef.current = false;
      setEnPlaying(false);
      toast.error("English audio failed to play.");
    };
    try {
      await audio.play();
      enPlayingRef.current = true;
      setEnPlaying(true);
    } catch {
      enPlayingRef.current = false;
      setEnPlaying(false);
      toast.error("Browser blocked audio. Try again.");
    }
  }, []);

  const toggleEnglishAudio = useCallback(async () => {
    if (!material?.englishText?.trim()) return;
    if (enPlayingRef.current) {
      stopEnglishAudio();
      return;
    }
    setEnAudioLoading(true);
    try {
      if (!enUrlsRef.current.length) {
        const urls = await aiService.generateAudioChunks(material.englishText, "en");
        enUrlsRef.current = urls;
      }
      enPlayingRef.current = true;
      setEnPlaying(true);
      await playEnglishChunk(0);
    } catch (err) {
      enPlayingRef.current = false;
      setEnPlaying(false);
      const message = err instanceof Error ? err.message : "Could not generate English audio.";
      toast.error(message);
    } finally {
      setEnAudioLoading(false);
    }
  }, [material, playEnglishChunk, stopEnglishAudio]);

  const originalSummary = useMemo(
    () => (material ? sourceLabel(material.originalText) : ""),
    [material]
  );

  const quizDirty = useMemo(
    () => JSON.stringify(editedQuiz) !== JSON.stringify(material?.quiz ?? []),
    [editedQuiz, material?.quiz]
  );

  const persistEdits = async () => {
    if (!material) return material;
    const patch: Partial<Material> = {};
    if (editedText !== material.simplifiedText) patch.simplifiedText = editedText;
    if (quizDirty) patch.quiz = editedQuiz;
    if (Object.keys(patch).length === 0) return material;
    const updated = await materialService.update(material.id, patch);
    const next = updated ?? { ...material, ...patch };
    setMaterial(next);
    return next;
  };

  const handleStatusChange = async (status: Material["status"]) => {
    if (!material) return;
    await persistEdits();
    await materialService.updateStatus(material.id, status);
    const updated = await materialService.getById(material.id);
    setMaterial(updated ?? { ...material, status, simplifiedText: editedText, quiz: editedQuiz });
    if (status === "published") {
      toast.success(t("mr.published"));
    } else if (status === "draft") {
      toast.success(t("mr.saved"));
    } else {
      toast.success(`${t("common.status")}: ${statusLabels[status]}`);
    }
  };

  const tabs = useMemo(() => {
    if (!material) return [{ id: "simplified", icon: FileText, label: t("mr.simplified") }];
    const es = material.enabledSections;
    const show = (key: keyof NonNullable<Material["enabledSections"]>, hasContent: boolean) =>
      es ? Boolean(es[key]) : hasContent;

    return [
      { id: "simplified", icon: FileText, label: t("mr.simplified") },
      ...(show("summary", Boolean(material.summary?.trim()))
        ? [{ id: "summary", icon: BookMarked, label: t("mr.summary") }]
        : []),
      ...(show("keyPoints", (material.keyPoints?.length ?? 0) > 0)
        ? [{ id: "keypoints", icon: List, label: t("mr.keyPoints") }]
        : []),
      ...(show("vocab", (material.vocabulary?.length ?? 0) > 0)
        ? [{ id: "vocab", icon: BookOpen, label: t("mr.vocab") }]
        : []),
      ...(show("quiz", (editedQuiz.length > 0) || (material.quiz?.length ?? 0) > 0)
        ? [{ id: "quiz", icon: MessageSquare, label: t("mr.quiz") }]
        : []),
      ...(show("translate", Boolean(material.englishText?.trim()))
        ? [{ id: "english", icon: Languages, label: t("mr.english") }]
        : []),
      ...(show("visualizations", (material.illustrations?.length ?? 0) > 0)
        ? [{ id: "visuals", icon: ImageIcon, label: t("mr.visuals") }]
        : []),
      ...(show("teacherNotes", Boolean(material.teacherNotes?.trim()))
        ? [{ id: "teacher", icon: AlertTriangle, label: t("mr.notes") }]
        : []),
    ];
  }, [material, editedQuiz.length, t]);

  useEffect(() => {
    if (!tabs.some(tab => tab.id === activeTab)) {
      setActiveTab("simplified");
    }
  }, [activeTab, tabs]);

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!material) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">{t("mr.notFound")}</p>
      <button onClick={() => navigate("/teacher/materials")} className="mt-4 text-primary hover:underline text-sm">
        {t("mr.backMaterials")}
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => navigate("/teacher/materials")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft size={14} /> {t("common.back")}
          </button>
          <h1 className="text-2xl font-bold">{material.title}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-sm text-muted-foreground">{material.subject} · {t("common.class")} {material.class}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[material.status]}`}>
              {statusLabels[material.status]}
            </span>
            {material.adaptationLabel && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary/10 text-primary">
                {material.adaptationLabel}
                {material.targetStudentIds?.length
                  ? ` · ${material.targetStudentIds.length} nxënës`
                  : ""}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleStatusChange("draft")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Save size={14} /> {t("mr.saveDraft")}
          </button>
          <button onClick={() => setRegenOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <RefreshCw size={14} /> {t("mr.regenerate")}
          </button>
          {material.status !== "approved" && material.status !== "published" && (
            <button onClick={() => handleStatusChange("approved")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors border border-primary/20">
              <Check size={14} /> {t("mr.approve")}
            </button>
          )}
          {material.status === "approved" && (
            <button onClick={() => handleStatusChange("published")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Globe size={14} /> {t("mr.publish")}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 bg-warning-muted border border-warning/20 rounded-xl p-4 text-sm text-warning-muted-foreground">
        <AlertTriangle size={16} className="shrink-0" />
        {t("mr.aiWarn")}
      </div>

      {/* Compact original source — expands on click */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setOriginalOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
          aria-expanded={originalOpen}
        >
          <span className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <FileText size={16} className="text-muted-foreground" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-medium text-muted-foreground">{t("mr.source")}</span>
            <span className="block text-sm font-semibold truncate">{originalSummary}</span>
          </span>
          <span className="text-xs text-primary font-medium shrink-0 hidden sm:inline">
            {originalOpen ? t("common.hide") : t("common.show")}
          </span>
          {originalOpen
            ? <ChevronUp size={18} className="text-muted-foreground shrink-0" />
            : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
        </button>
        {originalOpen && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="mt-3 bg-muted/30 rounded-xl p-4 text-sm leading-relaxed text-foreground max-h-56 overflow-y-auto">
              {material.originalText}
            </div>
          </div>
        )}
      </div>

      {/* Full-width adapted content */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Tabs.Root
            value={activeTab}
            onValueChange={v => {
              if (v !== "english") stopEnglishAudio();
              setActiveTab(v);
            }}
          >
          <Tabs.List className="flex border-b border-border overflow-x-auto bg-muted/30" aria-label="Seksionet e materialit">
            {tabs.map(tab => (
              <Tabs.Trigger key={tab.id} value={tab.id}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground shrink-0">
                <tab.icon size={13} /> {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="p-5 sm:p-6 min-h-[320px]">
            <Tabs.Content value="simplified">
              <textarea
                value={editedText}
                onChange={e => setEditedText(e.target.value)}
                rows={14}
                className="w-full bg-transparent text-sm sm:text-base leading-relaxed text-foreground outline-none resize-y min-h-[280px]"
                aria-label={t("mr.simplified")}
              />
            </Tabs.Content>
            <Tabs.Content value="summary">
              <p className="text-sm sm:text-base leading-relaxed text-foreground max-w-3xl">{material.summary}</p>
            </Tabs.Content>
            <Tabs.Content value="keypoints">
              <ul className="space-y-2.5 max-w-3xl">
                {material.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm sm:text-base">
                    <Check size={14} className="text-success mt-1 shrink-0" /> {pt}
                  </li>
                ))}
              </ul>
            </Tabs.Content>
            <Tabs.Content value="vocab">
              <div className="grid sm:grid-cols-2 gap-3">
                {material.vocabulary.map(v => (
                  <div key={v.word} className="border border-border rounded-xl p-4">
                    <p className="font-semibold text-sm text-primary mb-1">{v.word}</p>
                    <p className="text-sm text-foreground">{v.definition}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">Shembull: {v.example}</p>
                  </div>
                ))}
              </div>
            </Tabs.Content>
            <Tabs.Content value="quiz">
              <MaterialQuizEditor
                quiz={editedQuiz}
                onChange={setEditedQuiz}
                readOnly={material.status === "published"}
              />
            </Tabs.Content>
            <Tabs.Content value="english">
              {!material.englishText?.trim() ? (
                <p className="text-sm text-muted-foreground">
                  {t("mr.noEnglish")}
                </p>
              ) : (
                <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs font-medium text-muted-foreground">{t("mr.english")}</p>
                    <button
                      type="button"
                      onClick={() => void toggleEnglishAudio()}
                      disabled={enAudioLoading}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 ${
                        enPlaying
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:bg-muted text-primary"
                      }`}
                      aria-label={enPlaying ? t("mr.stop") : t("mr.listen")}
                    >
                      {enAudioLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : enPlaying ? (
                        <Pause size={14} />
                      ) : (
                        <Headphones size={14} />
                      )}
                      {enAudioLoading ? t("mr.preparing") : enPlaying ? t("mr.stop") : t("mr.listen")}
                    </button>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap">
                    {material.englishText}
                  </p>
                </div>
              )}
            </Tabs.Content>
            <Tabs.Content value="visuals">
              {(material.illustrations?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">{t("mr.noVisuals")}</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {material.illustrations.map((src, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-border bg-muted/40 flex items-center justify-center">
                      <img
                        src={src}
                        alt={`${t("mr.visuals")} ${i + 1} — ${material.title}`}
                        className="w-full max-h-[420px] object-contain bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Content>
            <Tabs.Content value="teacher">
              <p className="text-sm sm:text-base leading-relaxed text-foreground max-w-3xl">{material.teacherNotes}</p>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>

      <Dialog.Root open={regenOpen} onOpenChange={setRegenOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6 z-50">
            <Dialog.Title className="font-semibold text-lg mb-4">{t("mr.regenTitle")}</Dialog.Title>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {regenOptions.map(opt => (
                <button key={opt} onClick={() => setCustomInstruction(opt)}
                  className={`text-xs px-3 py-2 rounded-xl border-2 text-left transition-colors ${customInstruction === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <textarea
              value={customInstruction === regenOptions.find(r => r === customInstruction) ? "" : customInstruction}
              onChange={e => setCustomInstruction(e.target.value)}
              placeholder="Shkruaj udhëzim vetjak..."
              rows={2}
              className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground resize-none mb-4"
            />
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">{t("common.cancel")}</button>
              </Dialog.Close>
              <button
                onClick={() => { setRegenOpen(false); toast.success(t("mr.regenerate")); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {t("mr.regenerate")}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <LessonChatbot role="teacher" material={{ ...material, simplifiedText: editedText || material.simplifiedText }} />
    </div>
  );
}
