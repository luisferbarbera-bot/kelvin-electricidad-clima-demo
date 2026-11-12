"use client";
/**
 * Why Kelvin (spec-sheet table + 09 Dot graph card as an example maintenance report) ·
 * Process (dark control-room band: a circuit whose current advances with scroll and lights each step) ·
 * Projects (filter chips + masonry at natural aspect ratio, mono spec captions) · Testimonials.
 */
import * as React from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { Award, Eye, HardHat, Headset, ShieldCheck } from "lucide-react";
import DotGraphCard, { type DotDataset } from "@/components/ui/dot-graph-card";
import { cn, src } from "@/lib/utils";
import { useCopy } from "./lang";
import { EASE, SectionHead } from "./Services";
import type { ProjectTag } from "./copy";

import tableroCables from "@/assets/img/tablero-cables.jpg";
import condensadores from "@/assets/img/condensadores.jpg";
import azotea from "@/assets/img/azotea.jpg";
import splitInterior from "@/assets/img/split-interior.jpg";
import tableroIndustrial from "@/assets/img/tablero-industrial.jpg";
import acLadrillo from "@/assets/img/ac-ladrillo.jpg";
import breakers from "@/assets/img/breakers.jpg";
import ventiladorIndustrial from "@/assets/img/ventilador-industrial.jpg";
import casaNoche from "@/assets/img/casa-noche.jpg";
import acEdificio from "@/assets/img/ac-edificio.jpg";
import careta from "@/assets/img/careta.jpg";

const IMGS: Record<string, string> = {
  "tablero-cables": src(tableroCables),
  condensadores: src(condensadores),
  azotea: src(azotea),
  "split-interior": src(splitInterior),
  "tablero-industrial": src(tableroIndustrial),
  "ac-ladrillo": src(acLadrillo),
  breakers: src(breakers),
  "ventilador-industrial": src(ventiladorIndustrial),
  "casa-noche": src(casaNoche),
  "ac-edificio": src(acEdificio),
};

/* ── Why ─────────────────────────────────────────────────── */
const ICONS = [HardHat, Headset, ShieldCheck, Eye, Award];

const pts = (past: number[], current: number[]) => [
  ...past.map((val) => ({ val, type: "past" as const })),
  ...current.map((val) => ({ val, type: "current" as const })),
];

export function Why() {
  const { t, lang } = useCopy();
  const w = t.why;
  const es = lang === "es";
  const datasets: Record<string, DotDataset> = {
    home: {
      value: 18,
      pastLabel: es ? "ANTES 1,240 kWh" : "BEFORE 1,240 kWh",
      currentLabel: es ? "DESPUÉS 1,015 kWh" : "AFTER 1,015 kWh",
      prefixes: es ? ["Antes", "Después"] : ["Before", "After"],
      points: pts([9, 10, 11, 12, 13, 12, 11, 12, 13, 12, 11, 10], [9, 9, 10, 10, 11, 10, 9, 10, 10, 9, 9, 8]),
    },
    shop: {
      value: 12,
      pastLabel: es ? "ANTES 4,800 kWh" : "BEFORE 4,800 kWh",
      currentLabel: es ? "DESPUÉS 4,220 kWh" : "AFTER 4,220 kWh",
      prefixes: es ? ["Antes", "Después"] : ["Before", "After"],
      points: pts([12, 13, 13, 14, 13, 12, 13, 14, 13, 12], [11, 12, 12, 12, 11, 11, 12, 12, 11, 10, 11]),
    },
  };
  return (
    <section id="por-que" className="relative border-t border-linea bg-blanco py-20 md:py-28">
      <div className="gutter mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <SectionHead index={w.index} eyebrow={w.eyebrow} title={w.title} />
          <dl className="mt-10 border-t border-tinta">
            {w.rows.map((r, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={r.k}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
                  className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-1 border-b border-linea py-5 md:grid-cols-[2.5rem_10rem_1fr_auto] md:items-baseline"
                >
                  <span className="row-span-2 flex size-10 items-center justify-center rounded-lg bg-papel text-voltio md:row-span-1 md:self-center">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <dt className="font-semibold text-tinta">{r.k}</dt>
                  <dd className="text-grafito md:col-start-3">{r.v}</dd>
                  <dd className="col-start-2 font-mono text-[11px] text-grafito/80 md:col-start-4 md:text-right">{r.d}</dd>
                </motion.div>
              );
            })}
          </dl>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="lg:col-span-5 lg:pt-28"
        >
          <p className="label mb-3 text-grafito">{w.reportTitle}</p>
          <DotGraphCard
            key={lang}
            datasets={datasets}
            tabs={[
              { key: "home", label: es ? "Casa" : "Home" },
              { key: "shop", label: es ? "Negocio" : "Business" },
            ]}
            defaultTab="home"
            metricLabel={es ? "Consumo de clima" : "Cooling usage"}
            format={(n) => ({ prefix: "−", value: String(n), suffix: "%" })}
            amountFor={(v) => `${v * 95} kWh`}
            style={{
              ["--dgc-bg" as string]: "#f3f5f7",
              ["--dgc-border" as string]: "#d8dee6",
              ["--dgc-ink" as string]: "#0b1424",
              ["--dgc-muted" as string]: "#586273",
              ["--dgc-faint" as string]: "#7d8796",
              ["--dgc-past" as string]: "#b9c3d1",
              ["--dgc-current" as string]: "#1a4df5",
              maxWidth: "100%",
            }}
          />
          <p className="mt-3 text-sm text-grafito">{w.reportNote}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Process ─────────────────────────────────────────────── */
export function Process() {
  const { t } = useCopy();
  const p = t.process;
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const prog = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const fill = useTransform(prog, [0, 1], [0, 1]);
  const pulseX = useTransform(prog, [0, 1], ["0%", "100%"]);
  const [lit, setLit] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);
  useMotionValueEvent(prog, "change", (v) => setLit(Math.round(v * (p.steps.length - 1) + 0.15)));
  const on = (i: number) => reduced || i <= lit;

  return (
    <section id="proceso" ref={ref} className="grid-paper-dark relative overflow-hidden bg-tinta py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(26,77,245,0.35),transparent)]" />
      <div className="gutter relative mx-auto max-w-7xl">
        <SectionHead index={p.index} eyebrow={p.eyebrow} title={p.title} dark />

        <ol className="relative mt-14 grid gap-10 md:mt-20 md:grid-cols-5 md:gap-6">
          {/* the wire (desktop horizontal, mobile vertical) */}
          <div aria-hidden className="absolute top-[22px] right-[10%] left-[10%] hidden h-0.5 bg-white/12 md:block">
            <motion.div className="h-full origin-left bg-gradient-to-r from-voltio to-aire" style={{ scaleX: reduced ? 1 : fill }} />
            {!reduced && (
              <motion.span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-aire shadow-[0_0_18px_4px_rgba(34,184,230,0.7)]" style={{ left: pulseX }} />
            )}
          </div>
          <div aria-hidden className="absolute top-2 bottom-2 left-[21px] w-0.5 bg-white/12 md:hidden">
            <motion.div className="w-full origin-top bg-gradient-to-b from-voltio to-aire" style={{ scaleY: reduced ? 1 : fill, height: "100%" }} />
          </div>
          {p.steps.map((s, i) => (
            <li key={s.k} className="relative grid grid-cols-[44px_1fr] gap-4 md:block">
              <span
                className={cn(
                  "relative z-10 flex size-11 items-center justify-center rounded-full border font-mono text-xs font-semibold transition-[background-color,border-color,color,box-shadow] duration-500 md:mx-auto",
                  on(i) ? "border-aire bg-voltio text-white shadow-[0_0_0_6px_rgba(26,77,245,0.25)]" : "border-white/20 bg-tinta text-white/50",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="md:mt-6 md:text-center">
                <h3 className={cn("text-lg font-semibold tracking-[-0.02em] transition-colors duration-500", on(i) ? "text-white" : "text-white/55")}>{s.k}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{s.v}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Projects ────────────────────────────────────────────── */
export function Projects() {
  const { t } = useCopy();
  const pr = t.projects;
  const [filter, setFilter] = React.useState<"all" | ProjectTag>("all");
  const list = pr.items.filter((it) => filter === "all" || it.tag === filter);
  const tagColor: Record<ProjectTag, string> = { electric: "bg-voltio", hvac: "bg-aire", commercial: "bg-tinta" };
  return (
    <section id="proyectos" className="relative bg-papel py-20 md:py-28">
      <div className="gutter mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHead index={pr.index} eyebrow={pr.eyebrow} title={pr.title} />
          <div role="group" aria-label={pr.eyebrow} className="flex flex-wrap gap-2">
            {(["all", "electric", "hvac", "commercial"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voltio",
                  filter === f ? "border-tinta bg-tinta text-white" : "border-linea bg-blanco text-grafito hover:border-grafito/40 hover:text-tinta",
                )}
              >
                {f !== "all" && <span aria-hidden className={cn("size-2 rounded-full", tagColor[f])} />}
                {pr.filters[f]}
              </button>
            ))}
          </div>
        </div>
        <p className="label mt-6 text-grafito/80">{pr.note}</p>

        <motion.ul layout className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((it) => (
              <motion.li
                key={it.img}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="group mb-4 break-inside-avoid"
              >
                <figure className="overflow-hidden rounded-xl border border-linea bg-blanco">
                  <div className="overflow-hidden">
                    <img src={IMGS[it.img]} alt={it.title} loading="lazy" className="block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
                  </div>
                  <figcaption className="flex items-start justify-between gap-3 px-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-tinta">{it.title}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-grafito">{it.spec}</span>
                    </span>
                    <span className="label mt-0.5 flex shrink-0 items-center gap-1.5 text-[10px] text-grafito">
                      <span aria-hidden className={cn("size-1.5 rounded-full", tagColor[it.tag])} />
                      {pr.filters[it.tag]}
                    </span>
                  </figcaption>
                </figure>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ── Testimonials ────────────────────────────────────────── */
export function Testimonials() {
  const { t } = useCopy();
  const tm = t.testimonials;
  return (
    <section className="relative border-t border-linea bg-blanco py-20 md:py-28">
      <div className="gutter mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead index={tm.index} eyebrow={tm.eyebrow} title={tm.title} />
          <div className="mt-8 hidden overflow-hidden rounded-xl border border-linea lg:block">
            <img src={src(careta)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
        <div className="lg:col-span-8">
          <ul className="grid gap-4 md:grid-cols-2">
            {tm.items.map((r, i) => (
              <motion.li
                key={r.what}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className={cn("flex flex-col rounded-xl border border-linea bg-papel p-6", i === 0 && "md:col-span-2")}
              >
                <p className="label text-voltio">{r.what}</p>
                <blockquote className={cn("mt-4 flex-1 leading-relaxed text-tinta", i === 0 ? "text-xl md:text-2xl md:tracking-[-0.02em]" : "text-base")}>“{r.quote}”</blockquote>
                <p className="mt-5 border-t border-linea pt-4 text-sm text-grafito">{r.who}</p>
              </motion.li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-grafito">{tm.note}</p>
        </div>
      </div>
    </section>
  );
}
