import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, AlignJustify, Headphones, Focus,
  BookOpen, List, Library, TrendingUp, X, Minus, Plus, ImageIcon, Loader2, Languages,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { toast } from "sonner";
import { useApp } from "./store";
import { aiService, materialService, assignmentService } from "./services";
import { markSessionStart, trackLearningEvent } from "./learningTracker";
import type { Material, VocabWord } from "./types";
import { useT } from "./useT";
import LessonChatbot, { type PreviousLessonContext } from "./LessonChatbot";

export default function ReadingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessibility, user } = useApp();
  const { t } = useT();

  const [material, setMaterial] = useState<Material | null>(null);
  const [previousLessons, setPreviousLessons] = useState<PreviousLessonContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [focusMode, setFocusMode] = useState(false);
  const [currentPara, setCurrentPara] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolume] = useState(80);
  const [speed, setSpeed] = useState(1);
  const [progress, setProgress] = useState(10);
  const [audioProgress, setAudioProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [floatingPos, setFloatingPos] = useState({ x: 0, y: 0 });
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [explainResult, setExplainResult] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [activeWord, setActiveWord] = useState<VocabWord | null>(null);
  const [visualImage, setVisualImage] = useState<string | null>(null);
  const [visualLoading, setVisualLoading] = useState(false);
  const [readLang, setReadLang] = useState<"sq" | "en">("sq");
  const visualLoadedRef = useRef<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlsRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const playingRef = useRef(false);
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const volumeRef = useRef(volume);
  const speedRef = useRef(speed);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const revokeUrls = useCallback((urls: string[]) => {
    urls.forEach(u => URL.revokeObjectURL(u));
  }, []);

  const stopSpeech = useCallback(() => {
    playingRef.current = false;
    setPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }, []);

  const getTextToSpeak = useCallback(() => {
    if (!material) return "";
    const body =
      readLang === "en" && material.englishText?.trim()
        ? material.englishText
        : material.simplifiedText;
    if (focusMode) {
      const paragraphs = body.split(". ").filter(Boolean).map(s => s.trim().replace(/\.$/, "") + ".");
      return paragraphs[currentPara] || body;
    }
    return body;
  }, [material, focusMode, currentPara, readLang]);

  const ensureAudioUrls = useCallback(async (text: string): Promise<string[]> => {
    const cacheKey = `${readLang}::${text}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached?.length) return cached;
    const urls = await aiService.generateAudioChunks(text, readLang);
    cacheRef.current.set(cacheKey, urls);
    return urls;
  }, [readLang]);

  const playChunk = useCallback(async (index: number) => {
    const urls = urlsRef.current;
    if (!urls.length || index >= urls.length) {
      playingRef.current = false;
      setPlaying(false);
      setAudioProgress(100);
      setProgress(p => Math.max(p, 80));
      return;
    }

    chunkIndexRef.current = index;
    setAudioProgress(Math.round((index / urls.length) * 100));

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audioRef.current = audio;
    }

    audio.pause();
    audio.src = urls[index];
    audio.volume = Math.max(0, Math.min(1, volumeRef.current / 100));
    audio.playbackRate = speedRef.current;

    audio.onended = () => {
      if (!playingRef.current) return;
      playChunk(index + 1);
    };
    audio.onerror = () => {
      if (!playingRef.current) return;
      playingRef.current = false;
      setPlaying(false);
      toast.error("Nuk u arrit të luhet audio.");
    };

    try {
      await audio.play();
      playingRef.current = true;
      setPlaying(true);
    } catch {
      playingRef.current = false;
      setPlaying(false);
      toast.error("Shfletuesi bllokoi audion. Provo sërish.");
    }
  }, []);

  const startSpeech = useCallback(async (fromIndex = 0) => {
    if (!material) return;
    const text = getTextToSpeak().trim();
    if (!text) {
      toast.error("Nuk ka tekst për të lexuar.");
      return;
    }

    setAudioLoading(true);
    try {
      const urls = await ensureAudioUrls(text);
      // Revoke previous non-cached urls if we replaced them - keep cache
      urlsRef.current = urls;
      setAudioReady(urls.length > 0);
      playingRef.current = true;
      setPlaying(true);
      if (user && material) {
        trackLearningEvent({
          studentId: user.id,
          materialId: material.id,
          type: "audio",
          detail: "play",
        });
      }
      await playChunk(Math.max(0, Math.min(fromIndex, urls.length - 1)));
    } catch (err) {
      playingRef.current = false;
      setPlaying(false);
      const message = err instanceof Error ? err.message : "Nuk u gjenerua audio.";
      toast.error(message);
    } finally {
      setAudioLoading(false);
    }
  }, [material, getTextToSpeak, ensureAudioUrls, playChunk, user]);

  const togglePlay = useCallback(async () => {
    if (audioLoading) return;

    if (playingRef.current) {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        audio.pause();
        playingRef.current = false;
        setPlaying(false);
        return;
      }
      stopSpeech();
      return;
    }

    // Resume if we have a paused audio mid-chunk
    const audio = audioRef.current;
    if (audio && audio.src && audio.paused && audio.currentTime > 0 && chunkIndexRef.current < urlsRef.current.length) {
      try {
        audio.volume = Math.max(0, Math.min(1, volumeRef.current / 100));
        audio.playbackRate = speedRef.current;
        await audio.play();
        playingRef.current = true;
        setPlaying(true);
        return;
      } catch {
        // fall through to restart
      }
    }

    await startSpeech(chunkIndexRef.current);
  }, [audioLoading, startSpeech, stopSpeech]);

  const skipBack = useCallback(() => {
    const next = Math.max(0, chunkIndexRef.current - 1);
    if (playingRef.current || urlsRef.current.length) {
      if (playingRef.current) playChunk(next);
      else {
        chunkIndexRef.current = next;
        setAudioProgress(urlsRef.current.length ? Math.round((next / urlsRef.current.length) * 100) : 0);
      }
    }
  }, [playChunk]);

  const skipForward = useCallback(() => {
    const next = Math.min(Math.max(0, urlsRef.current.length - 1), chunkIndexRef.current + 1);
    if (playingRef.current || urlsRef.current.length) {
      if (playingRef.current) playChunk(next);
      else {
        chunkIndexRef.current = next;
        setAudioProgress(urlsRef.current.length ? Math.round((next / urlsRef.current.length) * 100) : 0);
      }
    }
  }, [playChunk]);

  // Live volume / speed on current audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    audio.playbackRate = speed;
  }, [volume, speed]);

  useEffect(() => {
    if (!id) return;
    materialService.getById(id).then(async m => {
      setMaterial(m ?? null);
      setLoading(false);
      if (m && user) {
        markSessionStart(user.id, m.id);
        trackLearningEvent({
          studentId: user.id,
          materialId: m.id,
          type: "simplified_view",
          detail: "opened_reading",
        });
        const asgn = await assignmentService.getByMaterialForStudent(m.id, user.id);
        if (asgn) await assignmentService.markInProgress(asgn.id);

        try {
          const allAsgn = await assignmentService.getForStudent(user.id);
          const others = allAsgn.filter(a => a.materialId !== m.id).slice(0, 10);
          const prior: PreviousLessonContext[] = [];
          for (const a of others) {
            const mat = await materialService.getById(a.materialId);
            if (mat) {
              prior.push({
                title: mat.title,
                summary: mat.summary || mat.keyPoints?.slice(0, 3).join("; "),
              });
            }
          }
          setPreviousLessons(prior);
        } catch {
          setPreviousLessons([]);
        }
      } else {
        setPreviousLessons([]);
      }
    });
  }, [id, user]);

  const loadVisualForMaterial = useCallback(async (mat: Material) => {
    if (visualLoadedRef.current === mat.id && visualImage) return;

    // Prefer illustrations generated by the teacher during material creation
    if (mat.illustrations?.length) {
      visualLoadedRef.current = mat.id;
      setVisualImage(mat.illustrations[0]);
      return;
    }

    setVisualLoading(true);
    try {
      const url = await aiService.generateIllustration(
        `Educational illustration for children about: ${mat.title}. Subject: ${mat.subject}. Key idea: ${mat.summary || mat.keyPoints?.[0] || mat.simplifiedText.slice(0, 200)}. Simple, clear, no text.`
      );
      visualLoadedRef.current = mat.id;
      setVisualImage(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nuk u gjenerua figura.";
      toast.error(message);
    } finally {
      setVisualLoading(false);
    }
  }, [visualImage]);

  // Never auto-show figure — only when student clicks «Figurë»
  useEffect(() => {
    setVisualImage(null);
    setVisualLoading(false);
    visualLoadedRef.current = null;
  }, [material?.id]);

  useEffect(() => () => {
    stopSpeech();
    cacheRef.current.forEach(urls => revokeUrls(urls));
    cacheRef.current.clear();
  }, [stopSpeech, revokeUrls, id]);

  // Reset audio when focus paragraph changes
  useEffect(() => {
    stopSpeech();
    chunkIndexRef.current = 0;
    setAudioProgress(0);
    urlsRef.current = [];
    setAudioReady(false);
  }, [focusMode, currentPara, stopSpeech]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t("rw.notFound")}</p>
        <button onClick={() => navigate("/student/dashboard")} className="mt-4 text-primary hover:underline text-sm">
          {t("rw.backDashboard")}
        </button>
      </div>
    );
  }

  const paragraphs = (
    readLang === "en" && material.englishText?.trim()
      ? material.englishText
      : material.simplifiedText
  ).split(". ").filter(Boolean).map(s => s.trim().replace(/\.$/, "") + ".");

  const hasEnglish = Boolean(material.englishText?.trim());
  const es = material.enabledSections;
  /** Hide if teacher turned off; otherwise only show when there is content. */
  const showSection = (key: keyof NonNullable<Material["enabledSections"]>, hasContent: boolean) => {
    if (es && es[key] === false) return false;
    return hasContent;
  };
  const audioAllowed = material.audioEnabled !== false;
  const hasSummary = showSection("summary", Boolean(material.summary?.trim()));
  const hasKeyPoints = showSection("keyPoints", (material.keyPoints?.length ?? 0) > 0);
  const hasVocab = showSection("vocab", (material.vocabulary?.length ?? 0) > 0);
  const hasQuiz = showSection("quiz", (material.quiz?.length ?? 0) > 0);
  const hasSidebarContent = hasSummary || hasKeyPoints || hasVocab;
  const sidebarTabs = [
    ...(hasSummary ? [{ id: "summary", icon: BookOpen, label: t("rw.summary") }] : []),
    ...(hasKeyPoints ? [{ id: "keypoints", icon: List, label: t("rw.keyPoints") }] : []),
    ...(hasVocab ? [{ id: "vocab", icon: Library, label: t("rw.vocab") }] : []),
  ];
  const activeSectionSafe =
    activeSection && sidebarTabs.some(tab => tab.id === activeSection) ? activeSection : null;

  const switchLang = (lang: "sq" | "en") => {
    if (lang === readLang) return;
    if (lang === "en" && !hasEnglish) {
      toast.message(t("rw.noEn"));
      return;
    }
    stopSpeech();
    chunkIndexRef.current = 0;
    setAudioProgress(0);
    urlsRef.current = [];
    setAudioReady(false);
    setCurrentPara(0);
    setReadLang(lang);
  };

  const fontFamily = accessibility.readingFont === "lexend"
    ? "var(--font-lexend)"
    : accessibility.readingFont === "atkinson"
    ? "var(--font-atkinson)"
    : "var(--font-ui)";

  const handleTextSelect = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.toString().trim().length < 3) { setFloatingOpen(false); return; }
    const txt = sel.toString().trim();
    setSelectedText(txt);
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setFloatingPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
    setFloatingOpen(true);
  };

  const explainSelected = async (action: string) => {
    setExplaining(true);
    try {
      if (user && material) {
        trackLearningEvent({
          studentId: user.id,
          materialId: material.id,
          type: "explain",
          detail: action,
        });
      }
      const result = await aiService.explainSentence(selectedText, action);
      setExplainResult(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nuk u arrit të shpjegohet teksti.";
      setExplainResult(message);
    } finally {
      setExplaining(false);
      setFloatingOpen(false);
    }
  };

  return (
    <div className="relative pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /> {t("rw.back")}
        </button>
        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{material.title}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setFocusMode(!focusMode)}
            className={`p-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${focusMode ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>
            <Focus size={14} /> {t("rw.focus")}
          </button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Teacher sections — at top; click to reveal content */}
          {hasSidebarContent && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 pt-4 pb-2">
                <p className="text-sm font-bold text-foreground">{t("rw.sectionsTitle")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("rw.sectionsHint")}</p>
              </div>

              <div
                className="px-3 pb-3 flex flex-wrap gap-2"
                role="tablist"
                aria-label={t("rw.sectionsTitle")}
              >
                {sidebarTabs.map(tab => {
                  const active = tab.id === activeSectionSafe;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() =>
                        setActiveSection(prev => (prev === tab.id ? null : tab.id))
                      }
                      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border transition-colors min-h-11 ${
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/40 text-foreground border-border hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <tab.icon size={16} strokeWidth={active ? 2.5 : 2} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {activeSectionSafe && (
                <div className="px-4 sm:px-5 py-4 border-t border-border bg-muted/10" role="tabpanel">
                  {activeSectionSafe === "summary" && hasSummary && (
                    <p className="text-sm sm:text-base leading-relaxed text-foreground">{material.summary}</p>
                  )}
                  {activeSectionSafe === "keypoints" && hasKeyPoints && (
                    <ul className="space-y-2.5">
                      {material.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeSectionSafe === "vocab" && hasVocab && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {material.vocabulary.map(v => (
                        <div key={v.word} className="rounded-xl border border-border bg-card p-3.5">
                          <p className="font-bold text-sm text-primary">{v.word}</p>
                          <p className="text-sm text-foreground mt-1.5 leading-relaxed">{v.definition}</p>
                          {v.example && (
                            <p className="text-xs text-muted-foreground mt-2">{t("rw.example")} {v.example}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reading tools + single audio control */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-2.5 sm:p-3 flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-0.5">
                <button type="button" onClick={() => setFontSize(f => Math.max(14, f - 2))} className="p-2 rounded-lg hover:bg-card transition-colors" aria-label="Zvogëlo tekstin">
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs text-muted-foreground w-9 text-center tabular-nums">{fontSize}</span>
                <button type="button" onClick={() => setFontSize(f => Math.min(28, f + 2))} className="p-2 rounded-lg hover:bg-card transition-colors" aria-label="Zmadhëso tekstin">
                  <ZoomIn size={14} />
                </button>
              </div>

              <div className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-0.5">
                <button type="button" onClick={() => setLineSpacing(s => Math.max(1.4, s - 0.2))} className="p-2 rounded-lg hover:bg-card transition-colors" aria-label="Pakëso hapësirën">
                  <Minus size={14} />
                </button>
                <AlignJustify size={14} className="text-muted-foreground mx-0.5" />
                <button type="button" onClick={() => setLineSpacing(s => Math.min(2.5, s + 0.2))} className="p-2 rounded-lg hover:bg-card transition-colors" aria-label="Rrit hapësirën">
                  <Plus size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-2" />

              {hasEnglish && (
                <div className="flex items-center rounded-xl border border-border overflow-hidden text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => switchLang("sq")}
                    className={`px-2.5 py-1.5 transition-colors ${readLang === "sq" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    SQ
                  </button>
                  <button
                    type="button"
                    onClick={() => switchLang("en")}
                    className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors ${readLang === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <Languages size={12} /> EN
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (visualImage) {
                    setVisualImage(null);
                    visualLoadedRef.current = null;
                    return;
                  }
                  if (material) void loadVisualForMaterial(material);
                }}
                disabled={visualLoading || !material}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-60 ${
                  visualImage ? "bg-primary/10 text-primary border border-primary/20" : "border border-border hover:bg-muted"
                }`}
              >
                {visualLoading ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                {visualImage ? t("rw.hideFigure") : t("rw.showFigure")}
              </button>
            </div>

            {audioAllowed && (
              <div className="border-t border-border px-3 py-2.5 flex items-center gap-2.5 flex-wrap bg-muted/20">
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={audioLoading}
                  className="h-9 min-w-[7.5rem] px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
                  aria-label={playing ? t("rw.stop") : t("rw.listen")}
                >
                  {audioLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : playing ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                  {audioLoading ? t("rw.preparing") : playing ? t("rw.stop") : readLang === "en" ? t("rw.listenEn") : t("rw.listen")}
                </button>

                <button type="button" onClick={skipBack} disabled={audioLoading || !audioReady} className="p-2 rounded-lg hover:bg-muted disabled:opacity-35" aria-label="Pjesa e mëparshme">
                  <SkipBack size={15} />
                </button>

                <div className="flex-1 min-w-[100px] h-1.5 bg-muted rounded-full relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${audioProgress}%` }} />
                </div>

                <button type="button" onClick={skipForward} disabled={audioLoading || !audioReady} className="p-2 rounded-lg hover:bg-muted disabled:opacity-35" aria-label="Pjesa e radhës">
                  <SkipForward size={15} />
                </button>

                <div className="flex items-center gap-1.5">
                  <Volume2 size={14} className="text-muted-foreground shrink-0" />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-16 accent-primary"
                    aria-label={t("rw.volume")}
                  />
                </div>

                <div className="flex gap-0.5 rounded-lg bg-muted/70 p-0.5">
                  {[0.75, 1, 1.25].map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-colors ${
                        speed === s ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(visualLoading || visualImage) && (
            <div className="flex justify-center">
              {visualLoading && !visualImage && (
                <div className="inline-flex flex-col items-center gap-2 px-6 py-8 rounded-2xl border border-dashed border-border text-muted-foreground">
                  <Loader2 size={20} className="animate-spin text-primary" />
                  <span className="text-xs font-medium">{t("rw.creatingImage")}</span>
                </div>
              )}
              {visualImage && (
                <figure className="inline-flex max-w-full rounded-2xl overflow-hidden border border-border bg-card">
                  <img
                    src={visualImage}
                    alt={`Ilustrim për: ${material.title}`}
                    className="block w-auto h-auto max-w-full max-h-[min(320px,45vh)] object-contain"
                  />
                </figure>
              )}
            </div>
          )}

          {/* Focus mode */}
          {focusMode ? (
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col min-h-[280px]">
              <p className="text-xs text-muted-foreground text-center mb-4">{t("rw.paraOf", { n: currentPara + 1, total: paragraphs.length })}</p>
              <div className="flex-1 flex items-center py-6">
                <p className="text-center leading-loose text-foreground mx-auto max-w-prose"
                  style={{ fontSize, lineHeight: lineSpacing, fontFamily }}>
                  {paragraphs[currentPara]}
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                <button onClick={() => setCurrentPara(p => Math.max(0, p - 1))} disabled={currentPara === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">
                  <ChevronLeft size={16} /> {t("rw.prevPara")}
                </button>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {paragraphs.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPara(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentPara ? "bg-primary w-4" : "bg-muted hover:bg-muted-foreground/30"}`}
                      aria-label={t("rw.paraOf", { n: i + 1, total: paragraphs.length })} />
                  ))}
                </div>
                <button onClick={() => setCurrentPara(p => Math.min(paragraphs.length - 1, p + 1))} disabled={currentPara === paragraphs.length - 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">
                  {t("rw.nextPara")} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8"
              onMouseUp={handleTextSelect}>
              <h1 className="text-2xl font-bold mb-6">
                {material.title}
                {readLang === "en" && (
                  <span className="ml-2 text-sm font-semibold text-primary align-middle">EN</span>
                )}
              </h1>
              <div style={{ fontSize, lineHeight: lineSpacing, fontFamily, letterSpacing: `${accessibility.letterSpacing}em` }}>
                {paragraphs.map((para, i) => (
                  <p key={i} className={`mb-4 text-foreground transition-all ${focusMode && i !== currentPara ? "opacity-30" : ""}`}>
                    {readLang === "en" ? (
                      para
                    ) : (
                      para.split(" ").map((word, wi) => {
                      const cleanWord = word.replace(/[.,;:!?]/g, "");
                      const vocabWord = material.vocabulary.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
                      return vocabWord ? (
                        <Popover.Root key={wi} onOpenChange={open => {
                          if (open) {
                            setActiveWord(vocabWord);
                            if (user && material) {
                              trackLearningEvent({
                                studentId: user.id,
                                materialId: material.id,
                                type: "vocab",
                                detail: vocabWord.word,
                              });
                            }
                          } else setActiveWord(null);
                        }}>
                          <Popover.Trigger asChild>
                            <span className="border-b-2 border-dotted border-primary cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors">
                              {word}{" "}
                            </span>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content sideOffset={5} className="bg-card border border-border rounded-2xl p-4 shadow-xl max-w-xs z-50">
                              <p className="font-bold text-primary mb-1">{vocabWord.word}</p>
                              <p className="text-sm text-foreground mb-2">{vocabWord.definition}</p>
                              <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">{t("rw.synonym")}</span> {vocabWord.synonym}</p>
                              <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">{t("rw.example")}</span> {vocabWord.example}</p>
                              <p className="text-xs text-muted-foreground"><span className="font-medium">{t("rw.english")}</span> {vocabWord.translation}</p>
                              <button className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline">
                                <Headphones size={11} /> {t("rw.listenWord")}
                              </button>
                              <Popover.Arrow className="fill-border" />
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <span key={wi}>{word} </span>
                      );
                    })
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Floating action menu for selected text */}
          {floatingOpen && readLang === "sq" && (
            <div className="fixed z-50 ai-chat-toolbar"
              style={{ top: floatingPos.y - 56, left: Math.max(10, floatingPos.x - 140) }}>
              {[
                { label: t("rw.explain"), action: "Shpjego thjeshtë" },
                { label: t("rw.example").replace(":", ""), action: "Jep shembull" },
                { label: t("rw.idea"), action: "Ideja kryesore" },
                { label: t("rw.translate"), action: "Përkthe" },
              ].map(opt => (
                <button key={opt.action} onClick={() => explainSelected(opt.action)}
                  className="ai-chat-action">
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setFloatingOpen(false)} className="p-2 rounded-xl hover:bg-muted min-h-9 min-w-9 flex items-center justify-center" aria-label={t("common.close")}>
                <X size={14} />
              </button>
            </div>
          )}

          {explainResult && (
            <div className="ai-bubble">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-2">{t("rw.aiHelp")}</p>
                  <p className="text-foreground leading-relaxed">{explaining ? t("rw.explaining") : explainResult}</p>
                </div>
                <button onClick={() => setExplainResult("")} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted shrink-0" aria-label={t("common.close")}>
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Start quiz CTA */}
          {hasQuiz && (
          <div className="bg-secondary border border-primary/15 rounded-2xl p-5 flex items-center justify-between gap-3 shadow-sm flex-wrap">
            <div>
              <p className="font-semibold text-secondary-foreground">{t("rw.readyQuiz")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("rw.quizMeta", { n: material.quiz.length })}</p>
            </div>
            <button onClick={() => { setProgress(100); navigate(`/student/quiz/${id}`); }}
              className="bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shrink-0 text-sm shadow-sm">
              {t("rw.startQuiz")}
            </button>
          </div>
          )}
        </div>
      </div>

      <LessonChatbot role="student" material={material} previousLessons={previousLessons} />
    </div>
  );
}
