// Hero debug instrumentation. Zero cost unless the URL carries ?herodebug:
// ENABLED is computed once; every setter early-returns when off and nothing
// subscribes, so the overlay never mounts and the per-frame writes are skipped.
export interface HeroDebugState {
  // gate
  reducedMotion: boolean;
  saveData: boolean;
  nowebgl: boolean;
  webglSupported: boolean;
  loadFired: boolean;
  idleFired: boolean;
  mounted: boolean;
  // worker
  workerStarted: boolean;
  workerDone: boolean;
  fallbackPath: boolean;
  workerError: string | null;
  // gl
  compileAsyncSupported: boolean;
  compiled: boolean;
  framesRendered: number;
  // loop
  running: boolean;
  inViewport: boolean;
  docVisible: boolean;
  fps: number;
  // scroll
  progressRaw: number;
  smooth: number;
  shot: number;
}

const ENABLED =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).has("herodebug");

export const heroDebugEnabled = (): boolean => ENABLED;

const state: HeroDebugState = {
  reducedMotion: false,
  saveData: false,
  nowebgl: false,
  webglSupported: false,
  loadFired: false,
  idleFired: false,
  mounted: false,
  workerStarted: false,
  workerDone: false,
  fallbackPath: false,
  workerError: null,
  compileAsyncSupported: false,
  compiled: false,
  framesRendered: 0,
  running: false,
  inViewport: false,
  docVisible: true,
  fps: 0,
  progressRaw: 0,
  smooth: 0,
  shot: 0,
};

const listeners = new Set<() => void>();

/** Gate/flag transition: logs `[hero]` on change and notifies the overlay. */
export function heroGate<K extends keyof HeroDebugState>(
  key: K,
  value: HeroDebugState[K],
): void {
  if (!ENABLED) return;
  if (state[key] === value) return;
  state[key] = value;
  // eslint-disable-next-line no-console
  console.info(`[hero] ${String(key)}: ${String(value)}`);
  listeners.forEach((l) => l());
}

/** High-frequency numeric field: updated silently (no console / no notify). */
export function heroStat<K extends keyof HeroDebugState>(
  key: K,
  value: HeroDebugState[K],
): void {
  if (!ENABLED) return;
  state[key] = value;
}

export function getHeroDebug(): Readonly<HeroDebugState> {
  return state;
}

export function subscribeHeroDebug(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
