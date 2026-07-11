import React from "react";
import {
  Check, Trash2, Copy, ChevronUp, ChevronDown, Plus,
} from "lucide-react";
import type { QuestionType, QuizQuestion } from "./types";
import { useT } from "./useT";

const QUESTION_TYPES: { id: QuestionType; labelKey: string }[] = [
  { id: "multiple", labelKey: "mr.qTypeMultiple" },
  { id: "yesno", labelKey: "mr.qTypeYesNo" },
  { id: "short", labelKey: "mr.qTypeShort" },
  { id: "mainidea", labelKey: "mr.qTypeMainIdea" },
];

function blankQuestion(type: QuestionType = "multiple"): QuizQuestion {
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === "yesno") {
    return {
      id,
      type,
      question: "",
      options: ["Po", "Jo"],
      correct: 0,
      hint: "",
      feedback: "",
    };
  }
  if (type === "short" || type === "mainidea") {
    return {
      id,
      type,
      question: "",
      options: [],
      correct: "",
      hint: "",
      feedback: "",
    };
  }
  return {
    id,
    type: "multiple",
    question: "",
    options: ["", "", "", ""],
    correct: 0,
    hint: "",
    feedback: "",
  };
}

function withType(q: QuizQuestion, type: QuestionType): QuizQuestion {
  if (type === q.type) return q;
  if (type === "yesno") {
    return { ...q, type, options: ["Po", "Jo"], correct: 0 };
  }
  if (type === "short" || type === "mainidea") {
    return { ...q, type, options: [], correct: typeof q.correct === "string" ? q.correct : "" };
  }
  const opts =
    q.options && q.options.length >= 2
      ? [...q.options]
      : ["", "", "", ""];
  while (opts.length < 4) opts.push("");
  return {
    ...q,
    type: "multiple",
    options: opts.slice(0, 4),
    correct: typeof q.correct === "number" ? q.correct : 0,
  };
}

type Props = {
  quiz: QuizQuestion[];
  onChange: (quiz: QuizQuestion[]) => void;
  readOnly?: boolean;
};

export default function MaterialQuizEditor({ quiz, onChange, readOnly }: Props) {
  const { t } = useT();

  const updateAt = (index: number, patch: Partial<QuizQuestion>) => {
    onChange(quiz.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qi: number, oi: number, value: string) => {
    const q = quiz[qi];
    const options = [...(q.options ?? [])];
    options[oi] = value;
    updateAt(qi, { options });
  };

  const addOption = (qi: number) => {
    const q = quiz[qi];
    updateAt(qi, { options: [...(q.options ?? []), ""] });
  };

  const removeOption = (qi: number, oi: number) => {
    const q = quiz[qi];
    const options = (q.options ?? []).filter((_, i) => i !== oi);
    let correct = q.correct;
    if (typeof correct === "number") {
      if (oi === correct) correct = 0;
      else if (oi < correct) correct = correct - 1;
    }
    updateAt(qi, { options, correct });
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= quiz.length) return;
    const copy = [...quiz];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onChange(copy);
  };

  const duplicate = (index: number) => {
    const src = quiz[index];
    const clone: QuizQuestion = {
      ...src,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      options: src.options ? [...src.options] : [],
    };
    const copy = [...quiz];
    copy.splice(index + 1, 0, clone);
    onChange(copy);
  };

  const remove = (index: number) => {
    onChange(quiz.filter((_, i) => i !== index));
  };

  const addQuestion = (type: QuestionType = "multiple") => {
    onChange([...quiz, blankQuestion(type)]);
  };

  const hasOptions = (type: QuestionType) => type === "multiple" || type === "yesno";

  if (readOnly) {
    return (
      <div className="grid sm:grid-cols-2 gap-3">
        {quiz.map((q, i) => (
          <div key={q.id} className="border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("mr.questionN", { n: i + 1 })}</p>
            <p className="text-sm font-medium">{q.question}</p>
            {q.options && q.options.length > 0 && (
              <div className="mt-2 space-y-1">
                {q.options.map((opt, oi) => (
                  <div
                    key={oi}
                    className={`text-xs px-3 py-1.5 rounded-lg ${
                      oi === q.correct
                        ? "bg-success-muted text-success-muted-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {oi === q.correct && <Check size={10} className="inline mr-1" />} {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">{t("mr.quizEditHint")}</p>
        <button
          type="button"
          onClick={() => addQuestion("multiple")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus size={14} /> {t("mr.addQuestion")}
        </button>
      </div>

      {quiz.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">{t("mr.quizEmpty")}</p>
          <button
            type="button"
            onClick={() => addQuestion("multiple")}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("mr.addQuestion")}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {quiz.map((q, i) => (
          <div key={q.id} className="border border-border rounded-2xl p-4 sm:p-5 space-y-3 bg-muted/10">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-muted-foreground">
                  {t("mr.questionN", { n: i + 1 })}
                </span>
                <select
                  value={q.type}
                  onChange={e => updateAt(i, withType(q, e.target.value as QuestionType))}
                  className="text-xs bg-input-background border border-border rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label={t("mr.questionType")}
                >
                  {QUESTION_TYPES.map(opt => (
                    <option key={opt.id} value={opt.id}>{t(opt.labelKey)}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30" aria-label={t("mr.moveUp")}>
                  <ChevronUp size={14} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === quiz.length - 1}
                  className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30" aria-label={t("mr.moveDown")}>
                  <ChevronDown size={14} />
                </button>
                <button type="button" onClick={() => duplicate(i)}
                  className="p-2 rounded-lg border border-border hover:bg-muted" aria-label={t("mr.duplicate")}>
                  <Copy size={14} />
                </button>
                <button type="button" onClick={() => remove(i)}
                  className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-destructive" aria-label={t("mr.deleteQuestion")}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("mr.questionText")}</label>
              <textarea
                value={q.question}
                onChange={e => updateAt(i, { question: e.target.value })}
                rows={2}
                className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
            </div>

            {hasOptions(q.type) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t("mr.options")}</label>
                <div className="space-y-2">
                  {(q.options ?? []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correct === oi}
                        onChange={() => updateAt(i, { correct: oi })}
                        className="accent-primary"
                        aria-label={t("mr.markCorrect")}
                      />
                      <input
                        value={opt}
                        onChange={e => updateOption(i, oi, e.target.value)}
                        className={`flex-1 bg-input-background border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 ${
                          q.correct === oi ? "border-success" : "border-border"
                        }`}
                        placeholder={`${t("mr.option")} ${oi + 1}`}
                      />
                      {q.type === "multiple" && (q.options?.length ?? 0) > 2 && (
                        <button type="button" onClick={() => removeOption(i, oi)}
                          className="p-2 text-muted-foreground hover:text-destructive" aria-label={t("mr.deleteOption")}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {q.type === "multiple" && (q.options?.length ?? 0) < 6 && (
                  <button type="button" onClick={() => addOption(i)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline">
                    + {t("mr.addOption")}
                  </button>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">{t("mr.correctHint")}</p>
              </div>
            )}

            {!hasOptions(q.type) && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("mr.correctAnswer")}</label>
                <input
                  value={String(q.correct ?? "")}
                  onChange={e => updateAt(i, { correct: e.target.value })}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder={t("mr.correctAnswerPlaceholder")}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("mr.hint")}</label>
                <textarea
                  value={q.hint ?? ""}
                  onChange={e => updateAt(i, { hint: e.target.value })}
                  rows={2}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{t("mr.feedback")}</label>
                <textarea
                  value={q.feedback}
                  onChange={e => updateAt(i, { feedback: e.target.value })}
                  rows={2}
                  className="w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
