// Artifact page contract: <title> and the viewport-sides meta must sit at the very top (first 8KB is scanned for the title).
import fs from "node:fs";
let h = fs.readFileSync("dist/index.html", "utf8");
const pick = (re) => { const m = h.match(re); if (m) h = h.replace(m[0], ""); return m ? m[0] : ""; };
const title = pick(/<title>[\s\S]*?<\/title>/);
const meta = pick(/<meta name="claude:viewport-fit-sides"[^>]*>/);
const desc = pick(/<meta name="description"[^>]*>/);
fs.writeFileSync("dist/kelvin.html", `${title}\n${meta}\n${desc}\n${h.trim()}\n`);
console.log("dist/kelvin.html", (fs.statSync("dist/kelvin.html").size / 1e6).toFixed(2), "MB");
