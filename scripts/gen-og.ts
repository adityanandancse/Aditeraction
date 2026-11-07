// Build-time generator for the Open Graph / Twitter card images (Phase 7c).
//
// Regenerate with:
//   bun add -d @resvg/resvg-js
//   bun scripts/gen-og.ts
//   bun remove @resvg/resvg-js        # keep the app dependency-free
//
// @resvg/resvg-js is used ONLY here, at build time, to rasterise a hand-built
// SVG per page to a 1200x630 PNG. It is NOT an app dependency — install it, run
// this, then remove it (and restore the lockfile), exactly like gen-world-dots.ts.
//
// Fonts (no network fetch): resvg loads static TTFs, but the project only ships
// the variable woff2 files (@fontsource-variable) and resvg-js 2.6.2 won't load
// those. So this script first instances the project's OWN woff2 to static TTFs at
// the weights we want, using fontTools (Python, already on the toolchain — no npm
// dependency added), into a temp dir that is deleted when the script finishes.
// Requires: python on PATH with fontTools (`python -c "import fontTools"`).
//
// Design (brand rules, strict): Ink #0B0B0D background, 80px margins. Top-left:
// the real logo.svg in Paper (currentColor -> #F4F1EC) with its Vermilion nib and
// i-dots intact, ~48px tall. One 2px Vermilion rule is the only accent. Headline
// in Space Grotesk (Paper, auto-shrunk to <=2 lines). Subtitle in Inter (Graphite,
// one line, auto-shrunk). Bottom-left mono label + bottom-right "aditeraction.com"
// in JetBrains Mono (Graphite, uppercase, wide tracking). No gradients/shadows/
// photos. "Idea to launched." and "Brand, site, app. One roof." never share an image.
//
// Output: public/og/{home,services,about,contact,work,service-<slug>}.png
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { site } from "../src/lib/site.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "public/og");
const fontTmp = resolve(here, ".og-fonts");
mkdirSync(outDir, { recursive: true });
mkdirSync(fontTmp, { recursive: true });

// --- brand constants --------------------------------------------------------
const INK = "#0B0B0D";
const PAPER = "#F4F1EC";
const GRAPHITE = "#8A8A94";
const VERMILION = "#FF4D2E";
const W = 1200;
const H = 630;
const M = 80; // margin
const CONTENT_W = W - M * 2; // 1040

// --- fonts: instance the project's own variable woff2 to static TTFs ---------
// resvg matches the font's internal family name, so we rename each instance to an
// unambiguous "OG *" family and bake the weight (variable axes are flattened).
const FDIR = "node_modules/@fontsource-variable";
const DISPLAY = "OG Display";
const SANS = "OG Sans";
const MONO = "OG Mono";
const displayTtf = resolve(fontTmp, "display.ttf");
const sansTtf = resolve(fontTmp, "sans.ttf");
const monoTtf = resolve(fontTmp, "mono.ttf");

const pyProg = `
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
jobs = [
 ("${FDIR}/space-grotesk/files/space-grotesk-latin-wght-normal.woff2", 500, "${DISPLAY}", r"${displayTtf}"),
 ("${FDIR}/inter/files/inter-latin-wght-normal.woff2", 400, "${SANS}", r"${sansTtf}"),
 ("${FDIR}/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2", 500, "${MONO}", r"${monoTtf}"),
]
for src, wght, fam, out in jobs:
    ft = TTFont(src)
    instantiateVariableFont(ft, {"wght": wght}, inplace=True, updateFontNames=False)
    name = ft["name"]
    for nid in (1, 3, 4, 6, 16):
        name.setName(fam, nid, 3, 1, 0x409)
    ft.flavor = None
    ft.save(out)
print("fonts ok")
`;

const py = Bun.spawnSync({ cmd: ["python", "-c", pyProg], cwd: root });
if (py.exitCode !== 0) {
  console.error(py.stderr.toString());
  throw new Error("Font instancing failed — is python + fontTools available?");
}

// --- logo: nest the real asset, recoloured to Paper, ~48px tall -------------
const LOGO_H = 48;
const LOGO_W = Math.round((8980 / 995) * LOGO_H); // asset aspect ratio
const logoRaw = readFileSync(resolve(root, "src/assets/brand/logo.svg"), "utf8");
const logo = logoRaw
  .replace(/currentColor/g, PAPER)
  .replace(
    /^<svg[^>]*>/,
    `<svg x="${M}" y="72" width="${LOGO_W}" height="${LOGO_H}" viewBox="200 260 8980 995" preserveAspectRatio="xMinYMid meet">`,
  )
  .trim();

// --- text helpers (approximate measuring; copy is fixed and short) ----------
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const estWidth = (text: string, size: number, factor: number) => text.length * size * factor;

function wrap(text: string, maxW: number, size: number, factor: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (!cur || estWidth(t, size, factor) <= maxW) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function fitSubtitle(text: string): { size: number; lines: string[] } {
  const factor = 0.52;
  for (let size = 32; size >= 22; size -= 1) {
    if (estWidth(text, size, factor) <= CONTENT_W) return { size, lines: [text] };
  }
  return { size: 22, lines: wrap(text, CONTENT_W, 22, factor).slice(0, 2) };
}

// Home subtitle: first sentence of answers.whatWeDo, trimmed <=90 chars at a word
// boundary (no mid-word cut), with an ellipsis if it was shortened.
function firstSentence(s: string): string {
  const i = s.indexOf(". ");
  return i === -1 ? s : s.slice(0, i + 1);
}
function trimWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return `${cut.slice(0, sp > 0 ? sp : max).replace(/[,.\s]+$/, "")}…`;
}

// --- industries line (for the /work card, generated now for later use) ------
const ind = site.industries.map((x) => (x === "D2C" ? x : x.toLowerCase()));
const industriesLine = `Projects across ${ind.slice(0, -1).join(", ")} and ${ind[ind.length - 1]}.`;

// --- page copy (all from site.ts) -------------------------------------------
interface OgPage {
  file: string;
  headline: string;
  subtitle: string;
  label: string;
}
const pages: OgPage[] = [
  {
    file: "home",
    headline: site.tagline, // "Idea to launched."
    subtitle: trimWords(firstSentence(site.answers.whatWeDo.answer), 90),
    label: "STUDIO",
  },
  {
    file: "services",
    headline: "Services",
    subtitle: "Web & Brand, Apps, D2C, Branding, Marketing, Video",
    label: "SERVICES",
  },
  ...site.services.map((s, i) => ({
    file: `service-${s.slug}`,
    headline: s.title,
    subtitle: s.summary,
    label: `SERVICES / 0${i + 1}`,
  })),
  {
    file: "about",
    headline: "About Aditeraction",
    subtitle: "Founder-led studio in Noida, India. Working worldwide.",
    label: "ABOUT",
  },
  {
    file: "contact",
    headline: "Start a project",
    subtitle: "We reply within 24 hours on working days.",
    label: "CONTACT",
  },
  {
    file: "work",
    headline: "Work",
    subtitle: industriesLine,
    label: "WORK",
  },
];

// --- SVG assembly -----------------------------------------------------------
function textEl(
  lines: string[],
  x: number,
  firstBaseline: number,
  lineH: number,
  attrs: string,
): string {
  const tspans = lines
    .map((l, i) => `<tspan x="${x}" y="${firstBaseline + i * lineH}">${esc(l)}</tspan>`)
    .join("");
  return `<text ${attrs}>${tspans}</text>`;
}

// Layout-aware headline fit: the largest Space Grotesk size (<=2 lines, within the
// content width) whose headline + subtitle stack still clears the footer row. Short
// titles stay on one line; long ones (e.g. "Product & App Engineering") wrap/shrink.
const HEAD_FACTOR = 0.56;
const HEAD_TOP = 270; // baseline anchor for the first headline line
const HEAD_MAX = 92;
const GAP = 44; // headline → subtitle
const SUB_BOTTOM_MAX = 516; // keep the subtitle clear of the footer (baseline 558)

function layout(headline: string, sub: { size: number; lines: string[] }) {
  const subLineH = Math.round(sub.size * 1.3);
  for (let size = HEAD_MAX; size >= 40; size -= 2) {
    const lines = wrap(headline, CONTENT_W, size, HEAD_FACTOR);
    const widest = Math.max(...lines.map((l) => estWidth(l, size, HEAD_FACTOR)));
    if (lines.length > 2 || widest > CONTENT_W) continue;
    const lineH = Math.round(size * 1.12);
    const headFirst = HEAD_TOP + Math.round(size * 0.8);
    const headBottom = headFirst + (lines.length - 1) * lineH;
    const subFirst = headBottom + GAP + Math.round(sub.size * 0.8);
    const subBottom = subFirst + (sub.lines.length - 1) * subLineH;
    if (subBottom <= SUB_BOTTOM_MAX) return { size, lines, lineH, headFirst, subFirst, subLineH };
  }
  const size = 40;
  const lines = wrap(headline, CONTENT_W, size, HEAD_FACTOR).slice(0, 2);
  const lineH = Math.round(size * 1.12);
  const headFirst = HEAD_TOP + Math.round(size * 0.8);
  return { size, lines, lineH, headFirst, subFirst: 490, subLineH };
}

function buildSvg(p: OgPage): string {
  const sub = fitSubtitle(p.subtitle);
  const L = layout(p.headline, sub);

  const ruleY = 236;
  const footBaseline = H - M + 8; // 558

  const headline = textEl(
    L.lines,
    M,
    L.headFirst,
    L.lineH,
    `font-family="${DISPLAY}" font-size="${L.size}" fill="${PAPER}"`,
  );
  const subtitle = textEl(
    sub.lines,
    M,
    L.subFirst,
    L.subLineH,
    `font-family="${SANS}" font-size="${sub.size}" fill="${GRAPHITE}"`,
  );
  const label = `<text x="${M}" y="${footBaseline}" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${GRAPHITE}">${esc(p.label)}</text>`;
  const domain = `<text x="${W - M}" y="${footBaseline}" text-anchor="end" font-family="${MONO}" font-size="22" letter-spacing="1" fill="${GRAPHITE}">aditeraction.com</text>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${INK}"/>` +
    logo +
    `<rect x="${M}" y="${ruleY}" width="64" height="2" fill="${VERMILION}"/>` +
    headline +
    subtitle +
    label +
    domain +
    `</svg>`
  );
}

// --- render -----------------------------------------------------------------
const fontFiles = [displayTtf, sansTtf, monoTtf];
let total = 0;
for (const p of pages) {
  const svg = buildSvg(p);
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: SANS },
  });
  const png = resvg.render().asPng();
  writeFileSync(resolve(outDir, `${p.file}.png`), png);
  const kb = png.byteLength / 1024;
  total += png.byteLength;
  console.log(`${p.file}.png  ${kb.toFixed(1)} KB`);
}

// --- cleanup: drop the temp TTFs (the woff2 sources stay untouched) ----------
rmSync(fontTmp, { recursive: true, force: true });
console.log(`\n${pages.length} images, ${(total / 1024).toFixed(1)} KB total → ${outDir}`);
