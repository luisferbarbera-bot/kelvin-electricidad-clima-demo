# Kelvin — technical notes

## Concept
Electrical + HVAC = trust, precision, comfort. The page reads like an engineer's spec sheet: light
grid paper, mono readouts and codes (EL-01, AC-01), one electric-blue accent, cyan only for air/cool
and orange only for heat/faults (semantic colors, never decorative). One deep-ink "control room" band
for process and quote.

## Signature pieces
| Piece | File | What it does |
|---|---|---|
| ThermalField | `components/ui/thermal-field.tsx` | Marching-squares isotherms over a drifting temperature field (heat sources). The pointer is a cooling probe: it opens a cool pocket and shows °F under it. Pauses off-screen/hidden tab; reduced motion = still frame; probe hidden until a pointer moves (no stray label on touch). |
| Single-line diagram | `kelvin/Services.tsx` (`OneLine`) | SVG service → meter → 200 A panel → 4 circuits with current flowing (dashed stroke animation). "Simulate fault" trips a breaker (spring rotation) and stops its flow. |
| Airflow | `kelvin/Services.tsx` (`Airflow`) | Canvas particle field from a wall unit; Cool/Heat (cyan/orange) and fan speed change the flow. |
| Process circuit | `kelvin/Proof.tsx` (`Process`) | Scroll-linked wire fill + glowing pulse; each step lights as the current reaches it (horizontal desktop, vertical mobile). |
| Maintenance report | `components/ui/dot-graph-card.tsx` | Catalog 09 dot graph re-themed: example before/after usage, labeled as example data. |
| Projects | `kelvin/Proof.tsx` (`Projects`) | Filter chips + CSS-columns masonry at natural aspect ratio (no cropping), mono spec captions. |
| Quote | `kelvin/Quote.tsx` | 3-step form, segment step meter, inline validation (10-digit phone, 5-digit ZIP, optional email), live work-order summary, demo confirmation. |

## Accessibility
Real buttons with `aria-pressed`/`role=radio`/`role=tab`, labeled inputs with `aria-invalid` +
`aria-describedby`, 44–48px targets, visible focus, reduced motion respected everywhere, SVG diagrams
have `role="img"` + labels.

## Builds
`npm run build` → static Next export (`out/`). `npm run build:artifact` → Vite + single-file plugin
(all JS/CSS/photos inlined) for private share links; components avoid `next/*` so both builds share code.

## Gotcha
Marching squares needs an **integer** grid width: `nx = Math.floor(W / C) + 1`. A fractional `nx`
makes `v[j * nx + i]` read `undefined` and draws straight-line artifacts.
