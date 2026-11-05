// Pure, DOM-free particle logic shared by the worker (particles.worker.ts) and
// the main-thread fallback (buildParticles.ts). The brand symbol is rasterised
// elsewhere; here we only classify pixels and build the GPU attributes. Keeping
// the rules in one place means the worker and fallback can never drift.
//
// Classification (symbol-on-dark.svg): brackets are light (#F4F1EC), the nib is
// Vermilion (#FF4D2E). The dark nib hole/slit is transparent and ignored.

export interface MarkAttributes {
  position: Float32Array; // N*3 sphere start positions
  aB: Float32Array; // N*3 mark target positions (world units)
  aC: Float32Array; // N*3 burst target positions
  aD: Float32Array; // N draw-in delays (0..1)
  aR: Float32Array; // N per-particle random seed
  count: number;
}

export interface Classified {
  brackets: Float32Array; // flat [x,y,x,y,...] in sample-pixel space
  nibs: Float32Array;
  cx: number;
  cy: number;
  scale: number; // sample-pixel → world units
  halfH: number; // half bbox height, for bracket draw-in ordering
}

export const SAMPLE_WIDTH = 640;
const WORLD_WIDTH = 3.9;
const BRACKET_SHARE = 0.38; // 38% on brackets, 62% on nib

/** Classify an RGBA pixel buffer into bracket / nib point clouds + bbox. */
export function classify(data: Uint8ClampedArray, w: number, h: number): Classified {
  const brackets: number[] = [];
  const nibs: number[] = [];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4;
      if (data[i + 3]! < 128) continue;
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      let cls = 0; // 1 = bracket, 2 = nib
      if (r > 200 && g < 140 && b < 120) cls = 2;
      else if (r > 200 && g > 200 && b > 200) cls = 1;
      else continue;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (cls === 1) brackets.push(x, y);
      else nibs.push(x, y);
    }
  }

  const bboxW = maxX - minX || 1;
  const bboxH = maxY - minY || 1;
  return {
    brackets: Float32Array.from(brackets),
    nibs: Float32Array.from(nibs),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    scale: WORLD_WIDTH / bboxW,
    halfH: bboxH / 2 || 1,
  };
}

/** Particle budget — fewer on narrow viewports. */
export function particleCount(narrow: boolean): number {
  return narrow ? 8000 : 16000;
}

/** Allocate the five attribute buffers up front (transferable). */
export function allocate(count: number): MarkAttributes {
  return {
    position: new Float32Array(count * 3),
    aB: new Float32Array(count * 3),
    aC: new Float32Array(count * 3),
    aD: new Float32Array(count),
    aR: new Float32Array(count),
    count,
  };
}

/**
 * Fill a single particle's slot. Pure aside from Math.random(); safe to call in
 * a tight worker loop or chunked across frames on the main thread.
 */
export function buildParticle(c: Classified, a: MarkAttributes, i: number): void {
  const count = a.count;
  const nBracket = Math.floor(count * BRACKET_SHARE);
  const brCount = c.brackets.length / 2;
  const nbCount = c.nibs.length / 2;

  const onBracket = i < nBracket && brCount > 0;
  const src = onBracket ? c.brackets : c.nibs;
  const srcCount = onBracket ? brCount : nbCount;

  let px: number;
  let py: number;
  if (srcCount > 0) {
    const j = Math.floor(Math.random() * srcCount) * 2;
    px = src[j]! + (Math.random() * 2 - 1);
    py = src[j + 1]! + (Math.random() * 2 - 1);
  } else {
    px = c.cx;
    py = c.cy;
  }

  // Mark target (aB)
  const bx0 = (px - c.cx) * c.scale;
  const by0 = -(py - c.cy) * c.scale; // flip y
  a.aB[i * 3] = bx0;
  a.aB[i * 3 + 1] = by0;
  a.aB[i * 3 + 2] = (Math.random() - 0.5) * 0.12; // z jitter ±0.06

  // Draw-in delay (aD)
  a.aD[i] = onBracket
    ? // brackets draw in from the apex outward
      Math.min(1, Math.abs(py - c.cy) / c.halfH) * 0.55
    : // nib arrives last = "locks"
      0.72 + Math.random() * 0.28;

  // Per-particle random seed (aR)
  a.aR[i] = Math.random();

  // Sphere start position (position)
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  const r = 2.2 * Math.cbrt(0.85 + Math.random() * 0.15);
  a.position[i * 3] = r * Math.sin(ph) * Math.cos(th);
  a.position[i * 3 + 1] = r * Math.cos(ph);
  a.position[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);

  // Burst target (aC) — fly out radially from the mark target
  const bx = bx0 + (Math.random() - 0.5) * 0.6;
  const by = by0 + (Math.random() - 0.5) * 0.6;
  const bz = (Math.random() - 0.5) * 2.5;
  const len = Math.hypot(bx, by, bz) || 1;
  const mag = 6 + Math.random() * 14;
  a.aC[i * 3] = (bx / len) * mag;
  a.aC[i * 3 + 1] = (by / len) * mag;
  a.aC[i * 3 + 2] = (bz / len) * mag;
}

/** Build every particle synchronously (worker thread). */
export function buildAll(c: Classified, count: number): MarkAttributes {
  const a = allocate(count);
  for (let i = 0; i < count; i++) buildParticle(c, a, i);
  return a;
}
