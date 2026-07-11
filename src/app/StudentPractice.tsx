import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronLeft, Layers, RotateCcw } from "lucide-react";
import { learningService, materialService } from "./services";
import type { Flashcard, Material } from "./types";
import { useT } from "./useT";

export default function StudentPractice() {
  const { id } = useParams<{ id: string }>();
  const { t } = useT();
  const [material, setMaterial] = useState<Material | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [m, fc] = await Promise.all([
        materialService.getById(id),
        learningService.getFlashcards(id),
      ]);
      setMaterial(m ?? null);
      setCards(fc);
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

  if (!material) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">{t("sp.notFound")}</p>
        <Link to="/student/dashboard" className="mt-4 text-primary text-sm hover:underline inline-block">← {t("sp.dashboard")}</Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-3">
        <Layers className="mx-auto text-muted-foreground" size={32} />
        <h1 className="text-xl font-bold">{t("sp.noCards")}</h1>
        <p className="text-sm text-muted-foreground">
          Flashcards krijohen kur mësuesja adapton materialin me AI, ose pas Memory Booster në fund të kuizit.
        </p>
        <Link to={`/student/read/${material.id}`} className="text-primary text-sm hover:underline inline-block">{t("sp.backReading")}</Link>
      </div>
    );
  }

  const card = cards[idx];

  return (
    <div className="max-w-lg mx-auto space-y-5 py-4">
      <div className="flex items-center justify-between">
        <Link to="/student/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft size={16} /> {t("sp.dashboard")}
        </Link>
        <p className="text-sm font-medium truncate max-w-[50%]">{material.title}</p>
        <span className="text-xs text-muted-foreground">{idx + 1}/{cards.length}</span>
      </div>

      <button
        type="button"
        onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[220px] rounded-2xl border border-border bg-card p-8 text-center shadow-sm hover:border-primary/40 transition-colors"
      >
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-3">{card.type}</p>
        <p className="text-lg font-semibold text-foreground leading-relaxed">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-muted-foreground mt-6">{t("sp.flip")}</p>
      </button>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={idx === 0}
          onClick={() => { setIdx(i => i - 1); setFlipped(false); }}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted disabled:opacity-40"
        >
          {t("sp.prev")}
        </button>
        <button
          type="button"
          onClick={() => { setIdx(0); setFlipped(false); }}
          className="px-3 py-2.5 rounded-xl border border-border hover:bg-muted"
          aria-label={t("sp.restart")}
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          disabled={idx >= cards.length - 1}
          onClick={() => { setIdx(i => i + 1); setFlipped(false); }}
          className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-40"
        >
          {t("sp.next")}
        </button>
      </div>
    </div>
  );
}
