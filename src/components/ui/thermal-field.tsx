"use client";
/**
 * ThermalField — catalog 06 (Contour map hero) re-purposed as a live thermal map.
 * Same marching-squares engine over a drifting scalar field, but the field is temperature:
 * slow-moving heat sources, and the pointer is a cooling probe that opens a cool pocket.
 * Isotherms are colored on a cool→warm scale (aire → voltio → calor) and a mono readout shows
 * the temperature under the probe. Pauses off-screen / hidden tab; reduced motion = one still frame.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

type Side = "T" | "R" | "B" | "L";
type Point = [number, number];
const SEG: Record<number, [Side, Side][]> = {
  1: [["L", "B"]], 2: [["B", "R"]], 3: [["L", "R"]], 4: [["T", "R"]], 5: [["T", "L"], ["B", "R"]],
  6: [["T", "B"]], 7: [["T", "L"]], 8: [["T", "L"]], 9: [["T", "B"]], 10: [["T", "R"], ["L", "B"]],
  11: [["T", "R"]], 12: [["L", "R"]], 13: [["B", "R"]], 14: [["L", "B"]],
};

// Heat sources in a 1200×700 design space (a sunny wall, a window, an appliance).
const SOURCES = [
  { x: 1020, y: 210, h: 820, s: 210, ax: 28, ay: 18, f: 0.0004 },
  { x: 760, y: 560, h: 520, s: 160, ax: 22, ay: 26, f: 0.00052 },
  { x: 260, y: 160, h: 380, s: 200, ax: 30, ay: 14, f: 0.00034 },
];

// Cool → warm stops for isotherm color (aire, voltio, grafito-violet, calor).
const STOPS: [number, number, number][] = [
  [34, 184, 230],
  [26, 77, 245],
  [120, 90, 200],
  [242, 104, 60],
];
function tint(u: number, a: number) {
  const x = Math.min(0.999, Math.max(0, u)) * (STOPS.length - 1);
  const i = Math.floor(x);
  const f = x - i;
  const c = STOPS[i].map((v, k) => Math.round(v + (STOPS[i + 1][k] - v) * f));
  return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
}

const W = 1200;
const H = 700;
const C = 14;
const LEVELS = 12;
const MAX = 1200;
/** Field value → °F for the readout (a 68–95 °F room). */
const toF = (e: number) => 68 + (Math.max(0, Math.min(MAX, e)) / MAX) * 27;

export function ThermalField({
  className,
  unit = "F",
  label,
  hint,
}: {
  className?: string;
  unit?: "F" | "C";
  label: string;
  hint: string;
}) {
  const wrap = React.useRef<HTMLDivElement>(null);
  const cv = React.useRef<HTMLCanvasElement>(null);
  const pin = React.useRef<HTMLDivElement>(null);
  const tEl = React.useRef<HTMLSpanElement>(null);
  const unitRef = React.useRef(unit);
  unitRef.current = unit;

  React.useEffect(() => {
    const host = wrap.current?.parentElement;
    const canvas = cv.current;
    const p = pin.current;
    const out = tEl.current;
    if (!host || !canvas || !p || !out) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Integer grid size: a fractional nx would make v[j * nx + i] read undefined (straight-line artifacts).
    const nx = Math.floor(W / C) + 1;
    const ny = Math.floor(H / C) + 1;
    const v = new Float32Array(nx * ny);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ptr = { x: 900, y: 360, tx: 900, ty: 360, k: 0, over: false };
    let sc = 1, ox = 0, oy = 0, dpr = 1, raf = 0, visible = true;
    const t0 = performance.now();

    const field = (x: number, y: number, t: number) => {
      let e = 260 + 90 * Math.sin(x * 0.009 + t * 0.00016) * Math.sin(y * 0.011 - t * 0.00012) + 40 * Math.sin(x * 0.021 + y * 0.017 + t * 0.0002);
      for (let i = 0; i < SOURCES.length; i++) {
        const s = SOURCES[i];
        const sx = s.x + s.ax * Math.sin(t * s.f + i);
        const sy = s.y + s.ay * Math.cos(t * s.f * 1.3 + i);
        const dx = (x - sx) * 0.85, dy = y - sy;
        e += s.h * Math.exp(-(dx * dx + dy * dy) / (2 * s.s * s.s));
      }
      const bx = x - ptr.x, by = y - ptr.y;
      e -= ptr.k * 520 * Math.exp(-(bx * bx + by * by) / (2 * 130 * 130)); // the cooling probe
      return e;
    };

    const size = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, r.width * dpr);
      canvas.height = Math.max(1, r.height * dpr);
      sc = Math.max(r.width / W, r.height / H);
      ox = (r.width - W * sc) / 2;
      oy = (r.height - H * sc) / 2;
    };

    const lerp = (a: number, b: number, L: number) => (L - a) / (b - a);
    const draw = (t: number, reveal: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * sc, 0, 0, dpr * sc, dpr * ox, dpr * oy);
      ctx.save();
      if (reveal < 1) {
        ctx.beginPath();
        ctx.arc(900, 360, reveal * 1400, 0, 6.2832);
        ctx.clip();
      }
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v[j * nx + i] = field(i * C, j * C, t);
      ctx.lineCap = "round";
      for (let n = 1; n <= LEVELS; n++) {
        const L = (n / (LEVELS + 1)) * MAX;
        const major = n % 4 === 0;
        ctx.beginPath();
        for (let j = 0; j < ny - 1; j++) {
          for (let i = 0; i < nx - 1; i++) {
            const a = v[j * nx + i], b = v[j * nx + i + 1], cc = v[(j + 1) * nx + i + 1], e = v[(j + 1) * nx + i];
            const s = SEG[(a > L ? 8 : 0) + (b > L ? 4 : 0) + (cc > L ? 2 : 0) + (e > L ? 1 : 0)];
            if (!s) continue;
            const x0 = i * C, y0 = j * C;
            const pt: Record<Side, Point> = {
              T: [x0 + C * lerp(a, b, L), y0],
              R: [x0 + C, y0 + C * lerp(b, cc, L)],
              B: [x0 + C * lerp(e, cc, L), y0 + C],
              L: [x0, y0 + C * lerp(a, e, L)],
            };
            for (const [s1, s2] of s) {
              ctx.moveTo(pt[s1][0], pt[s1][1]);
              ctx.lineTo(pt[s2][0], pt[s2][1]);
            }
          }
        }
        ctx.strokeStyle = tint(n / LEVELS, major ? 0.95 : 0.6);
        ctx.lineWidth = (major ? 2 : 1.25) / sc;
        ctx.stroke();
      }
      ctx.restore();
    };

    const readout = (t: number) => {
      const f = toF(field(ptr.tx, ptr.ty, t));
      out.textContent = unitRef.current === "F" ? `${f.toFixed(1)} °F` : `${(((f - 32) * 5) / 9).toFixed(1)} °C`;
    };
    const place = () => {
      p.style.transform = `translate(${ox + ptr.tx * sc}px, ${oy + ptr.ty * sc}px)`;
    };

    const frame = (now: number) => {
      raf = 0;
      const t = Math.max(0, now - t0);
      const r = 1 - Math.pow(1 - Math.min(1, t / 2200), 3);
      ptr.x += (ptr.tx - ptr.x) * 0.09;
      ptr.y += (ptr.ty - ptr.y) * 0.09;
      ptr.k += ((ptr.over ? 1 : 0.35) - ptr.k) * 0.05;
      draw(t, r);
      readout(t);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!reduce && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      ptr.tx = (e.clientX - r.left - ox) / sc;
      ptr.ty = (e.clientY - r.top - oy) / sc;
      ptr.over = true;
      p.style.opacity = "1";
      place();
      if (reduce) {
        ptr.x = ptr.tx;
        ptr.y = ptr.ty;
        ptr.k = 1;
        draw(8000, 1);
        readout(8000);
      }
    };
    const onLeave = () => (ptr.over = false);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      size();
      place();
      if (reduce) draw(8000, 1);
    });
    ro.observe(host);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
    });
    io.observe(host);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);

    size();
    place();
    if (reduce) {
      ptr.k = 0.35;
      draw(8000, 1);
      readout(8000);
    } else start();

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrap} aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      <div ref={pin} className="absolute top-0 left-0 opacity-0 transition-opacity duration-300 will-change-transform">
        <span className="absolute -top-3 -left-3 block size-6 rounded-full border border-voltio/70" />
        <span className="absolute -top-px -left-5 block h-px w-10 bg-voltio/60" />
        <span className="absolute -top-5 -left-px block h-10 w-px bg-voltio/60" />
        <span className="absolute top-4 left-4 block rounded-md border border-linea bg-blanco/90 px-2 py-1 font-mono text-[11px] whitespace-nowrap text-tinta shadow-sm backdrop-blur">
          {label} · <span ref={tEl} className="font-semibold text-voltio tabular-nums">—</span>
        </span>
      </div>
      <p className="label absolute right-[max(20px,env(safe-area-inset-right,0px))] bottom-5 hidden text-grafito/80 md:block">{hint}</p>
    </div>
  );
}

export default ThermalField;
