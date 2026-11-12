"use client";
/**
 * Utility bar (dark ink, mono: emergencies + phone + language) and a light sticky nav whose active
 * link gets an underline that slides (motion layoutId). Distinct from the pill nav used before.
 */
import * as React from "react";
import { motion } from "motion/react";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "./lang";
import type { Lang } from "./copy";

export function KelvinMark({ className }: { className?: string }) {
  // A square "meter" with a K-shaped waveform: half bolt, half thermometer trace.
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="currentColor" />
      <path d="M10 8v16M10 16.5 20.5 8M13.6 13.6 21.5 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="9" r="2" fill="none" stroke="#22b8e6" strokeWidth="1.6" />
    </svg>
  );
}

function LangSwitch() {
  const { lang, setLang, t } = useCopy();
  return (
    <div role="radiogroup" aria-label={t.langLabel} className="flex items-center font-mono text-[11px]">
      {(["es", "en"] as Lang[]).map((l, i) => (
        <React.Fragment key={l}>
          {i > 0 && <span aria-hidden className="px-1 text-white/30">/</span>}
          <button
            type="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => setLang(l)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded uppercase transition-colors focus-visible:outline-2 focus-visible:outline-aire",
              lang === l ? "text-white" : "text-white/45 hover:text-white/80",
            )}
          >
            {l}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useCopy();
  const [active, setActive] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const btn = React.useRef<HTMLButtonElement>(null);
  const links = [
    { href: "#servicios", label: t.nav.services },
    { href: "#por-que", label: t.nav.why },
    { href: "#proceso", label: t.nav.process },
    { href: "#proyectos", label: t.nav.projects },
    { href: "#contacto", label: t.nav.contact },
  ];

  // Highlight the section in view.
  React.useEffect(() => {
    const ids = ["servicios", "por-que", "proceso", "proyectos", "contacto"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  return (
    <header className="sticky z-50" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="bg-tinta text-white">
        <div className="gutter mx-auto flex h-9 max-w-7xl items-center justify-between gap-4 font-mono text-[11px]">
          <p className="flex min-w-0 items-center gap-2 truncate">
            <span aria-hidden className="kv-blink size-1.5 shrink-0 rounded-full bg-calor" />
            <span className="uppercase tracking-[0.08em]">{t.utility.emergency}</span>
            <span className="hidden text-white/40 sm:inline">·</span>
            <span className="hidden text-white/70 sm:inline">{t.utility.area}</span>
          </p>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 text-white/80 md:flex">
              <Phone className="size-3" aria-hidden />
              <span className="tabular-nums">{t.utility.phone}</span>
              <span className="text-white/40">({t.utility.phoneNote})</span>
            </span>
            <LangSwitch />
          </div>
        </div>
      </div>
      <div className="border-b border-linea bg-papel/90 backdrop-blur-xl">
        <div className="gutter mx-auto flex h-16 max-w-7xl items-center justify-between gap-6">
          <a href="#inicio" className="flex min-h-12 items-center gap-2.5 text-tinta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-voltio">
            <KelvinMark className="size-8 text-voltio" />
            <span className="text-lg font-semibold tracking-[-0.03em]">
              Kelvin<span className="ml-1.5 font-mono text-[11px] font-normal tracking-normal text-grafito">ELEC · HVAC</span>
            </span>
          </a>
          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((l) => (
                <li key={l.href} className="relative">
                  <a
                    href={l.href}
                    aria-current={active === l.href ? "true" : undefined}
                    className={cn(
                      "flex h-12 items-center px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-voltio",
                      active === l.href ? "text-tinta" : "text-grafito hover:text-tinta",
                    )}
                  >
                    {l.label}
                  </a>
                  {active === l.href && (
                    <motion.span layoutId="kv-underline" className="absolute inset-x-3.5 bottom-2 h-0.5 rounded bg-voltio" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href="#presupuesto"
              className="hidden h-11 items-center rounded-lg bg-voltio px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(26,77,245,0.7)] transition-[background-color,transform] duration-200 hover:bg-[#0f3fe0] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voltio sm:flex"
            >
              {t.nav.quote}
            </a>
            <button
              ref={btn}
              type="button"
              aria-expanded={open}
              aria-controls="kv-menu"
              aria-label={t.menu}
              onClick={() => setOpen((o) => !o)}
              className="flex size-12 items-center justify-center rounded-lg text-tinta focus-visible:outline-2 focus-visible:outline-voltio lg:hidden"
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
        <div id="kv-menu" hidden={!open} className="gutter border-t border-linea pb-5 lg:hidden">
          <ul>
            {[...links, { href: "#presupuesto", label: t.nav.quote }].map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="flex min-h-12 items-center border-b border-linea text-base font-medium text-tinta">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
