// One-off build-time generator for the dotted world map (Phase 5c).
//
// Regenerate with:
//   bun add -d dotted-map
//   bun scripts/gen-world-dots.ts
//   bun remove dotted-map          # keep the app dependency-free
//
// `dotted-map` is used ONLY for land detection (it bundles a world map). It grids
// our region into land cells and returns their x/y in its own width×height space;
// we convert those back to lat/lng and re-project through src/lib/worldProjection.ts
// so the dots and the animated arcs in HomeReach.tsx share one projection.
//
// Output: src/assets/world-dots.svg — every dot is a tiny square inside ONE
// <path> element (no per-dot DOM), Graphite #8A8A94 at 35% opacity.
//
// DOT_ROWS tunes density; aim for ~1500–2500 dots. DOT_SIZE is in viewBox units.

import DottedMap from "dotted-map";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { project, WORLD_VIEW, WORLD_BOUNDS } from "../src/lib/worldProjection.ts";

const DOT_ROWS = 54; // vertical dot rows across the latitude band
const DOT_SIZE = 3; // square side in viewBox units

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, "../src/assets/world-dots.svg");

const map = new DottedMap({
  height: DOT_ROWS,
  grid: "vertical",
  projection: { name: "equirectangular" },
  region: {
    lat: { min: WORLD_BOUNDS.latMin, max: WORLD_BOUNDS.latMax },
    lng: { min: WORLD_BOUNDS.lngMin, max: WORLD_BOUNDS.lngMax },
  },
});

const points = map.getPoints();
const { width, height, region } = map.image;

// Re-project each land point through our shared projection; round to integers and
// dedupe so overlapping cells don't bloat the path.
const seen = new Set<string>();
const segments: string[] = [];
const half = DOT_SIZE / 2;

for (const p of points) {
  // dotted-map grid (x,y) → lat/lng over the region → our shared projection.
  const lng = region.lng.min + (p.x / width) * (region.lng.max - region.lng.min);
  const lat = region.lat.max - (p.y / height) * (region.lat.max - region.lat.min);
  if (lat < WORLD_BOUNDS.latMin || lat > WORLD_BOUNDS.latMax) continue;
  const { x, y } = project(lat, lng);
  if (x < 0 || x > WORLD_VIEW.w || y < 0 || y > WORLD_VIEW.h) continue;
  const rx = Math.round(x - half);
  const ry = Math.round(y - half);
  const key = `${rx},${ry}`;
  if (seen.has(key)) continue;
  seen.add(key);
  segments.push(`M${rx},${ry}h${DOT_SIZE}v${DOT_SIZE}h-${DOT_SIZE}z`);
}

const d = segments.join("");
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WORLD_VIEW.w} ${WORLD_VIEW.h}" ` +
  `width="${WORLD_VIEW.w}" height="${WORLD_VIEW.h}" role="img" aria-label="World map">` +
  `<path d="${d}" fill="#8A8A94" fill-opacity="0.35"/></svg>\n`;

writeFileSync(outPath, svg);

const bytes = Buffer.byteLength(svg, "utf8");
console.log(`dots: ${seen.size}`);
console.log(`bytes: ${bytes} (${(bytes / 1024).toFixed(1)} KB)`);
console.log(`wrote: ${outPath}`);
