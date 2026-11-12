"use client";

/**
 * Dot Graph Card (Cue Foundations cue174, via 21st.dev), rebuilt in the lab.
 * A minimal metric card: animated counter, tabs, and a dot-matrix histogram whose dots pop in
 * on a diagonal stagger; hover/focus a column to dim the rest and see its value.
 *
 * Changes vs the original 21st.dev component:
 * - Rendered by React (the original rebuilt the chart with innerHTML on every tab change).
 * - Data via props (`datasets`, `tabs`, `metricLabel`, `format`), defaults = the original demo data.
 * - The "current period" label sits over the first current-period column (never overlapping the past label). The original hard-coded
 *   `left: 215px`, which was wrong for the weekly/daily tabs.
 * - Columns are focusable (roving tabindex, arrow keys) with aria-labels; tooltip works on
 *   keyboard and touch, not only mouse. Tabs are a proper tablist.
 * - Fluid width (max 460px), theming via CSS variables (--dgc-*), font inherits from the page.
 * - Counter respects reduced motion.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export type DotPoint = { val: number; type: "past" | "current"; label?: string; amount?: string };
export type DotDataset = {
  /** Headline number (rendered with `format`). */
  value: number;
  pastLabel: string;
  currentLabel: string;
  /** Prefixes for auto labels, e.g. ["May", "Jun"]. */
  prefixes?: [string, string];
  points: DotPoint[];
};

export interface DotGraphCardProps {
  datasets?: Record<string, DotDataset>;
  /** Tab keys in order, with display names. */
  tabs?: { key: string; label: string }[];
  defaultTab?: string;
  metricLabel?: string;
  /** Headline formatter. Default "+N%". */
  format?: (n: number) => { prefix?: string; value: string; suffix?: string };
  /** Amount shown in the tooltip when a point has none. */
  amountFor?: (val: number) => string;
  className?: string;
  style?: CSSProperties;
}

const pts = (past: number[], current: number[]): DotPoint[] => [
  ...past.map((val) => ({ val, type: "past" as const })),
  ...current.map((val) => ({ val, type: "current" as const })),
];

const DEFAULT_DATASETS: Record<string, DotDataset> = {
  daily: { value: 12, pastLabel: "YESTERDAY $420", currentLabel: "TODAY $680", prefixes: ["Yest", "Today"], points: pts([1, 2, 1, 3, 4, 2, 1, 2, 1], [3, 5, 7, 4, 6, 8, 5, 3, 4]) },
  weekly: { value: 84, pastLabel: "LAST WK $1,120", currentLabel: "THIS WK $2,840", prefixes: ["Last Wk", "This Wk"], points: pts([1, 2, 3, 2, 5, 3, 2, 4, 5, 3, 2, 2], [4, 5, 8, 11, 9, 7, 6, 8, 5, 4, 3, 6]) },
  monthly: {
    value: 326, pastLabel: "MAY $3,250", currentLabel: "JUN $12,392", prefixes: ["May", "Jun"],
    points: pts([2, 2, 2, 3, 6, 8, 3, 2, 4, 5, 3, 2, 2, 1, 1, 1, 2, 3, 2, 1, 2, 1, 1], [3, 4, 5, 7, 13, 9, 7, 8, 6, 5, 4, 4, 3, 2, 2, 1, 2, 1, 4, 2, 3, 4, 5, 4, 3, 4]),
  },
};
const DEFAULT_TABS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);
const defaultFormat = (n: number) => ({ prefix: "+", value: String(n), suffix: "%" });
const defaultAmount = (val: number) => `$${(val * 240 + 100).toLocaleString("en-US")}`;

export default function DotGraphCard({
  datasets = DEFAULT_DATASETS,
  tabs = DEFAULT_TABS,
  defaultTab = "monthly",
  metricLabel = "Revenue",
  format = defaultFormat,
  amountFor = defaultAmount,
  className,
  style,
}: DotGraphCardProps) {
  const uid = useId();
  const [tab, setTab] = useState(defaultTab in datasets ? defaultTab : tabs[0].key);
  const [active, setActive] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const config = datasets[tab];

  // Counter: tweens from the current value to the new one.
  const [shown, setShown] = useState(0);
  const shownRef = useRef(0);
  useEffect(() => {
    const target = config.value;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const from = shownRef.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(Math.max((now - t0) / 1200, 0), 1);
      shownRef.current = Math.round(from + (target - from) * easeOutQuart(p));
      setShown(shownRef.current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [config.value]);

  // Labels: "May 1, May 2 … Jun 1 …", restarting the count at each period.
  const columns = useMemo(() => {
    let count = 0;
    let prev: DotPoint["type"] | null = null;
    const [pp, cp] = config.prefixes ?? ["", ""];
    return config.points.map((p) => {
      count = p.type === prev ? count + 1 : 1;
      prev = p.type;
      return {
        ...p,
        label: p.label ?? `${p.type === "past" ? pp : cp} ${count}`.trim(),
        amount: p.amount ?? amountFor(p.val),
      };
    });
  }, [config, amountFor]);
  const firstCurrent = Math.max(0, columns.findIndex((c) => c.type === "current"));

  // Position the "current" label and the tooltip from real column geometry.
  const graphRef = useRef<HTMLDivElement>(null);
  const pastRef = useRef<HTMLSpanElement>(null);
  const [currentLeft, setCurrentLeft] = useState(0);
  const [tipLeft, setTipLeft] = useState(0);
  const measure = useCallback(() => {
    const g = graphRef.current;
    const col = g?.children[firstCurrent] as HTMLElement | undefined;
    // Never start before the past label ends (short datasets would overlap).
    const pastEnd = (pastRef.current?.offsetWidth ?? 0) + 12;
    if (col) setCurrentLeft(Math.max(col.offsetLeft, pastEnd));
  }, [firstCurrent]);
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (graphRef.current) ro.observe(graphRef.current);
    return () => ro.disconnect();
  }, [measure, tab]);

  const show = (i: number) => {
    setActive(i);
    const col = graphRef.current?.children[i] as HTMLElement | undefined;
    if (col) setTipLeft(col.offsetLeft + col.offsetWidth / 2);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? columns.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const j = Math.max(0, Math.min(columns.length - 1, next));
    setFocusIndex(j);
    (graphRef.current?.children[j] as HTMLElement | undefined)?.focus();
  };

  const f = format(shown);
  const tip = active !== null ? columns[active] : null;

  return (
    <div className={`dgc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div className="dgc-head">
        <div className="dgc-headline">
          <div className="dgc-label">{metricLabel}</div>
          <div className="dgc-value" aria-live="polite">
            {f.prefix}
            <span>{f.value}</span>
            {f.suffix ? <span className="dgc-suffix">{f.suffix}</span> : null}
          </div>
        </div>
        <div className="dgc-tabs" role="tablist" aria-label="Periodo">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              aria-controls={`${uid}-panel`}
              className="dgc-tab"
              onClick={() => { setTab(t.key); setActive(null); setFocusIndex(0); }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="dgc-divider" />
      <div className="dgc-body" id={`${uid}-panel`} role="tabpanel">
        <div className="dgc-tip" aria-hidden style={{ left: tipLeft, opacity: tip ? 1 : 0 }}>
          {tip?.label} <span>{tip?.amount}</span>
        </div>
        <div
          ref={graphRef}
          key={tab}
          className="dgc-graph"
          data-active={active !== null ? "" : undefined}
          onMouseLeave={() => setActive(null)}
        >
          {columns.map((c, i) => (
            <div
              key={i}
              className="dgc-col"
              data-on={active === i ? "" : undefined}
              tabIndex={i === focusIndex ? 0 : -1}
              role="img"
              aria-label={`${c.label}: ${c.amount}`}
              onMouseEnter={() => show(i)}
              onFocus={() => { setFocusIndex(i); show(i); }}
              onBlur={() => setActive(null)}
              onTouchStart={() => show(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {Array.from({ length: c.val }, (_, d) => (
                <span key={d} className={`dgc-dot ${c.type}`} style={{ animationDelay: `${i * 0.02 + d * 0.04}s` }} />
              ))}
            </div>
          ))}
        </div>
        <div className="dgc-axis">
          <span ref={pastRef} className="dgc-past">{config.pastLabel}</span>
          <span className="dgc-current" style={{ left: currentLeft }}>{config.currentLabel}</span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.dgc{--dgc-bg:#f9f9f9;--dgc-border:#eaeaea;--dgc-ink:#111;--dgc-muted:#777;--dgc-faint:#a0a0a0;--dgc-past:#c4c4c4;--dgc-current:#555;
  width:100%;max-width:460px;background:var(--dgc-bg);border:1px solid var(--dgc-border);border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.05);
  display:flex;flex-direction:column;overflow:hidden;position:relative;font-family:inherit;color:var(--dgc-ink)}
.dgc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:24px 28px 20px}
.dgc-headline{display:flex;flex-direction:column;gap:4px}
.dgc-label,.dgc-tab{font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}
.dgc-label{color:var(--dgc-muted)}
.dgc-value{font-size:42px;font-weight:300;line-height:1;letter-spacing:-1px;display:flex;align-items:baseline;font-variant-numeric:tabular-nums}
.dgc-suffix{font-size:24px;margin-left:2px}
.dgc-tabs{display:flex;gap:14px;padding-top:4px}
.dgc-tab{color:var(--dgc-faint);background:none;border:0;padding:6px 0;cursor:pointer;font-family:inherit;transition:color .2s}
.dgc-tab:hover{color:var(--dgc-muted)}.dgc-tab[aria-selected=true]{color:var(--dgc-ink)}
.dgc-tab:focus-visible,.dgc-col:focus-visible{outline:2px solid var(--dgc-ink);outline-offset:3px;border-radius:4px}
.dgc-divider{height:1px;background:var(--dgc-border)}
.dgc-body{padding:32px 28px 24px;position:relative}
.dgc-graph{display:flex;align-items:flex-end;gap:5px;height:120px;position:relative;
  -webkit-mask-image:linear-gradient(to right,#000 85%,transparent);mask-image:linear-gradient(to right,#000 85%,transparent)}
.dgc-col{display:flex;flex-direction:column-reverse;gap:5px;padding-top:20px;margin-top:-20px;cursor:crosshair;transition:opacity .3s ease}
.dgc-graph[data-active] .dgc-col{opacity:.25}.dgc-graph[data-active] .dgc-col[data-on]{opacity:1}
.dgc-col[data-on] .dgc-dot{transform:scale(1.4)}
.dgc-dot{width:4px;height:4px;border-radius:50%;opacity:0;animation:dgc-pop .4s cubic-bezier(.34,1.56,.64,1) forwards;transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.dgc-dot.past{background:var(--dgc-past)}.dgc-dot.current{background:var(--dgc-current)}
@keyframes dgc-pop{0%{opacity:0;transform:translateY(10px) scale(0)}100%{opacity:1;transform:none}}
.dgc-axis{position:relative;height:18px;margin-top:16px;font-size:12px;font-weight:500;font-variant-numeric:tabular-nums}
.dgc-past{color:var(--dgc-faint)}.dgc-current{position:absolute;top:0;color:var(--dgc-ink);white-space:nowrap}
.dgc-tip{position:absolute;top:17px;background:var(--dgc-ink);color:#fff;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:500;
  pointer-events:none;transform:translate(-50%,-100%);transition:opacity .2s;z-index:10;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.dgc-tip span{color:var(--dgc-faint);margin-left:4px}
@media (prefers-reduced-motion:reduce){.dgc-dot{animation:none;opacity:1}.dgc-col,.dgc-tab,.dgc-tip{transition:none}}
`;
