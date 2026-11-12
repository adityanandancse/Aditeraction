// Deferral helpers that keep non-critical client work off the hydration and
// first-paint critical path. Client-only (guarded for SSR).

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Run `cb` after the page has fully loaded AND the browser is idle:
 *   window 'load' (or immediately if document.readyState === "complete")
 *   → requestIdleCallback(cb, { timeout: 1500 }), falling back to setTimeout(cb, 200).
 *
 * Returns a cancel function safe to call from an effect cleanup — it cancels
 * whichever stage is still pending and prevents `cb` from firing afterwards.
 */
export function onLoadIdle(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as IdleWindow;
  let cancelled = false;
  let idleHandle: number | undefined;
  let timeoutHandle: number | undefined;
  let onLoad: (() => void) | undefined;

  const runIdle = () => {
    if (cancelled) return;
    if (typeof w.requestIdleCallback === "function") {
      idleHandle = w.requestIdleCallback(
        () => {
          if (!cancelled) cb();
        },
        { timeout: 1500 },
      );
    } else {
      timeoutHandle = window.setTimeout(() => {
        if (!cancelled) cb();
      }, 200);
    }
  };

  if (document.readyState === "complete") {
    runIdle();
  } else {
    onLoad = () => runIdle();
    window.addEventListener("load", onLoad, { once: true });
  }

  return () => {
    cancelled = true;
    if (onLoad) window.removeEventListener("load", onLoad);
    if (idleHandle !== undefined && typeof w.cancelIdleCallback === "function") {
      w.cancelIdleCallback(idleHandle);
    }
    if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
  };
}

/**
 * Yield control to the browser so a long task can be broken into chunks: await
 * between slices to let input/paint interleave. Prefers scheduler.yield() (keeps
 * task priority), then a MessageChannel macrotask, then setTimeout(0).
 */
export function yieldToMain(): Promise<void> {
  const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (sched && typeof sched.yield === "function") {
    return sched.yield();
  }
  if (typeof MessageChannel !== "undefined") {
    return new Promise<void>((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        resolve();
      };
      channel.port2.postMessage(null);
    });
  }
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}
