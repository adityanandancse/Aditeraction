import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
// Fallback is inlined (?raw) so it is NOT an LCP candidate — the H1 is. The mark
// uses currentColor for the brackets, so the surrounding `text-paper` paints them
// Paper on the Ink hero (the nib stays Vermilion). The small status-log mark is the
// same markup inlined — it must be inline, not an <img>, for currentColor to resolve.
import markRaw from "~/assets/brand/mark.svg?raw";
import { heroGate } from "./heroDebug";
import { HeroDebugOverlay } from "./HeroDebugOverlay";

// Raw-WebGL hero lives ONLY inside this lazy chunk (no SSR / entry weight, zero
// runtime deps).
const HeroCanvas = lazy(() => import("./HeroCanvas"));

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
function prefersReduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function saveData(): boolean {
  const n = navigator as Navigator & { connection?: { saveData?: boolean } };
  return !!n.connection?.saveData;
}
function forcedOff(): boolean {
  return new URLSearchParams(window.location.search).has("nowebgl");
}

// Keeps the static fallback if the canvas throws at any point.
class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Landing() {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const dispatched = useRef(false);

  const fireReady = () => {
    if (dispatched.current) return;
    dispatched.current = true;
    window.dispatchEvent(new Event("adx-hero-ready"));
  };

  useEffect(() => {
    // Cheap gate checks run now; the WebGL capability probe (which creates a GL
    // context — not free) is deferred into the idle slice below so it never runs
    // during hydration.
    const reduced = prefersReduced();
    const save = saveData();
    const nogl = forcedOff();
    heroGate("reducedMotion", reduced);
    heroGate("saveData", save);
    heroGate("nowebgl", nogl);

    if (reduced || save || nogl) {
      fireReady(); // fallback decided — release the intro loader
      return;
    }
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout?: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    // Mount only after the page has fully loaded, then on the first idle slice
    // (hard cap 2s). Never on hydration — keeps the WebGL chunk off the critical path.
    // 'load' may have already fired before this effect ran → check readyState.
    const start = () => {
      heroGate("idleFired", true);
      const webgl = hasWebGL();
      heroGate("webglSupported", webgl);
      if (!webgl) {
        fireReady(); // no WebGL → keep the static fallback, release the loader
        return;
      }
      setMount(true);
    };
    let handle: number | undefined;
    const schedule = () => {
      heroGate("loadFired", true);
      if (w.requestIdleCallback) handle = w.requestIdleCallback(start, { timeout: 2000 });
      else handle = window.setTimeout(start, 200);
    };
    const onLoad = () => schedule();
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      if (handle === undefined) return;
      if (w.requestIdleCallback && w.cancelIdleCallback) w.cancelIdleCallback(handle);
      else clearTimeout(handle);
    };
  }, []);

  const handleReady = () => {
    setReady(true);
    fireReady();
  };
  const handleError = () => {
    setReady(false); // keep the fallback visible
    fireReady();
  };

  return (
    <section
      id="landing"
      data-shot="0"
      data-canvas={ready ? "ready" : "idle"}
      className="relative h-[2800px]"
    >
      <HeroDebugOverlay />
      <div className="adx-contain sticky top-0 h-[min(100svh,960px)] overflow-hidden bg-ink">
        {/* (a) static fallback — real brand symbol, SSR, decorative. Inline <svg>
            (not <img>) so it is never chosen as the LCP element. */}
        <div className="hero-fallback absolute inset-0 pointer-events-none" aria-hidden="true">
          <span
            className="absolute left-1/2 top-[34%] w-[min(46vw,620px)] aspect-square -translate-x-1/2 -translate-y-1/2 text-paper min-[900px]:left-[60%] min-[900px]:top-1/2 [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: markRaw }}
          />
        </div>

        {/* (b) canvas island — client-only, decorative */}
        <div className="adx-contain absolute inset-0 pointer-events-none" aria-hidden="true">
          {mount && (
            <CanvasBoundary onError={handleError}>
              <Suspense fallback={null}>
                <HeroCanvas onReady={handleReady} onError={handleError} />
              </Suspense>
            </CanvasBoundary>
          )}
        </div>

        {/* (c) copy — real SSR text, bottom-left, non-interactive */}
        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-[1440px] px-6 pb-12 sm:pb-16">
            <h1
              className="hero-h1 font-display font-bold text-paper"
              style={{
                fontSize: "clamp(46px, 7vw, 124px)",
                lineHeight: 0.95,
                letterSpacing: "var(--tracking-display)",
              }}
            >
              Idea to launched<span className="text-vermilion">.</span>
            </h1>

            <div className="stages-row mt-6 flex items-center gap-6 font-mono text-[15px] uppercase tracking-[0.08em] text-paper">
              <span className="stg stg-brand">Brand.</span>
              <span className="stg stg-rule2 h-px flex-1 bg-line-strong" aria-hidden="true" />
              <span className="stg stg-site">Site.</span>
              <span className="stg stg-rule3 h-px flex-1 bg-line-strong" aria-hidden="true" />
              <span className="stg stg-app">App.</span>
            </div>

            <div className="mt-8 flex items-end justify-between gap-8">
              <p className="max-w-[520px] font-mono text-[15px] uppercase leading-relaxed tracking-[0.04em] text-paper">
                Design and engineering under one roof — for founders who want to launch, not wait.
              </p>
              <div className="hidden items-center gap-3 min-[900px]:flex">
                <span
                  aria-hidden="true"
                  className="h-7 w-7 shrink-0 text-paper [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: markRaw }}
                />
                <div className="font-mono text-[13px] leading-relaxed text-graphite">
                  <div>&gt; studio: open for projects</div>
                  <div>
                    &gt; stage: <span id="adx-stage">01 / 03</span>
                  </div>
                  <div>
                    &gt; scroll to explore<span className="adx-blink">_</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
