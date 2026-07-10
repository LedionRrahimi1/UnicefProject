import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  AlertTriangle, Check, RefreshCw, BookOpen, Save, Globe,
  Headphones, FileText, List, BookMarked, MessageSquare, ChevronLeft,
} from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Dialog from "@radix-ui/react-dialog";
import { materialService } from "./services";
import type { Material } from "./types";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning-muted text-warning-muted-foreground",
  approved: "bg-secondary text-secondary-foreground",
  published: "bg-success-muted text-success-muted-foreground",
};
const statusLabels: Record<string, string> = {
  draft: "Skicë", review: "Në shqyrtim", approved: "Aprovuar", published: "Publikuar",
};

const regenOptions = [
  "Bëje më të shkurtër", "Bëje më të thjeshtë", "Shto shembuj",
  "Ndrysho pyetjet", "Shpjego termat qartë", "Shkruaj udhëzim vetjak",
];

export default function MaterialReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [activeTab, setActiveTab] = useState("simplified");
  const [regenOpen, setRegenOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    materialService.getById(id).then(m => {
      setMaterial(m ?? null);
      setEditedText(m?.simplifiedText ?? "");
      setLoading(false);
    });
  }, [id]);

  const handleStatusChange = async (status: Material["status"]) => {
    if (!material) return;
    // Persist any text edits before publishing
    if (editedText !== material.simplifiedText) {
      await materialService.update(material.id, { simplifiedText: editedText });
    }
    const result = await materialService.updateStatus(material.id, status);
    const updated = await materialService.getById(material.id);
    setMaterial(updated ?? { ...material, status, simplifiedText: editedText });
    if (status === "published") {
      toast.success(
        result.assigned > 0
          ? `Materiali u publikua! ${result.assigned} nxënës e kanë tani si detyrë.`
          : "Materiali u publikua! Nxënësit e klasës e shohin në panel."
      );
    } else {
      toast.success(`Statusi u ndryshua: ${statusLabels[status]}`);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!material) return (
    <div className="text-center py-20">
      <p className="text-muted-foreground">Materiali nuk u gjet.</p>
      <button onClick={() => navigate("/teacher/materials")} className="mt-4 text-primary hover:underline text-sm">
        ← Kthehu te materialet
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <button onClick={() => navigate("/teacher/materials")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ChevronLeft size={14} /> Materialet
          </button>
          <h1 className="text-2xl font-bold">{material.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-muted-foreground">{material.subject} · Klasa {material.class}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[material.status]}`}>
              {statusLabels[material.status]}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleStatusChange("draft")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <Save size={14} /> Ruaj skicën
          </button>
          <button onClick={() => setRegenOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            <RefreshCw size={14} /> Rigjeneroj
          </button>
          {material.status !== "approved" && material.status !== "published" && (
            <button onClick={() => handleStatusChange("approved")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors border border-primary/20">
              <Check size={14} /> Aprovo
            </button>
          )}
          {material.status === "approved" && (
            <button onClick={() => handleStatusChange("published")} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Globe size={14} /> Publiko për nxënësit
            </button>
          )}
        </div>
      </div>

      {/* AI warning */}
      <div className="flex items-center gap-3 bg-warning-muted border border-warning/20 rounded-xl p-4 text-sm text-warning-muted-foreground">
        <AlertTriangle size={16} className="shrink-0" />
        Permbajtja e gjeneruar nga AI mund të përmbajë gabime. Mësuesi duhet ta shqyrtojë para publikimit.
      </div>

      {/* Split view */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Original */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><FileText size={16} className="text-muted-foreground" /> Teksti origjinal</h2>
          <div className="bg-muted/30 rounded-xl p-4 text-sm leading-relaxed text-foreground max-h-60 overflow-y-auto">
            {material.originalText}
          </div>
        </div>

        {/* Adapted with tabs */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="flex border-b border-border overflow-x-auto bg-muted/30" aria-label="Seksionet e materialit">
              {[
                { id: "simplified", icon: FileText, label: "Thjeshtësuar" },
                { id: "summary", icon: BookMarked, label: "Përmbledhje" },
                { id: "keypoints", icon: List, label: "Pikat" },
                { id: "vocab", icon: BookOpen, label: "Fjalor" },
                { id: "quiz", icon: MessageSquare, label: "Kuiz" },
                { id: "teacher", icon: AlertTriangle, label: "Shënime" },
              ].map(tab => (
                <Tabs.Trigger key={tab.id} value={tab.id}
                  className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors data-[state=active]:border-primary data-[state=active]:text-primary border-transparent text-muted-foreground hover:text-foreground shrink-0">
                  <tab.icon size={13} /> {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <div className="p-5">
              <Tabs.Content value="simplified">
                <textarea value={editedText} onChange={e => setEditedText(e.target.value)} rows={8}
                  className="w-full bg-transparent text-sm leading-relaxed text-foreground outline-none resize-none" aria-label="Teksti i thjeshtësuar" />
              </Tabs.Content>
              <Tabs.Content value="summary">
                <p className="text-sm leading-relaxed text-foreground">{material.summary}</p>
              </Tabs.Content>
              <Tabs.Content value="keypoints">
                <ul className="space-y-2">
                  {material.keyPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={14} className="text-success mt-0.5 shrink-0" /> {pt}
                    </li>
                  ))}
                </ul>
              </Tabs.Content>
              <Tabs.Content value="vocab">
                <div className="space-y-3">
                  {material.vocabulary.map(v => (
                    <div key={v.word} className="border border-border rounded-xl p-3">
                      <p className="font-semibold text-sm text-primary mb-1">{v.word}</p>
                      <p className="text-xs text-foreground">{v.definition}</p>
                      <p className="text-xs text-muted-foreground mt-1">Shembull: {v.example}</p>
                    </div>
                  ))}
                </div>
              </Tabs.Content>
              <Tabs.Content value="quiz">
                <div className="space-y-3">
                  {material.quiz.map((q, i) => (
                    <div key={q.id} className="border border-border rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-1">Pyetja {i + 1}</p>
                      <p className="text-sm font-medium">{q.question}</p>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className={`text-xs px-3 py-1.5 rounded-lg ${oi === q.correct ? "bg-success-muted text-success-muted-foreground" : "bg-muted text-muted-foreground"}`}>
                              {oi === q.correct && <Check size={10} className="inline mr-1" />} {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Tabs.Content>
              <Tabs.Content value="teacher">
                <p className="text-sm leading-relaxed text-foreground">{material.teacherNotes}</p>
              </Tabs.Content>
            </div>
          </Tabs.Root>
        </div>
      </div>

      {/* Regenerate modal */}
      <Dialog.Root open={regenOpen} onOpenChange={setRegenOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl border border-border shadow-2xl p-6 z-50">
            <Dialog.Title className="font-semibold text-lg mb-4">Rigjeneroj materialin</Dialog.Title>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {regenOptions.map(opt => (
                <button key={opt} onClick={() => setCustomInstruction(opt)}
                  className={`text-xs px-3 py-2 rounded-xl border-2 text-left transition-colors ${customInstruction === opt ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                  {opt}
                </button>
              ))}
            </div>
            <textarea value={customInstruction === regenOptions.find(r => r === customInstruction) ? "" : customInstruction}
              onChange={e => setCustomInstruction(e.target.value)}
              placeholder="Shkruaj udhëzim vetjak..."
              rows={2} className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground resize-none mb-4" />
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button className="flex-1 py-2.5 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Anulo</button>
              </Dialog.Close>
              <button onClick={() => { setRegenOpen(false); toast.success("Materiali po rigjenerohet..."); }}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Rigjeneroj
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
