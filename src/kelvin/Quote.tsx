"use client";
/**
 * Quote: a 3-step demo form on the dark control-room band. Step meter on top (segments fill),
 * real labels, inline validation on blur/next, a live "work order" summary that fills as you go,
 * and a demo confirmation that states nothing was sent. Preselected from service rows.
 * Contact + footer: hours, service-area "network" diagram, social links, legal.
 */
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUp, Check, Clock, MapPin, Phone, Snowflake, Zap } from "lucide-react";
import { cn, src } from "@/lib/utils";
import tecnico from "@/assets/img/tecnico-retrato.jpg";
import { useCopy } from "./lang";
import { EASE, SectionHead } from "./Services";
import { KelvinMark } from "./Header";
import type { Division } from "./copy";

export type QuotePreset = { div: Division; code: string } | null;

type Form = { div: Division; code: string; property: number; urgency: number; details: string; name: string; phone: string; email: string; zip: string };
const EMPTY: Form = { div: "electric", code: "EL-03", property: 0, urgency: 1, details: "", name: "", phone: "", email: "", zip: "" };

const field =
  "w-full min-h-12 rounded-lg border border-white/15 bg-white/[0.06] px-4 text-base text-white placeholder:text-white/35 transition-[border-color,background-color] focus:border-aire focus:bg-white/[0.09] focus:outline-none";

export function Quote({ preset }: { preset: QuotePreset }) {
  const { t } = useCopy();
  const q = t.quote;
  const [step, setStep] = React.useState(0);
  const [f, setF] = React.useState<Form>(EMPTY);
  const [errors, setErrors] = React.useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = React.useState(false);
  const top = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!preset) return;
    setF((x) => ({ ...x, div: preset.div, code: preset.code }));
    setStep(0);
    setDone(false);
  }, [preset]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((x) => ({ ...x, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const services = f.div === "electric" ? t.services.electric : t.services.hvac;
  const svc = services.find((s) => s.code === f.code) ?? services[0];

  const validate = (s: number) => {
    const e: Partial<Record<keyof Form, string>> = {};
    if (s === 2) {
      if (!f.name.trim()) e.name = q.required;
      if (f.phone.replace(/\D/g, "").length !== 10) e.phone = q.badPhone;
      if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = q.badEmail;
      if (!/^\d{5}$/.test(f.zip)) e.zip = q.badZip;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    if (step < 2) setStep(step + 1);
    else setDone(true);
    top.current?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const err = (k: keyof Form) =>
    errors[k] ? (
      <p id={`err-${k}`} className="mt-1.5 text-sm text-[#ff9a76]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <section id="presupuesto" className="grid-paper-dark relative overflow-hidden bg-tinta py-20 text-white md:py-28">
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(34,184,230,0.22),transparent)]" />
      <div className="gutter relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <SectionHead index={q.index} eyebrow={q.eyebrow} title={q.title} lede={q.lede} dark />
          {/* Work order summary */}
          <div className="mt-10 hidden rounded-xl border border-white/12 bg-white/[0.04] p-5 font-mono text-sm lg:block">
            <p className="label text-white/50">{q.summary} · WO-0001</p>
            <dl className="mt-4 space-y-2.5">
              {[
                [q.sumKeys[0], t.services.tabs[f.div]],
                [q.sumKeys[1], `${svc.code} ${svc.name}`],
                [q.sumKeys[2], q.properties[f.property]],
                [q.sumKeys[3], q.urgencies[f.urgency]],
                [q.sumKeys[4], f.name || "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-white/45">{k}</dt>
                  <dd className="text-right text-white">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div ref={top} className="scroll-mt-32 lg:col-span-7 lg:col-start-6">
          <div className="rounded-2xl border border-white/12 bg-tinta-2/90 p-5 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur md:p-8">
            {/* step meter */}
            <ol className="grid grid-cols-3 gap-2" aria-label={q.eyebrow}>
              {q.steps.map((s, i) => (
                <li key={s} aria-current={i === step && !done ? "step" : undefined}>
                  <span className="block h-1 overflow-hidden rounded bg-white/10">
                    <motion.span className="block h-full bg-aire" initial={false} animate={{ width: done || i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.5, ease: EASE }} />
                  </span>
                  <span className={cn("label mt-2 block text-[10px]", i <= step || done ? "text-white" : "text-white/40")}>
                    {String(i + 1).padStart(2, "0")} · {s}
                  </span>
                </li>
              ))}
            </ol>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
              className="mt-8"
            >
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.div key="done" role="status" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="py-6 text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-aire text-tinta">
                      <Check className="size-7" aria-hidden />
                    </span>
                    <p className="mt-5 text-2xl font-semibold tracking-[-0.03em]">{q.doneTitle}</p>
                    <p className="mt-2 font-mono text-sm text-white/70">
                      {svc.code} · {svc.name} · {q.urgencies[f.urgency]}
                    </p>
                    <p className="mx-auto mt-4 max-w-md rounded-lg bg-white/[0.06] px-4 py-3 text-sm text-white/70">{q.doneBody}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setF(EMPTY);
                        setStep(0);
                        setDone(false);
                      }}
                      className="mx-auto mt-6 flex min-h-12 items-center gap-2 rounded-lg border border-white/20 px-5 text-sm font-semibold hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-aire"
                    >
                      {q.again}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key={step} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.3, ease: EASE }} className="space-y-6">
                    {step === 0 && (
                      <>
                        <fieldset>
                          <legend className="text-sm font-medium text-white/80">{q.division}</legend>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {(["electric", "hvac"] as Division[]).map((d) => (
                              <button
                                key={d}
                                type="button"
                                aria-pressed={f.div === d}
                                onClick={() => setF((x) => ({ ...x, div: d, code: d === "electric" ? "EL-03" : "AC-06" }))}
                                className={cn(
                                  "flex min-h-14 items-center gap-3 rounded-lg border px-4 text-left font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-aire",
                                  f.div === d ? "border-aire bg-aire/12" : "border-white/12 hover:border-white/30",
                                )}
                              >
                                {d === "electric" ? <Zap className="size-5 text-voltio-claro" aria-hidden /> : <Snowflake className="size-5 text-aire" aria-hidden />}
                                {t.services.tabs[d]}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className="text-sm font-medium text-white/80">{q.service}</legend>
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {services.map((s) => (
                              <button
                                key={s.code}
                                type="button"
                                aria-pressed={f.code === s.code}
                                onClick={() => set("code", s.code)}
                                className={cn(
                                  "flex min-h-12 items-center gap-3 rounded-lg border px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-aire",
                                  f.code === s.code ? "border-aire bg-aire/12 text-white" : "border-white/12 text-white/80 hover:border-white/30",
                                )}
                              >
                                <span className="font-mono text-[11px] text-white/50">{s.code}</span>
                                {s.name}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                      </>
                    )}
                    {step === 1 && (
                      <>
                        <fieldset>
                          <legend className="text-sm font-medium text-white/80">{q.property}</legend>
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {q.properties.map((p, i) => (
                              <button key={p} type="button" aria-pressed={f.property === i} onClick={() => set("property", i)} className={cn("min-h-12 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-aire", f.property === i ? "border-aire bg-aire/12" : "border-white/12 text-white/80 hover:border-white/30")}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                        <fieldset>
                          <legend className="text-sm font-medium text-white/80">{q.urgency}</legend>
                          <div className="mt-3 grid gap-2 sm:grid-cols-3">
                            {q.urgencies.map((u, i) => (
                              <button key={u} type="button" aria-pressed={f.urgency === i} onClick={() => set("urgency", i)} className={cn("flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-aire", f.urgency === i ? (i === 0 ? "border-calor bg-calor/15" : "border-aire bg-aire/12") : "border-white/12 text-white/80 hover:border-white/30")}>
                                {i === 0 && <span aria-hidden className="kv-blink size-1.5 rounded-full bg-calor" />}
                                {u}
                              </button>
                            ))}
                          </div>
                        </fieldset>
                        <div>
                          <label htmlFor="kv-details" className="text-sm font-medium text-white/80">
                            {q.details}
                          </label>
                          <textarea id="kv-details" rows={3} value={f.details} onChange={(e) => set("details", e.target.value)} placeholder={q.detailsPh} className={cn(field, "mt-2 py-3")} />
                        </div>
                      </>
                    )}
                    {step === 2 && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {(
                          [
                            ["name", q.name, "text", "name"],
                            ["phone", q.phone, "tel", "tel"],
                            ["email", q.email, "email", "email"],
                            ["zip", q.zip, "text", "postal-code"],
                          ] as const
                        ).map(([k, label, type, ac]) => (
                          <div key={k}>
                            <label htmlFor={`kv-${k}`} className="text-sm font-medium text-white/80">
                              {label}
                              {k !== "email" && <span aria-hidden className="text-aire"> *</span>}
                            </label>
                            <input
                              id={`kv-${k}`}
                              type={type}
                              autoComplete={ac}
                              inputMode={k === "phone" ? "tel" : k === "zip" ? "numeric" : undefined}
                              value={f[k]}
                              onChange={(e) => set(k, e.target.value)}
                              aria-invalid={!!errors[k]}
                              aria-describedby={errors[k] ? `err-${k}` : undefined}
                              className={cn(field, "mt-2", errors[k] && "border-[#ff9a76]")}
                            />
                            {err(k)}
                          </div>
                        ))}
                        <p className="font-mono text-[11px] text-white/45 sm:col-span-2">{q.privacy}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!done && (
                <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="flex min-h-12 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white/80 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-aire disabled:invisible"
                  >
                    <ArrowLeft className="size-4" aria-hidden />
                    {q.back}
                  </button>
                  <button
                    type="submit"
                    className="flex min-h-12 items-center gap-2 rounded-lg bg-voltio px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-10px_rgba(26,77,245,0.9)] transition-[background-color,transform] hover:bg-[#2f5eff] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-aire"
                  >
                    {step < 2 ? q.next : q.send}
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Contact + footer ───────────────────────────────────── */
// Service-area "network": Midland as the hub, wires out to each town (positions roughly geographic).
const NODES = [
  { x: 210, y: 150 }, // Midland (hub)
  { x: 110, y: 175 }, // Odessa
  { x: 360, y: 110 }, // Big Spring
  { x: 95, y: 60 }, // Andrews
  { x: 290, y: 130 }, // Stanton
  { x: 165, y: 120 }, // Greenwood-ish
];

export function Contact() {
  const { t } = useCopy();
  const c = t.contact;
  return (
    <section id="contacto" className="relative border-t border-linea bg-papel py-20 md:py-28">
      <div className="gutter mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SectionHead index={c.index} eyebrow={c.eyebrow} title={c.title} />
          <dl className="mt-10 space-y-6">
            <div className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-voltio" aria-hidden />
              <div>
                <dt className="label text-grafito">{c.phoneLabel}</dt>
                <dd className="mt-1 font-mono text-xl font-semibold text-tinta tabular-nums select-all">{t.utility.phone}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-voltio" aria-hidden />
              <div>
                <dt className="label text-grafito">{c.addressLabel}</dt>
                <dd className="mt-1 text-tinta">{c.address}</dd>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-voltio" aria-hidden />
              <div className="flex-1">
                <dt className="label text-grafito">{c.hoursLabel}</dt>
                <dd className="mt-2 divide-y divide-linea border-y border-linea">
                  {c.hours.map((h) => (
                    <div key={h.d} className="flex justify-between py-2.5 text-sm">
                      <span className="text-grafito">{h.d}</span>
                      <span className="font-mono font-semibold text-tinta">{h.h}</span>
                    </div>
                  ))}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7">
          <div className="brackets grid-paper overflow-hidden rounded-2xl border border-linea bg-blanco p-5 text-voltio md:p-7">
            <div className="flex items-baseline justify-between">
              <p className="label text-tinta">{c.areasLabel}</p>
              <p className="label text-grafito/70">TX · Permian Basin</p>
            </div>
            <svg viewBox="0 0 440 220" className="mt-4 w-full" role="img" aria-label={`${c.areasLabel}: ${c.areas.join(", ")}`}>
              {NODES.slice(1).map((n, i) => (
                <g key={i}>
                  <line x1={NODES[0].x} y1={NODES[0].y} x2={n.x} y2={n.y} stroke="#d8dee6" strokeWidth="2" />
                  <line x1={NODES[0].x} y1={NODES[0].y} x2={n.x} y2={n.y} stroke="#1a4df5" strokeWidth="2" className="kv-flow" style={{ animationDelay: `${i * 0.2}s` }} />
                </g>
              ))}
              {NODES.map((n, i) => (
                <g key={c.areas[i]}>
                  <circle cx={n.x} cy={n.y} r={i === 0 ? 10 : 6} fill={i === 0 ? "#1a4df5" : "#fff"} stroke="#1a4df5" strokeWidth="2" />
                  {i === 0 && <circle cx={n.x} cy={n.y} r="18" fill="none" stroke="#1a4df5" strokeOpacity="0.25" strokeWidth="2" className="kv-blink" />}
                  <text x={n.x} y={n.y + (i === 0 ? 34 : 22)} textAnchor="middle" fontSize="12" fill="#0b1424" fontFamily="var(--font-mono)">
                    {c.areas[i]}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-4 flex items-center gap-4 border-t border-linea pt-4">
              <img src={src(tecnico)} alt="" loading="lazy" className="size-14 rounded-lg object-cover" />
              <p className="text-sm text-grafito">{t.footer.tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useCopy();
  const socials = ["Facebook", "Instagram", "Google", "Nextdoor"];
  return (
    <footer className="bg-tinta text-white">
      <div className="gutter mx-auto max-w-7xl py-14">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div className="max-w-sm">
            <a href="#inicio" className="flex items-center gap-2.5">
              <KelvinMark className="size-8 text-voltio" />
              <span className="text-lg font-semibold tracking-[-0.03em]">Kelvin</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{t.footer.tagline}</p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <nav aria-label={t.nav.services}>
              <p className="label text-white/45">{t.nav.services}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {[t.services.tabs.electric, t.services.tabs.hvac].map((s) => (
                  <li key={s}>
                    <a href="#servicios" className="flex min-h-9 items-center text-white/75 hover:text-white">{s}</a>
                  </li>
                ))}
                <li>
                  <a href="#presupuesto" className="flex min-h-9 items-center text-white/75 hover:text-white">{t.nav.quote}</a>
                </li>
              </ul>
            </nav>
            <div>
              <p className="label text-white/45">{t.contact.areasLabel}</p>
              <ul className="mt-3 space-y-1 text-sm text-white/75">
                {t.contact.areas.slice(0, 4).map((a) => (
                  <li key={a} className="flex min-h-9 items-center">{a}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label text-white/45">{t.contact.social}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {socials.map((s) => (
                  <li key={s}>
                    <a href="#contacto" className="flex min-h-9 items-center text-white/75 hover:text-white">{s}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{t.footer.legal}</p>
          <p className="font-mono">{t.footer.credit}</p>
          <a href="#inicio" className="flex min-h-11 items-center gap-2 self-start text-white/70 hover:text-white md:self-auto">
            <ArrowUp className="size-4" aria-hidden />
            {t.footer.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
