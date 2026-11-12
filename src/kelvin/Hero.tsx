"use client";
/**
 * Hero: technical, asymmetric. Grid paper + live ThermalField (catalog 06 re-purposed) behind;
 * headline in two lines (power / air), CTAs (request + call with a copyable number);
 * a field photo in a bracketed instrument frame with live mono readouts.
 */
import * as React from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy, Phone } from "lucide-react";
import { ThermalField } from "@/components/ui/thermal-field";
import { src } from "@/lib/utils";
import heroImg from "@/assets/img/hero-panel.jpg";
import { useCopy } from "./lang";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A live voltage reading that jitters like a real meter (±0.6 V), paused under reduced motion. */
function LiveVolts() {
  const [v, setV] = React.useState(240.0);
  React.useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setV(239.6 + Math.random() * 1.2), 900);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{v.toFixed(1)} V</span>;
}

export function Hero() {
  const { t } = useCopy();
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(t.utility.phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const el = document.getElementById("kv-hero-phone");
      if (el) window.getSelection()?.selectAllChildren(el);
    }
  };

  return (
    <section id="inicio" aria-labelledby="hero-t" className="grid-paper relative overflow-hidden border-b border-linea bg-papel">
      <ThermalField label={t.hero.probe} hint={t.hero.probeHint} />
      {/* Keep the copy side calm: paper fades over the map on the left (top on mobile). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_55%_at_30%_38%,rgba(243,245,247,0.94)_0%,rgba(243,245,247,0.7)_55%,rgba(243,245,247,0)_100%)] lg:bg-[radial-gradient(42%_62%_at_24%_52%,rgba(243,245,247,0.95)_0%,rgba(243,245,247,0.75)_55%,rgba(243,245,247,0)_100%)]" />

      <div className="gutter relative mx-auto grid max-w-7xl items-center gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-6">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="label inline-flex items-center gap-2 rounded-md border border-linea bg-blanco/80 px-2.5 py-1.5 text-grafito">
            <span aria-hidden className="size-1.5 rounded-full bg-aire" />
            {t.hero.tag}
          </motion.p>
          <h1 id="hero-t" className="mt-7 text-[clamp(2.7rem,6.6vw,5.6rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-tinta">
            <motion.span className="block" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE }}>
              {t.hero.title1}
            </motion.span>
            <motion.span className="block text-voltio" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.14, ease: EASE }}>
              {t.hero.title2}
            </motion.span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease: EASE }} className="mt-6 max-w-[34rem] text-lg leading-relaxed text-grafito">
            {t.hero.lede}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35, ease: EASE }} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <a
              href="#presupuesto"
              className="group flex min-h-14 items-center justify-center gap-2 rounded-lg bg-voltio px-7 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(26,77,245,0.8)] transition-[background-color,transform] duration-200 hover:bg-[#0f3fe0] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voltio"
            >
              {t.hero.primary}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </a>
            <div className="flex min-h-14 items-center gap-1 rounded-lg border border-linea bg-blanco pr-1.5 pl-4">
              <Phone className="size-4 text-voltio" aria-hidden />
              <a href={`tel:${t.utility.phone.replace(/\D/g, "")}`} className="flex flex-col px-2 leading-tight focus-visible:outline-2 focus-visible:outline-voltio">
                <span className="text-[11px] text-grafito">
                  {t.hero.call} · {t.hero.callNote}
                </span>
                <span id="kv-hero-phone" className="font-mono text-base font-semibold text-tinta tabular-nums select-all">
                  {t.utility.phone}
                </span>
              </a>
              <button
                type="button"
                onClick={copy}
                aria-label={t.hero.copy}
                className="ml-auto flex size-11 items-center justify-center rounded-md text-grafito transition-colors hover:bg-papel hover:text-tinta focus-visible:outline-2 focus-visible:outline-voltio"
              >
                {copied ? <Check className="size-4 text-voltio" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                <span className="sr-only" aria-live="polite">
                  {copied ? t.hero.copied : ""}
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        <motion.figure
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="brackets relative mx-auto w-full max-w-[400px] text-voltio lg:col-span-4 lg:col-start-9 lg:mt-24"
        >
          <div className="overflow-hidden rounded-xl border border-linea bg-blanco p-2 shadow-[0_30px_80px_-40px_rgba(11,20,36,0.55)]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <img src={src(heroImg)} alt={t.hero.photoAlt} className="h-full w-full object-cover object-[45%_40%]" fetchPriority="high" />
              <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,20,36,0.7))]" />
              <span className="label absolute top-3 left-3 rounded bg-tinta/80 px-2 py-1 text-[10px] text-white backdrop-blur">REC · EL-03</span>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-linea pt-2 font-mono">
              {t.hero.readouts.map((r, i) => (
                <div key={r.k} className="px-3 py-2">
                  <dt className="text-[10px] tracking-[0.08em] text-grafito uppercase">{r.k}</dt>
                  <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-tinta">
                    {i === 0 ? <LiveVolts /> : r.v}
                    {i === 2 ? <span aria-hidden className="kv-blink size-1.5 rounded-full bg-aire" /> : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.figure>
      </div>
    </section>
  );
}
