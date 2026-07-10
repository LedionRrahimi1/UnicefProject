import React from "react";
import { useApp } from "./store";
import { User, Bell, Lock, Palette, Accessibility } from "lucide-react";

export default function Settings() {
  const { user, accessibility, setAccessibility } = useApp();
  const isTeacher = user?.role === "teacher";

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Cilësimet</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Menaxho preferencat e llogarisë tënde.</p>
      </div>

      {/* Profile */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><User size={16} className="text-primary" /> Profili</h2>
        <div className="grid gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Emri</label>
            <input defaultValue={user?.name} className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" aria-label="Emri" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <input defaultValue={user?.email} type="email" className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50" aria-label="Email" />
          </div>
          <button className="bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-xl hover:bg-primary/90 transition-colors w-full sm:w-auto px-6">
            Ruaj ndryshimet
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Accessibility size={16} className="text-primary" /> Aksesueshmëria</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Fonti i leximit</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: "inter", label: "Inter" }, { id: "lexend", label: "Lexend" }, { id: "atkinson", label: "Atkinson" }].map(f => (
                <button key={f.id} onClick={() => setAccessibility({ readingFont: f.id as any })}
                  className={`py-2 rounded-xl text-sm border-2 transition-colors ${accessibility.readingFont === f.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Madhësia e tekstit: {accessibility.fontSize}px</label>
            <input type="range" min={12} max={24} step={2} value={accessibility.fontSize}
              onChange={e => setAccessibility({ fontSize: Number(e.target.value) })}
              className="w-full accent-primary" aria-label="Madhësia e tekstit" />
          </div>

          {[
            { label: "Kontrast i lartë", key: "highContrast", val: accessibility.highContrast },
            { label: "Modaliteti i errët", key: "darkMode", val: accessibility.darkMode },
            { label: "Pakëso animacionet", key: "reducedMotion", val: accessibility.reducedMotion },
          ].map(s => (
            <label key={s.key} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${s.val ? "border-primary bg-primary/5" : "border-border"}`}>
              <span className="text-sm font-medium">{s.label}</span>
              <div onClick={() => setAccessibility({ [s.key]: !s.val })}
                className={`w-10 h-5 rounded-full relative transition-colors ${s.val ? "bg-primary" : "bg-muted-foreground/30"}`}
                role="switch" aria-checked={s.val} tabIndex={0}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.val ? "left-5" : "left-0.5"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {isTeacher && (
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Bell size={16} className="text-primary" /> Njoftimet</h2>
          <div className="space-y-2">
            {["Kur nxënësi përfundon detyrën", "Kur nxënësi ka nevojë për mbështetje", "Raporte javore"].map(n => (
              <label key={n} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border cursor-pointer hover:bg-muted transition-colors">
                <span className="text-sm">{n}</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Privacy */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock size={16} className="text-primary" /> Privatësia</h2>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm">
            Shkarko të dhënat e mia
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors text-sm">
            Fshi llogarinë time
          </button>
        </div>
      </div>
    </div>
  );
}
