# Kelvin — Electricidad y Climatización (demo)

Bilingual (ES/EN) one-page website for a **fictional** electrical + HVAC company, built by Lumo HQ as a
portfolio demo. Phone, license, address, figures and testimonials are examples, labeled on screen.

- Stack: **Next.js 15 (App Router, static export) · React 19 · Tailwind CSS v4 · motion · lucide-react**
- No backend, no environment variables, no API keys. Output is a static site in `out/`.

## Requirements
Node.js 20 (`.nvmrc`; 18.18+ works), npm 10+.

## Install and run
```bash
npm ci
npm run dev       # http://localhost:3127
```

## Build
```bash
npm run typecheck
npm run build     # static site in ./out
npx serve out     # optional local preview
npm run build:artifact   # optional single-file HTML (dist/kelvin.html) for private share links
```

## Deploy
- **Vercel**: import the repo (preset "Next.js"), no settings needed.
- **Netlify**: import the repo; `netlify.toml` sets `npm run build` → `out`.
- **Any static host**: upload `out/`.

## Where to change things
| What | File |
|---|---|
| All texts ES/EN (services, steps, FAQ-style copy, contact) | `src/kelvin/copy.ts` |
| Colors, fonts, utilities (grid paper, brackets, current flow) | `src/styles.css` |
| Utility bar + nav + language | `src/kelvin/Header.tsx` |
| Hero (thermal map, CTAs, instrument photo) | `src/kelvin/Hero.tsx`, `src/components/ui/thermal-field.tsx` |
| Trust strip + Services (single-line diagram, airflow) | `src/kelvin/Services.tsx` |
| Why / Process / Projects / Testimonials | `src/kelvin/Proof.tsx` |
| Quote form, Contact, Footer | `src/kelvin/Quote.tsx` |
| Section order | `src/kelvin/Kelvin.tsx` |
| Photos | `src/assets/img/` (see `CREDITS.md`) |

To turn it into a real client site: replace copy and photos, remove `DemoBar` in `Kelvin.tsx`, and
connect the quote form to a real endpoint (form service or CRM).

More: [`docs/TECHNICAL.md`](docs/TECHNICAL.md). Credits: [`CREDITS.md`](CREDITS.md).
