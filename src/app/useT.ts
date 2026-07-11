import { useApp } from "./store";
import { t as translate, type AppLanguage } from "./i18n";

export function useT() {
  const { accessibility } = useApp();
  const lang: AppLanguage = accessibility.appLanguage === "en" ? "en" : "sq";
  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = translate(lang, key);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  };
  return { lang, t, isEn: lang === "en" };
}
