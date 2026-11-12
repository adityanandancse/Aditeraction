// One shared IntersectionObserver for every <Reveal>.
//
// Created immediately on mount (on the first registration). An IntersectionObserver
// is cheap to construct and its first callback is delivered ASYNCHRONOUSLY with
// pre-computed intersection data — so it reports which elements are in view WITHOUT
// any synchronous getBoundingClientRect / innerHeight read. That removes the forced
// reflow the previous rAF measure-pass caused during hydration. Elements already in
// the viewport are revealed by that first callback; the rest reveal on scroll.
//
// Invariants kept: the hidden start state is CSS-gated on `.js` + no-preference, so
// no-JS and reduced-motion users see everything; the hero H1 (LCP) is never a
// <Reveal>, so it never waits on this; a 2s safety net guarantees eventual reveal;
// the observer is a module singleton, so client navigation never re-inits it.

let io: IntersectionObserver | null = null;
let safetyArmed = false;

function reduceMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function reveal(el: HTMLElement, extraDelayMs = 0) {
  const base = Number(el.dataset.revealDelay ?? "0") || 0;
  const total = base + extraDelayMs;
  if (total > 0) el.style.transitionDelay = `${total}ms`;
  el.dataset.revealed = "true";
}

function armSafetyNet() {
  if (safetyArmed || typeof window === "undefined") return;
  safetyArmed = true;
  window.setTimeout(() => {
    document
      .querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])")
      .forEach((el) => {
        el.dataset.revealed = "true";
      });
  }, 2000);
}

function ensureObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return null;
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
      // boundingClientRect/isIntersecting here are supplied by the observer (no
      // forced layout). Sort the batch by document order for a natural stagger.
      const shown = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      shown.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        reveal(el, i * 80); // stagger siblings revealed together
        io?.unobserve(el);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
  );
  return io;
}

export function observeReveal(el: HTMLElement) {
  if (typeof window === "undefined") return;
  armSafetyNet();
  // Reduced motion (or no IntersectionObserver): reveal immediately — the hidden
  // CSS is gated on no-preference, so this is a no-op paint under reduced motion.
  if (reduceMotion()) {
    el.dataset.revealed = "true";
    return;
  }
  const observer = ensureObserver();
  if (!observer) {
    el.dataset.revealed = "true";
    return;
  }
  observer.observe(el);
}
