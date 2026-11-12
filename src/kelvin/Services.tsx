"use client";
/**
 * Trust strip + Services. A segmented switch (catalog 04 idea, spring thumb) swaps two divisions.
 * Left: service rows with codes. Right (sticky): a live system visual for that division:
 *  - Electric: a single-line diagram with current flowing (dashed stroke) and a "simulate fault" control.
 *  - HVAC: a canvas airflow field from a wall unit; mode (cool/heat) and fan speed change it.
 */
import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, RotateCcw, Snowflake, Sun, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCopy } from "./lang";
import type { Division } from "./copy";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function SectionHead({ index, eyebrow, title, lede, dark, className }: { index: string; eyebrow: string; title: string; lede?: string; dark?: boolean; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn("max-w-2xl", className)}
    >
      <p className={cn("label flex items-center gap-3", dark ? "text-aire" : "text-voltio")}>
        <span className={dark ? "text-white/40" : "text-grafito/60"}>{index}</span>
        <span aria-hidden className={cn("h-px w-8", dark ? "bg-white/25" : "bg-linea")} />
        {eyebrow}
      </p>
      <h2 className={cn("mt-4 text-[clamp(1.9rem,4vw,3.2rem)] leading-[1.03] font-semibold tracking-[-0.035em]", dark ? "text-white" : "text-tinta")}>{title}</h2>
      {lede ? <p className={cn("mt-4 text-lg leading-relaxed", dark ? "text-white/65" : "text-grafito")}>{lede}</p> : null}
    </motion.div>
  );
}

export function TrustStrip() {
  const { t } = useCopy();
  return (
    <div className="border-b border-linea bg-blanco">
      <dl className="gutter mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {t.trust.map((s, i) => (
          <div key={s.k} className={cn("py-6 md:py-8", i % 2 === 1 && "border-l border-linea pl-5", i >= 2 && "border-t border-linea md:border-t-0", i === 2 && "md:border-l md:pl-5", i > 0 && "md:pl-8")}>
            <dt className="sr-only">{s.k}</dt>
            <dd>
              <span className="text-3xl font-semibold tracking-[-0.04em] text-tinta tabular-nums md:text-4xl">{s.v}</span>
              {s.u ? <span className="ml-1.5 font-mono text-xs text-grafito">{s.u}</span> : null}
              <span className="mt-1 block text-sm text-grafito">{s.k}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── Electric: single-line diagram ─────────────────────── */
function OneLine() {
  const { t } = useCopy();
  const s = t.services.sim.electric;
  const [fault, setFault] = React.useState<number | null>(null);
  const xs = [70, 170, 270, 370];
  return (
    <div className="flex h-full flex-col">
      <svg viewBox="0 0 440 300" className="w-full flex-1" role="img" aria-label={`${s.title}. ${s.caption}`}>
        <defs>
          <pattern id="kv-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width="440" height="300" fill="url(#kv-dots)" />
        {/* service drop → meter → main breaker → bus */}
        <line x1="220" y1="18" x2="220" y2="96" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <line x1="220" y1="18" x2="220" y2="96" stroke="#6f8dff" strokeWidth="2" className="kv-flow" />
        <circle cx="220" cy="46" r="14" fill="#111d33" stroke="rgba(255,255,255,0.35)" />
        <text x="220" y="50" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="var(--font-mono)">kWh</text>
        <text x="244" y="30" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="var(--font-mono)">{s.main.toUpperCase()}</text>
        <rect x="160" y="96" width="120" height="30" rx="6" fill="#1a4df5" />
        <text x="220" y="115" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="var(--font-mono)" fontWeight="600">{s.panel}</text>
        <line x1="70" y1="150" x2="370" y2="150" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
        <line x1="220" y1="126" x2="220" y2="150" stroke="#6f8dff" strokeWidth="2" className="kv-flow" />
        {xs.map((x, i) => {
          const tripped = fault === i;
          return (
            <g key={x}>
              <line x1={x} y1="150" x2={x} y2="176" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
              {/* breaker symbol: open when tripped */}
              <motion.line
                x1={x}
                y1="176"
                x2={x}
                y2="198"
                stroke={tripped ? "#f2683c" : "#fff"}
                strokeWidth="2.5"
                strokeLinecap="round"
                animate={{ rotate: tripped ? -38 : 0 }}
                style={{ originX: `${x}px`, originY: "176px" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              />
              <line x1={x} y1="198" x2={x} y2="246" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              {!tripped && <line x1={x} y1="198" x2={x} y2="246" stroke="#22b8e6" strokeWidth="2" className="kv-flow" />}
              <rect x={x - 47} y="248" width="94" height="26" rx="5" fill={tripped ? "rgba(242,104,60,0.15)" : "rgba(255,255,255,0.06)"} stroke={tripped ? "#f2683c" : "rgba(255,255,255,0.18)"} />
              <text x={x} y="265" textAnchor="middle" fontSize="9" fill={tripped ? "#f2683c" : "rgba(255,255,255,0.85)"} fontFamily="var(--font-mono)">
                {s.circuits[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFault(fault === null ? 2 : null)}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-aire",
            fault === null ? "bg-white/10 text-white hover:bg-white/15" : "bg-calor text-tinta hover:bg-[#ff7b50]",
          )}
        >
          {fault === null ? <Zap className="size-4" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
          {fault === null ? s.fault : s.reset}
        </button>
        <p aria-live="polite" className="font-mono text-xs text-white/60">
          {fault !== null ? s.faultMsg : s.caption}
        </p>
      </div>
    </div>
  );
}

/* ── HVAC: airflow field ───────────────────────────────── */
function Airflow() {
  const { t } = useCopy();
  const s = t.services.sim.hvac;
  const [mode, setMode] = React.useState<"cool" | "heat">("cool");
  const [speed, setSpeed] = React.useState(1);
  const cv = React.useRef<HTMLCanvasElement>(null);
  const cfg = React.useRef({ mode, speed });
  cfg.current = { mode, speed };

  React.useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, visible = true;
    const N = 260;
    const P = Array.from({ length: N }, () => ({ x: 0, y: 0, life: 0, max: 0 }));
    const spawn = (p: (typeof P)[number]) => {
      // From the wall unit outlet (top-left), fanning down/right.
      p.x = w * 0.12 + Math.random() * w * 0.26;
      p.y = h * 0.2 + Math.random() * 8;
      p.life = 0;
      p.max = 140 + Math.random() * 160;
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      P.forEach((p) => {
        spawn(p);
        p.life = Math.random() * p.max;
      });
    };
    // A smooth flow field: jet heading down-right, curling along the floor and back up the far wall.
    const flow = (x: number, y: number, t: number, heat: boolean) => {
      const nx = x / w, ny = y / h;
      let ang = 0.65 + ny * 1.1 - nx * 0.4 + 0.25 * Math.sin(nx * 6 + t * 0.0008) * Math.cos(ny * 5 - t * 0.0006);
      if (ny > 0.78) ang = -0.15 + (nx - 0.5) * 0.6; // along the floor
      if (nx > 0.85) ang = -1.4; // up the far wall
      if (heat) ang -= 0.5; // warm air rises sooner
      return ang;
    };
    let last = performance.now();
    const step = (now: number) => {
      raf = 0;
      const dt = Math.min(48, now - last);
      last = now;
      const { mode: m, speed: sp } = cfg.current;
      const heat = m === "heat";
      const vel = (0.06 + sp * 0.05) * dt;
      ctx.fillStyle = "rgba(17,29,51,0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      for (const p of P) {
        const a = flow(p.x, p.y, now, heat);
        const nx = p.x + Math.cos(a) * vel;
        const ny = p.y + Math.sin(a) * vel;
        const k = p.life / p.max;
        const alpha = Math.sin(Math.PI * k) * 0.85;
        ctx.strokeStyle = heat ? `rgba(242,104,60,${alpha})` : `rgba(34,184,230,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = nx;
        p.y = ny;
        p.life += dt * 0.06 * (1 + sp * 0.4);
        if (p.life > p.max || p.x < 0 || p.x > w || p.y < 0 || p.y > h) spawn(p);
      }
      if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(step);
    };
    const start = () => {
      if (!raf && visible && !document.hidden && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    if (reduce) {
      for (let i = 0; i < 90; i++) step(performance.now() + i * 16);
    } else start();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const setpoint = mode === "cool" ? 72 : 70;
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden rounded-lg border border-white/10">
        <canvas ref={cv} aria-hidden className="absolute inset-0 h-full w-full" />
        {/* wall unit */}
        <div aria-hidden className="absolute top-[10%] left-[10%] h-[9%] w-[32%] rounded-md border border-white/25 bg-white/90 shadow-lg">
          <span className="absolute inset-x-3 bottom-1.5 h-0.5 rounded bg-tinta/20" />
          <span className="absolute top-1.5 right-2 font-mono text-[9px] text-tinta/70">{setpoint}°F</span>
        </div>
        <span aria-hidden className="label absolute right-3 bottom-3 text-white/50">{s.set} {setpoint}°F</span>
        <p className="sr-only">{s.caption}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="radiogroup" aria-label={s.mode} className="flex gap-1 rounded-lg bg-white/8 p-1">
          {(["cool", "heat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "flex min-h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-aire",
                mode === m ? (m === "cool" ? "bg-aire text-tinta" : "bg-calor text-tinta") : "text-white/70 hover:text-white",
              )}
            >
              {m === "cool" ? <Snowflake className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
              {m === "cool" ? s.cool : s.heat}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label={s.fan} className="flex items-center gap-1">
          <span className="label mr-1 text-white/50">{s.fan}</span>
          {s.speeds.map((label, i) => (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={speed === i}
              onClick={() => setSpeed(i)}
              className={cn(
                "min-h-10 rounded-md px-2.5 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-aire",
                speed === i ? "bg-white text-tinta" : "text-white/60 hover:bg-white/10",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Services({ onRequest }: { onRequest: (div: Division, code: string) => void }) {
  const { t } = useCopy();
  const s = t.services;
  const [div, setDiv] = React.useState<Division>("electric");
  const items = div === "electric" ? s.electric : s.hvac;
  const sim = s.sim[div];

  return (
    <section id="servicios" className="relative bg-papel py-20 md:py-28">
      <div className="gutter mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead index={s.index} eyebrow={s.eyebrow} title={s.title} lede={s.lede} />
          {/* Segmented switch */}
          <div role="tablist" aria-label={s.eyebrow} className="relative flex w-full rounded-xl border border-linea bg-blanco p-1.5 md:w-auto">
            {(["electric", "hvac"] as Division[]).map((d) => (
              <button
                key={d}
                role="tab"
                id={`tab-${d}`}
                aria-selected={div === d}
                aria-controls="kv-services-panel"
                type="button"
                onClick={() => setDiv(d)}
                className="relative z-10 flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-voltio md:flex-none"
              >
                {div === d && <motion.span layoutId="kv-seg" className="absolute inset-0 -z-10 rounded-lg bg-tinta" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                {d === "electric" ? <Zap className={cn("size-4", div === d ? "text-voltio-claro" : "text-grafito")} aria-hidden /> : <Snowflake className={cn("size-4", div === d ? "text-aire" : "text-grafito")} aria-hidden />}
                <span className={div === d ? "text-white" : "text-grafito"}>{s.tabs[d]}</span>
              </button>
            ))}
          </div>
        </div>

        <div id="kv-services-panel" role="tabpanel" aria-labelledby={`tab-${div}`} className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          <ul className="divide-y divide-linea border-y border-linea lg:col-span-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((it, i) => (
                <motion.li
                  key={it.code}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.35, delay: i * 0.04, ease: EASE }}
                  className="group grid grid-cols-[4.5rem_1fr_auto] items-start gap-3 py-5"
                >
                  <span className={cn("font-mono text-xs font-medium", div === "electric" ? "text-voltio" : "text-[#0e8fb8]")}>{it.code}</span>
                  <span className="min-w-0">
                    <span className="block text-lg font-semibold tracking-[-0.02em] text-tinta">{it.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-grafito">{it.desc}</span>
                  </span>
                  <a
                    href="#presupuesto"
                    onClick={() => onRequest(div, it.code)}
                    className="flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-tinta opacity-80 transition-[opacity,color] group-hover:opacity-100 hover:text-voltio focus-visible:outline-2 focus-visible:outline-voltio"
                  >
                    <span className="hidden sm:inline">{s.request}</span>
                    <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="lg:sticky lg:top-32 lg:col-span-6 lg:self-start">
            <div className="grid-paper-dark brackets rounded-2xl bg-tinta-2 p-5 text-aire md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="label text-white">{sim.title}</p>
                <p className="label text-white/40">{div === "electric" ? "SLD · 01" : "CFD · lite"}</p>
              </div>
              <div className="mt-4 h-[340px] md:h-[380px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={div} className="h-full" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                    {div === "electric" ? <OneLine /> : <Airflow />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
