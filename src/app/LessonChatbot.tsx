import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { aiService } from "./services";
import type { Material } from "./types";
import type { LessonChatMessage, LessonChatRole } from "./openai";
import { useT } from "./useT";

export interface PreviousLessonContext {
  title: string;
  summary?: string;
}

interface LessonChatbotProps {
  role: LessonChatRole;
  material: Material;
  /** Optional prior lessons (students) for limited cross-lesson help. */
  previousLessons?: PreviousLessonContext[];
}

type UiMessage = LessonChatMessage & { id: string };

function suggestionKeys(role: LessonChatRole): string[] {
  return role === "teacher"
    ? ["chat.sugTeacher1", "chat.sugTeacher2", "chat.sugTeacher3"]
    : ["chat.sugStudent1", "chat.sugStudent2", "chat.sugStudent3"];
}

export default function LessonChatbot({ role, material, previousLessons = [] }: LessonChatbotProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const panelInputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef(0);

  useEffect(() => {
    setMessages([]);
    setInput("");
    setOpen(false);
    setExpanded(false);
    abortRef.current += 1;
  }, [material.id]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, sending]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sending) return;

      const userMsg: UiMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
      };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setOpen(true);
      setSending(true);
      const ticket = ++abortRef.current;

      try {
        const reply = await aiService.lessonChat({
          role,
          materialTitle: material.title,
          subject: material.subject,
          className: material.class,
          simplifiedText: material.simplifiedText || material.originalText || "",
          summary: material.summary,
          keyPoints: material.keyPoints,
          vocabulary: material.vocabulary?.map(v => ({
            word: v.word,
            definition: v.definition,
          })),
          previousLessons,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: text,
        });
        if (ticket !== abortRef.current) return;
        setMessages(prev => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: reply },
        ]);
      } catch (err) {
        if (ticket !== abortRef.current) return;
        const msg = err instanceof Error ? err.message : t("chat.error");
        toast.error(msg);
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      } finally {
        if (ticket === abortRef.current) setSending(false);
      }
    },
    [sending, messages, role, material, previousLessons, t]
  );

  const onPanelKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const suggestions = suggestionKeys(role).map(k => t(k));
  const panelWidth = expanded ? "min(520px, calc(100vw - 1.5rem))" : "min(380px, calc(100vw - 1.5rem))";
  const panelHeight = expanded ? "min(70vh, 640px)" : "min(520px, 62vh)";

  return (
    <>
      {open && (
        <div
          className="fixed z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col rounded-2xl border border-border bg-card shadow-[0_20px_50px_-16px_rgba(15,40,80,0.45)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200"
          style={{ width: panelWidth, height: panelHeight, fontFamily: "var(--font-sans, inherit)" }}
          role="dialog"
          aria-label={t("chat.title")}
        >
          <header className="shrink-0 flex items-center gap-2 px-3.5 py-3 border-b border-border bg-gradient-to-r from-primary/10 via-card to-secondary/40">
            <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{t("chat.title")}</p>
              <p className="text-[11px] text-muted-foreground truncate">{material.title}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={expanded ? t("chat.shrink") : t("chat.expand")}
            >
              {expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t("common.close")}
            >
              <X size={16} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent">
            {messages.length === 0 && !sending && (
              <div className="h-full flex flex-col justify-center gap-4 py-2">
                <div className="text-center px-2">
                  <div className="mx-auto mb-3 h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Bot size={22} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{t("chat.welcomeTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {role === "teacher" ? t("chat.welcomeTeacher") : t("chat.welcomeStudent")}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border border-border hover:border-primary/35 hover:bg-primary/5 text-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted/80 text-foreground border border-border/60 rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm bg-muted/80 border border-border/60 text-muted-foreground flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {t("chat.thinking")}
                </div>
              </div>
            )}
          </div>

          <footer className="shrink-0 border-t border-border p-2.5 bg-card">
            <div className="flex gap-2 items-end">
              <textarea
                ref={panelInputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onPanelKey}
                rows={1}
                disabled={sending}
                placeholder={t("chat.placeholder")}
                className="flex-1 resize-none bg-input-background border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground max-h-28"
                aria-label={t("chat.placeholder")}
              />
              <button
                type="button"
                disabled={sending || !input.trim()}
                onClick={() => void send(input)}
                className="shrink-0 h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors"
                aria-label={t("chat.send")}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">{t("chat.scopeHint")}</p>
          </footer>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            requestAnimationFrame(() => panelInputRef.current?.focus());
          }}
          className="fixed z-40 right-4 bottom-4 sm:right-6 sm:bottom-6 h-14 w-14 rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_rgba(15,40,80,0.5)] flex items-center justify-center hover:bg-primary/90 hover:scale-[1.03] active:scale-[0.98] transition-all"
          aria-label={t("chat.open")}
        >
          <Bot size={26} strokeWidth={2} />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center border-2 border-card">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}
