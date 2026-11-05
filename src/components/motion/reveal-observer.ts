// One shared IntersectionObserver for every <Reveal>. Animates opacity +
// transform once, with a small document-order stagger per batch. Includes a
// safety net: if the observer never fires, everything is revealed after 2s.

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
  if (typeof window === "undefined") return null;
  if (io) return io;
  io = new IntersectionObserver(
    (entries) => {
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

// Observing happens off the hydration critical path: elements queue here and are
// attached during an idle slice. Below-the-fold reveals aren't visible yet, so a
// small delay is invisible; the 2s safety net still guarantees they appear.
const pending: HTMLElement[] = [];
let flushScheduled = false;

function attach(el: HTMLElement) {
  // Reduced motion (or no observer support): reveal immediately, no transform.
  // (Under reduced motion the hidden CSS never applies, so this is a no-op paint.)
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

function flush() {
  flushScheduled = false;
  const batch = pending.splice(0, pending.length);
  for (const el of batch) attach(el);
}

export function observeReveal(el: HTMLElement) {
  if (typeof window === "undefined") return;
  armSafetyNet();
  pending.push(el);
  if (flushScheduled) return;
  flushScheduled = true;
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, o?: { timeout?: number }) => number;
  };
  if (w.requestIdleCallback) w.requestIdleCallback(flush, { timeout: 500 });
  else window.setTimeout(flush, 1);
}
