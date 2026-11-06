// Shared equirectangular projection for the "World reach" map (Phase 5c).
// Single source of truth: the build-time dot generator (scripts/gen-world-dots.ts)
// and the arc overlay (HomeReach.tsx) BOTH project through this, so the animated
// arcs land exactly on the dotted map.
//
// Linear in lat/lng → a uniform lat/lng grid stays a uniform grid in the viewBox.
// Antarctica is excluded by clamping the latitude band; the viewBox is a clean
// 2:1 (1000×500), which stretches latitude ~1.28× — fine for a decorative map.

export const WORLD_VIEW = { w: 1000, h: 500 } as const;

export const WORLD_BOUNDS = {
  latMax: 84,
  latMin: -56, // Antarctica excluded
  lngMin: -180,
  lngMax: 180,
} as const;

export interface Point {
  x: number;
  y: number;
}

/** Project geographic lat/lng (degrees) to x/y in the 1000×500 viewBox. */
export function project(lat: number, lng: number): Point {
  const { latMax, latMin, lngMin, lngMax } = WORLD_BOUNDS;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * WORLD_VIEW.w;
  const y = ((latMax - lat) / (latMax - latMin)) * WORLD_VIEW.h;
  return { x, y };
}
