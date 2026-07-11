import React from "react";
import { useApp } from "./store";
import { User, Bell, Lock, Languages } from "lucide-react";
import { AccessibilityIcon } from "./AccessibilityIcon";
import { useT } from "./useT";

export default function Settings() {
  const { user, accessibility, setAccessibility } = useApp();
  const { t, lang } = useT();
  const isTeacher = user?.role === "teacher";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{t("settings.title")}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">{t("settings.subtitle")}</p>
      </div>

      <section className="ui-card p-5 sm:p-6">
        <h2 className="ui-section-title mb-5 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <User size={16} className="text-primary" />
          </span>
          {t("settings.profile")}
        </h2>
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block">{t("settings.name")}</label>
            <input defaultValue={user?.name} className="ui-input" aria-label={t("settings.name")} />
          </div>
          <div>
            <label className="mb-2 block">{t("settings.email")}</label>
            <input defaultValue={user?.email} type="email" className="ui-input" aria-label={t("settings.email")} />
          </div>
          <button className="ui-btn-primary w-full sm:w-auto">{t("settings.save")}</button>
        </div>
      </section>

      <section className="ui-card p-5 sm:p-6">
        <h2 className="ui-section-title mb-5 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <AccessibilityIcon size={16} className="text-primary" />
          </span>
          {t("settings.accessibility")}
        </h2>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block flex items-center gap-2">
              <Languages size={14} className="text-primary" /> {t("settings.language")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccessibility({ appLanguage: "sq" })}
                className={`min-h-11 py-2.5 rounded-2xl text-sm font-bold border-2 transition-colors ${
                  lang === "sq" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                }`}
              >
                AL · Shqip
              </button>
              <button
                type="button"
                onClick={() => setAccessibility({ appLanguage: "en" })}
                className={`min-h-11 py-2.5 rounded-2xl text-sm font-bold border-2 transition-colors ${
                  lang === "en" ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                }`}
              >
                EN · English
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block">{t("settings.readingFont")}</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ id: "inter", label: "Nunito" }, { id: "lexend", label: "Lexend" }, { id: "atkinson", label: "Atkinson" }].map(f => (
                <button key={f.id} onClick={() => setAccessibility({ readingFont: f.id as "inter" | "lexend" | "atkinson" })}
                  className={`min-h-11 py-2.5 rounded-2xl text-sm font-semibold border-2 transition-colors ${
                    accessibility.readingFont === f.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block">{t("settings.fontSize")}: {accessibility.fontSize}px</label>
            <input type="range" min={12} max={24} step={2} value={accessibility.fontSize}
              onChange={e => setAccessibility({ fontSize: Number(e.target.value) })}
              className="w-full accent-primary h-2" aria-label={t("settings.fontSize")} />
          </div>

          {[
            { label: t("settings.highContrast"), key: "highContrast", val: accessibility.highContrast },
            { label: t("settings.darkMode"), key: "darkMode", val: accessibility.darkMode },
            { label: t("settings.reducedMotion"), key: "reducedMotion", val: accessibility.reducedMotion },
          ].map(s => (
            <label key={s.key} className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border-2 cursor-pointer transition-all min-h-14 ${s.val ? "border-primary bg-primary/5" : "border-border"}`}>
              <span className="text-sm font-semibold">{s.label}</span>
              <div onClick={() => setAccessibility({ [s.key]: !s.val })}
                className={`w-11 h-6 rounded-full relative transition-colors ${s.val ? "bg-primary" : "bg-muted-foreground/25"}`}
                role="switch" aria-checked={s.val} tabIndex={0}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${s.val ? "left-6" : "left-1"}`} />
              </div>
            </label>
          ))}
        </div>
      </section>

      {isTeacher && (
        <section className="ui-card p-5 sm:p-6">
          <h2 className="ui-section-title mb-5 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell size={16} className="text-primary" />
            </span>
            {t("nav.notifications")}
          </h2>
          <div className="space-y-2">
            {(lang === "en"
              ? ["When a student finishes an assignment", "When a student needs support", "Weekly reports"]
              : ["Kur nxënësi përfundon detyrën", "Kur nxënësi ka nevojë për mbështetje", "Raporte javore"]
            ).map(n => (
              <label key={n} className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-border cursor-pointer hover:bg-muted/60 transition-colors min-h-14">
                <span className="text-sm font-medium">{n}</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
              </label>
            ))}
          </div>
        </section>
      )}

      <section className="ui-card p-5 sm:p-6">
        <h2 className="ui-section-title mb-5 flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock size={16} className="text-primary" />
          </span>
          {t("settings.privacy")}
        </h2>
        <div className="space-y-2">
          <button className="w-full text-left px-4 py-3.5 rounded-2xl border border-border hover:bg-muted/60 transition-colors text-sm font-medium min-h-12">
            {t("settings.downloadData")}
          </button>
          <button className="w-full text-left px-4 py-3.5 rounded-2xl border border-destructive/20 text-destructive hover:bg-destructive/5 transition-colors text-sm font-medium min-h-12">
            {t("settings.deleteAccount")}
          </button>
        </div>
      </section>
    </div>
  );
}
