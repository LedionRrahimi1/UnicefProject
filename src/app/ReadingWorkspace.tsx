import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, AlignJustify, Headphones, Focus,
  BookOpen, List, Library, TrendingUp, X, Minus, Plus,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { useApp } from "./store";
import { aiService, materialService, assignmentService } from "./services";
import type { Material, VocabWord } from "./types";

export default function ReadingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessibility, user } = useApp();

  const [material, setMaterial] = useState<Material | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [floatingPos, setFloatingPos] = useState({ x: 0, y: 0 });
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [explainResult, setExplainResult] = useState("");
  const [explaining, setExplaining] = useState(false);
  const [activeWord, setActiveWord] = useState<VocabWord | null>(null);

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
    if (focusMode) {
      const paragraphs = material.simplifiedText.split(". ").filter(Boolean).map(s => s.trim().replace(/\.$/, "") + ".");
      return paragraphs[currentPara] || material.simplifiedText;
    }
    return material.simplifiedText;
  }, [material, focusMode, currentPara]);

  const ensureAudioUrls = useCallback(async (text: string): Promise<string[]> => {
    const cached = cacheRef.current.get(text);
    if (cached?.length) return cached;
    const urls = await aiService.generateAudioChunks(text);
    cacheRef.current.set(text, urls);
    return urls;
  }, []);

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
      await playChunk(Math.max(0, Math.min(fromIndex, urls.length - 1)));
    } catch (err) {
      playingRef.current = false;
      setPlaying(false);
      const message = err instanceof Error ? err.message : "Nuk u gjenerua audio.";
      toast.error(message);
    } finally {
      setAudioLoading(false);
    }
  }, [material, getTextToSpeak, ensureAudioUrls, playChunk]);

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
        const asgn = await assignmentService.getByMaterialForStudent(m.id, user.id);
        if (asgn) await assignmentService.markInProgress(asgn.id);
      }
    });
  }, [id, user]);

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
        <p className="text-muted-foreground">Materiali nuk u gjet.</p>
        <button onClick={() => navigate("/student/dashboard")} className="mt-4 text-primary hover:underline text-sm">
          ← Kthehu te paneli
        </button>
      </div>
    );
  }

  const paragraphs = material.simplifiedText.split(". ").filter(Boolean).map(s => s.trim().replace(/\.$/, "") + ".");

  const fontFamily = accessibility.readingFont === "lexend"
    ? "Lexend, sans-serif"
    : accessibility.readingFont === "atkinson"
    ? "'Atkinson Hyperlegible', sans-serif"
    : "Inter, sans-serif";

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
    <div className="flex flex-col h-full relative">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /> Kthehu
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
            <Focus size={14} /> Focus
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors" aria-label="Hap sidebar">
            <BookOpen size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-5 flex-1 min-h-0">
        {/* Main reading area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Reading toolbar */}
          <div className="bg-card border border-border rounded-2xl p-3 mb-4 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button onClick={() => setFontSize(f => Math.max(14, f - 2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Zvogëlo tekstin">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs text-muted-foreground w-10 text-center">{fontSize}px</span>
              <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Zmadhëso tekstin">
                <ZoomIn size={14} />
              </button>
            </div>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-1">
              <button onClick={() => setLineSpacing(s => Math.max(1.4, s - 0.2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Pakëso hapësirën">
                <Minus size={14} />
              </button>
              <AlignJustify size={14} className="text-muted-foreground" />
              <button onClick={() => setLineSpacing(s => Math.min(2.5, s + 0.2))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Rrit hapësirën">
                <Plus size={14} />
              </button>
            </div>
            <div className="w-px h-5 bg-border" />
            <button type="button" onClick={togglePlay} disabled={audioLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors disabled:opacity-60 ${playing ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>
              {audioLoading ? (
                <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : playing ? <Pause size={13} /> : <Headphones size={13} />}
              {audioLoading ? "Duke përgatitur..." : playing ? "Ndal" : "Dëgo"}
            </button>
          </div>

          {/* Focus mode */}
          {focusMode ? (
            <div className="flex-1 bg-card border border-border rounded-2xl p-8 flex flex-col">
              <p className="text-xs text-muted-foreground text-center mb-4">Paragrafi {currentPara + 1} nga {paragraphs.length}</p>
              <div className="flex-1 flex items-center">
                <p className="text-center leading-loose text-foreground mx-auto max-w-prose"
                  style={{ fontSize, lineHeight: lineSpacing, fontFamily }}>
                  {paragraphs[currentPara]}
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6">
                <button onClick={() => setCurrentPara(p => Math.max(0, p - 1))} disabled={currentPara === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">
                  <ChevronLeft size={16} /> Paragrafi i mëparshëm
                </button>
                <div className="flex gap-1.5">
                  {paragraphs.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPara(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === currentPara ? "bg-primary w-4" : "bg-muted hover:bg-muted-foreground/30"}`}
                      aria-label={`Paragrafi ${i + 1}`} />
                  ))}
                </div>
                <button onClick={() => setCurrentPara(p => Math.min(paragraphs.length - 1, p + 1))} disabled={currentPara === paragraphs.length - 1}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors disabled:opacity-40">
                  Paragrafi tjetër <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-card border border-border rounded-2xl p-6 sm:p-8 overflow-y-auto"
              onMouseUp={handleTextSelect}>
              <h1 className="text-2xl font-bold mb-6">{material.title}</h1>
              <div style={{ fontSize, lineHeight: lineSpacing, fontFamily, letterSpacing: `${accessibility.letterSpacing}em` }}>
                {paragraphs.map((para, i) => (
                  <p key={i} className={`mb-4 text-foreground transition-all ${focusMode && i !== currentPara ? "opacity-30" : ""}`}>
                    {/* Highlight vocabulary words */}
                    {para.split(" ").map((word, wi) => {
                      const cleanWord = word.replace(/[.,;:!?]/g, "");
                      const vocabWord = material.vocabulary.find(v => v.word.toLowerCase() === cleanWord.toLowerCase());
                      return vocabWord ? (
                        <Popover.Root key={wi} onOpenChange={open => { if (open) setActiveWord(vocabWord); else setActiveWord(null); }}>
                          <Popover.Trigger asChild>
                            <span className="border-b-2 border-dotted border-primary cursor-pointer hover:bg-primary/10 rounded px-0.5 transition-colors">
                              {word}{" "}
                            </span>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content sideOffset={5} className="bg-card border border-border rounded-2xl p-4 shadow-xl max-w-xs z-50">
                              <p className="font-bold text-primary mb-1">{vocabWord.word}</p>
                              <p className="text-sm text-foreground mb-2">{vocabWord.definition}</p>
                              <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Sinonim:</span> {vocabWord.synonym}</p>
                              <p className="text-xs text-muted-foreground mb-1"><span className="font-medium">Shembull:</span> {vocabWord.example}</p>
                              <p className="text-xs text-muted-foreground"><span className="font-medium">Anglisht:</span> {vocabWord.translation}</p>
                              <button className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline">
                                <Headphones size={11} /> Dëgo fjalën
                              </button>
                              <Popover.Arrow className="fill-border" />
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <span key={wi}>{word} </span>
                      );
                    })}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Floating action menu for selected text */}
          {floatingOpen && (
            <div className="fixed z-50 bg-card border border-border rounded-2xl shadow-xl p-2 flex gap-1"
              style={{ top: floatingPos.y - 50, left: Math.max(10, floatingPos.x - 120) }}>
              {[
                { label: "Shpjego", action: "Shpjego thjeshtë" },
                { label: "Shembull", action: "Jep shembull" },
                { label: "Ideja", action: "Ideja kryesore" },
                { label: "Përkthe", action: "Përkthe" },
              ].map(opt => (
                <button key={opt.action} onClick={() => explainSelected(opt.action)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap font-medium">
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setFloatingOpen(false)} className="p-1.5 rounded-lg hover:bg-muted" aria-label="Mbyll">
                <X size={12} />
              </button>
            </div>
          )}

          {explainResult && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm">
              <div className="flex justify-between items-start">
                <p className="text-foreground">{explaining ? "Duke shpjeguar..." : explainResult}</p>
                <button onClick={() => setExplainResult("")} className="text-muted-foreground hover:text-foreground ml-2" aria-label="Mbyll">
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Audio player */}
          <div className="mt-4 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <Headphones size={12} />
              {audioLoading
                ? "Duke gjeneruar zërin në shqip... (disa sekonda)"
                : "Dëgjo tekstin me zë në shqip. Mund të ndryshosh volumin dhe shpejtësinë."}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={togglePlay} disabled={audioLoading}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-60" aria-label={playing ? "Ndal" : "Luaj"}>
                {audioLoading ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : playing ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button type="button" onClick={skipBack} disabled={audioLoading || !audioReady} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40" aria-label="Pjesa e mëparshme">
                <SkipBack size={16} />
              </button>
              <div className="flex-1 h-1.5 bg-muted rounded-full relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${audioProgress}%` }} />
              </div>
              <button type="button" onClick={skipForward} disabled={audioLoading || !audioReady} className="p-2 rounded-lg hover:bg-muted disabled:opacity-40" aria-label="Pjesa e radhës">
                <SkipForward size={16} />
              </button>
              <div className="flex items-center gap-1">
                <Volume2 size={14} className="text-muted-foreground" />
                <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
                  className="w-16 accent-primary" aria-label="Volumi" />
              </div>
              <div className="flex gap-1">
                {[0.75, 1, 1.25].map(s => (
                  <button type="button" key={s} onClick={() => setSpeed(s)}
                    className={`text-xs px-2 py-1 rounded-lg transition-colors ${speed === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start quiz CTA */}
          <div className="mt-4 bg-secondary border border-primary/15 rounded-2xl p-5 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <p className="font-semibold text-secondary-foreground">Je gati për pyetjet?</p>
              <p className="text-xs text-muted-foreground mt-0.5">{material.quiz.length} pyetje · ~5 minuta</p>
            </div>
            <button onClick={() => { setProgress(100); navigate(`/student/quiz/${id}`); }}
              className="bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shrink-0 text-sm shadow-sm">
              Fillo kuizin
            </button>
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 shrink-0 hidden lg:block">
            <div className="bg-card border border-border rounded-2xl overflow-hidden h-full">
              <Tabs.Root defaultValue="summary">
                <Tabs.List className="flex border-b border-border bg-muted/30" aria-label="Informacion shtesë">
                  {[
                    { id: "summary", icon: BookOpen, label: "Përmbledhje" },
                    { id: "keypoints", icon: List, label: "Pikat" },
                    { id: "vocab", icon: Library, label: "Fjalor" },
                  ].map(tab => (
                    <Tabs.Trigger key={tab.id} value={tab.id}
                      className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground transition-colors">
                      <tab.icon size={14} /> {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 52px)" }}>
                  <Tabs.Content value="summary">
                    <p className="text-sm leading-relaxed text-foreground">{material.summary}</p>
                  </Tabs.Content>
                  <Tabs.Content value="keypoints">
                    <ul className="space-y-2">
                      {material.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </Tabs.Content>
                  <Tabs.Content value="vocab">
                    <div className="space-y-3">
                      {material.vocabulary.map(v => (
                        <div key={v.word} className="border border-border rounded-xl p-3">
                          <p className="font-semibold text-sm text-primary">{v.word}</p>
                          <p className="text-xs text-foreground mt-1">{v.definition}</p>
                        </div>
                      ))}
                    </div>
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
