// Fixed top-right overlay for ?herodebug. Renders nothing (and runs no timer)
// unless debug is enabled. Polls the live state at ~7fps so the 60fps render
// loop never triggers a React update.
import { useEffect, useState } from "react";
import { getHeroDebug, heroDebugEnabled } from "./heroDebug";

const bool = (v: boolean) => (v ? "✓" : "·");

export function HeroDebugOverlay() {
  const enabled = heroDebugEnabled();
  // tick=0 renders null so the first client render matches SSR (null) — no
  // hydration mismatch. The effect flips it to 1 and polls (~7fps) thereafter.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    setTick(1);
    const id = window.setInterval(() => setTick((n) => (n % 1e6) + 1), 150);
    return () => window.clearInterval(id);
  }, [enabled]);

  if (!enabled || tick === 0) return null;
  const s = getHeroDebug();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 60,
        padding: "8px 10px",
        background: "rgba(11,11,13,0.85)",
        color: "#F4F1EC",
        font: "11px/1.5 ui-monospace, monospace",
        border: "1px solid rgba(138,138,148,0.45)",
        whiteSpace: "pre",
        pointerEvents: "none",
      }}
    >
      {[
        `gate  rm:${bool(s.reducedMotion)} save:${bool(s.saveData)} noGL:${bool(s.nowebgl)} GL:${bool(s.webglSupported)}`,
        `      load:${bool(s.loadFired)} idle:${bool(s.idleFired)} mount:${bool(s.mounted)}`,
        `wkr   start:${bool(s.workerStarted)} done:${bool(s.workerDone)} fallback:${bool(s.fallbackPath)}`,
        `      err:${s.workerError ?? "·"}`,
        `gl    compileAsync:${bool(s.compileAsyncSupported)} compiled:${bool(s.compiled)} frames:${s.framesRendered}`,
        `loop  run:${bool(s.running)} view:${bool(s.inViewport)} vis:${bool(s.docVisible)} fps:${s.fps}`,
        `scrl  raw:${s.progressRaw.toFixed(3)} smooth:${s.smooth.toFixed(3)} shot:${s.shot}`,
      ].join("\n")}
    </div>
  );
}
