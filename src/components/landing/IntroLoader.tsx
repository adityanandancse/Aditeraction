import { useEffect, useRef } from "react";
import { useLenis } from "~/components/motion/SmoothScroll";

// Home-only intro. SSR markup, but shown ONLY when the document is JS-capable
// and the intro has not been seen this session (CSS gates `#adx-intro`), and
// never under reduced motion. Progress follows real hero readiness, with a
// minimum of 0.8s and a HARD MAX of 1.6s, plus a 2.5s CSS failsafe.
const MIN_MS = 800;
const MAX_MS = 1600;

export function IntroLoader() {
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Respect the CSS gate: if it's not actually visible, do nothing (no lock).
    if (getComputedStyle(el).display === "none") return;

    const t0 = performance.now();
    let ready = false;
    let hideAt = MAX_MS;
    let raf = 0;
    let finished = false;

    document.documentElement.classList.add("adx-lock");
    try {
      lenisRef.current?.stop();
    } catch {
      /* noop */
    }
    skipRef.current?.focus();

    const onReady = () => {
      ready = true;
      hideAt = Math.min(MAX_MS, Math.max(MIN_MS, performance.now() - t0));
    };
    window.addEventListener("adx-hero-ready", onReady, { once: true });

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("adx-hero-ready", onReady);
      if (pctRef.current) pctRef.current.textContent = "100";
      if (barRef.current) barRef.current.style.transform = "scaleX(1)";
      el.classList.add("is-done");
      try {
        sessionStorage.setItem("adx-intro", "1");
      } catch {
        /* noop */
      }
      document.documentElement.classList.add("intro-seen");
      document.documentElement.classList.remove("adx-lock");
      try {
        lenisRef.current?.start();
      } catch {
        /* noop */
      }
      window.setTimeout(() => {
        el.style.display = "none";
      }, 420);
    };

    // One write per frame, composited-only: scaleX (transform) never triggers
    // layout, unlike width. The loop stops the moment finish() runs.
    let lastPct = -1;
    const tick = (now: number) => {
      const e = now - t0;
      const denom = ready ? hideAt : MAX_MS;
      const frac = Math.min(1, e / denom);
      if (barRef.current) barRef.current.style.transform = `scaleX(${frac})`;
      const pct = Math.round(frac * 100);
      if (pct !== lastPct && pctRef.current) {
        pctRef.current.textContent = String(pct);
        lastPct = pct;
      }
      if (e >= hideAt) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const skip = skipRef.current;
    const onSkip = () => finish();
    skip?.addEventListener("click", onSkip);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("adx-hero-ready", onReady);
      skip?.removeEventListener("click", onSkip);
      document.documentElement.classList.remove("adx-lock");
    };
  }, []);

  return (
    <div
      ref={rootRef}
      id="adx-intro"
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col justify-end bg-ink p-6 sm:p-10"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start">
        <button
          ref={skipRef}
          type="button"
          className="mb-8 border border-line-strong px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] text-paper transition-colors hover:border-vermilion hover:text-vermilion focus-visible:text-vermilion"
        >
          Skip intro
        </button>

        <div className="font-mono text-[13px] uppercase leading-relaxed tracking-[0.06em] text-graphite">
          <div>
            &gt; read brief ................. <span className="text-paper">ok</span>
          </div>
          <div>
            &gt; draft brand ................ <span className="text-paper">ok</span>
          </div>
          <div>
            &gt; compile site + app ......... <span className="text-paper">ok</span>
          </div>
          <div>
            &gt; launch sequence <span ref={pctRef} className="text-vermilion">0</span>%
            <span className="adx-blink">_</span>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-line-strong">
          <div
            ref={barRef}
            className="h-px w-full origin-left bg-vermilion"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
