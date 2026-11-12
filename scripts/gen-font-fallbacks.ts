// One-off generator for the metric-matched font-fallback @font-face rules (A4).
//
// It prints, for each brand font, an Arial-based @font-face whose size-adjust and
// ascent/descent/line-gap overrides make Arial occupy the SAME box as the real
// font — so when the web font swaps in there is no layout shift (CLS). The output
// is pasted into src/styles/app.css; this script is NOT part of the build.
//
// Re-run with (needs the temp devDependency, which is removed again afterwards):
//   bun add -d @capsizecss/metrics
//   bun scripts/gen-font-fallbacks.ts
//   bun remove @capsizecss/metrics
//
// Formulas (Katie Hempenius / Capsize fallback technique):
//   sizeAdjust        = (font.xWidthAvg / font.unitsPerEm) / (arial.xWidthAvg / arial.unitsPerEm)
//   ascent-override   = font.ascent        / (font.unitsPerEm * sizeAdjust)
//   descent-override  = abs(font.descent)  / (font.unitsPerEm * sizeAdjust)
//   line-gap-override = font.lineGap       / (font.unitsPerEm * sizeAdjust)
// All emitted as percentages rounded to 2 decimals.
import spaceGrotesk from "@capsizecss/metrics/spaceGrotesk";
import inter from "@capsizecss/metrics/inter";
import jetBrainsMono from "@capsizecss/metrics/jetBrainsMono";
import arial from "@capsizecss/metrics/arial";

interface Metrics {
  familyName: string;
  ascent: number;
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  xWidthAvg: number;
}

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

function block(fallbackName: string, font: Metrics): string {
  const sizeAdjust =
    font.xWidthAvg / font.unitsPerEm / (arial.xWidthAvg / arial.unitsPerEm);
  const denom = font.unitsPerEm * sizeAdjust;
  const ascent = font.ascent / denom;
  const descent = Math.abs(font.descent) / denom;
  const lineGap = font.lineGap / denom;

  return `@font-face {
  font-family: "${fallbackName}";
  src: local("Arial"), local("ArialMT"), local("Helvetica");
  size-adjust: ${pct(sizeAdjust)};
  ascent-override: ${pct(ascent)};
  descent-override: ${pct(descent)};
  line-gap-override: ${pct(lineGap)};
}`;
}

const out = [
  block("Space Grotesk Fallback", spaceGrotesk as Metrics),
  block("Inter Fallback", inter as Metrics),
  block("JetBrains Mono Fallback", jetBrainsMono as Metrics),
].join("\n\n");

console.log(out);
