"use client";
import * as React from "react";
import { COPY, type Copy, type Lang } from "./copy";

const Ctx = React.createContext<{ lang: Lang; t: Copy; setLang: (l: Lang) => void }>({
  lang: "es",
  t: COPY.es,
  setLang: () => {},
});

const KEY = "kelvin-lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("es");

  // Remembered choice is a per-viewer convenience; storage may be blocked, so it is optional.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "es" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const value = React.useMemo(() => ({ lang, t: COPY[lang], setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCopy = () => React.useContext(Ctx);
