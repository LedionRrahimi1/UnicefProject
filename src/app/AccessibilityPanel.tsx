import { X, Type, AlignJustify, Sun, Moon, Eye, Zap, ZapOff } from "lucide-react";
import { useApp } from "./store";
import * as Dialog from "@radix-ui/react-dialog";

const fonts = [
  { id: "inter", label: "Inter" },
  { id: "lexend", label: "Lexend" },
  { id: "atkinson", label: "Atkinson Hyperlegible" },
] as const;

export default function AccessibilityPanel() {
  const { accessibility, setAccessibility, accessibilityOpen, setAccessibilityOpen } = useApp();
  const a = accessibility;

  return (
    <Dialog.Root open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-80 bg-card shadow-2xl z-50 overflow-y-auto flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <Dialog.Title className="font-semibold text-lg text-foreground">Aksesueshmëria</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Mbyll">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-5 flex flex-col gap-6 flex-1">
            {/* Font size */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <Type size={16} className="text-primary" /> Madhësia e tekstit
              </label>
              <div className="flex items-center gap-3">
                <button onClick={() => setAccessibility({ fontSize: Math.max(12, a.fontSize - 2) })}
                  className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors" aria-label="Zvogëlo tekstin">−</button>
                <span className="flex-1 text-center text-sm font-medium">{a.fontSize}px</span>
                <button onClick={() => setAccessibility({ fontSize: Math.min(24, a.fontSize + 2) })}
                  className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-lg font-bold transition-colors" aria-label="Zmadhëso tekstin">+</button>
              </div>
              <input type="range" min={12} max={24} step={2} value={a.fontSize}
                onChange={e => setAccessibility({ fontSize: Number(e.target.value) })}
                className="w-full mt-2 accent-primary" aria-label="Rrëshqitës madhësia e tekstit" />
            </div>

            {/* Line spacing */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-3">
                <AlignJustify size={16} className="text-primary" /> Hapësira midis rreshtave
              </label>
              <div className="flex gap-2">
                {[1.4, 1.6, 1.8, 2.0].map(v => (
                  <button key={v} onClick={() => setAccessibility({ lineSpacing: v })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${a.lineSpacing === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {v}×
                  </button>
                ))}
              </div>
            </div>

            {/* Letter spacing */}
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                <span className="text-primary font-bold text-base">Aa</span> Hapësira midis shkronjave
              </label>
              <div className="flex gap-2">
                {[{ label: "Normal", val: 0 }, { label: "Pak", val: 0.05 }, { label: "Shumë", val: 0.1 }].map(opt => (
                  <button key={opt.val} onClick={() => setAccessibility({ letterSpacing: opt.val })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${a.letterSpacing === opt.val ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading font */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Fonti i leximit</label>
              <div className="flex flex-col gap-2">
                {fonts.map(f => (
                  <button key={f.id} onClick={() => setAccessibility({ readingFont: f.id })}
                    className={`px-3 py-2 rounded-lg text-left text-sm border transition-colors ${a.readingFont === f.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3">
              {[
                { label: "Kontrast i lartë", key: "highContrast", icon: Eye, value: a.highContrast },
                { label: "Modaliteti i errët", key: "darkMode", icon: a.darkMode ? Sun : Moon, value: a.darkMode },
                { label: "Pakëso animacionet", key: "reducedMotion", icon: a.reducedMotion ? ZapOff : Zap, value: a.reducedMotion },
              ].map(item => (
                <button key={item.key}
                  onClick={() => setAccessibility({ [item.key]: !item.value })}
                  role="switch" aria-checked={item.value}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${item.value ? "bg-primary/10 border-primary text-primary" : "border-border hover:bg-muted text-foreground"}`}>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <item.icon size={16} /> {item.label}
                  </span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${item.value ? "bg-primary" : "bg-muted-foreground/30"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${item.value ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setAccessibility({ ...{ fontSize: 16, lineSpacing: 1.6, letterSpacing: 0, highContrast: false, darkMode: false, readingFont: "inter", reducedMotion: false } })}
              className="mt-auto py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
              Rivendos parazgjedhjet
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
