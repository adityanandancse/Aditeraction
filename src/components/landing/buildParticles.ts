// Page-lifetime-cached entry point for the hero particle attributes. Prefers a
// module worker (OffscreenCanvas), and falls back to the main thread in chunks —
// yielding every 500 particles so each slice stays well under 50ms (even at 4x
// CPU throttling) and the build never becomes one long task.
import {
  allocate,
  buildParticle,
  classify,
  particleCount,
  SAMPLE_WIDTH,
  type MarkAttributes,
} from "./sampleMark";
import { heroGate } from "./heroDebug";
// Sample the real brand master (read-only). Tiny; the <img> usages elsewhere use
// the optimized copy, but the raster source stays on the master for fidelity.
import markUrl from "../../../brand/aditeraction-symbol-on-dark.svg?url";

const CHUNK = 500;
const WORKER_TIMEOUT_MS = 4000;

let cache: Promise<MarkAttributes> | null = null;

export function buildParticles(): Promise<MarkAttributes> {
  if (!cache) cache = run();
  return cache;
}

function narrowNow(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 900;
}

function run(): Promise<MarkAttributes> {
  const narrow = narrowNow();
  const workerCapable =
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof createImageBitmap !== "undefined";
  if (workerCapable) {
    return viaWorker(narrow).catch((err: unknown) => {
      heroGate("workerError", err instanceof Error ? err.message : String(err));
      return viaMain(narrow);
    });
  }
  return viaMain(narrow);
}

function viaWorker(narrow: boolean): Promise<MarkAttributes> {
  return new Promise<MarkAttributes>((resolve, reject) => {
    let worker: Worker;
    try {
      worker = new Worker(new URL("./particles.worker.ts", import.meta.url), {
        type: "module",
      });
    } catch (err) {
      reject(err as Error);
      return;
    }
    heroGate("workerStarted", true);

    let finished = false;
    // A worker that neither messages nor errors (silent hang) must not stall the
    // hero — time it out and let the caller fall back to the main thread.
    const timer = window.setTimeout(() => {
      finish(() => reject(new Error("worker timeout")));
    }, WORKER_TIMEOUT_MS);
    const finish = (settle: () => void) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      worker.terminate();
      settle();
    };

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data as MarkAttributes | { error: string };
      if (d && "error" in d) finish(() => reject(new Error(d.error)));
      else
        finish(() => {
          heroGate("workerDone", true);
          resolve(d as MarkAttributes);
        });
    };
    worker.onerror = (err) =>
      finish(() =>
        reject(err instanceof ErrorEvent ? new Error(err.message) : new Error("worker error")),
      );
    worker.onmessageerror = () => finish(() => reject(new Error("worker messageerror")));
    worker.postMessage({ url: markUrl, narrow });
  });
}

async function viaMain(narrow: boolean): Promise<MarkAttributes> {
  heroGate("fallbackPath", true);
  const raster = await rasterize(markUrl);
  const classified = classify(raster.data, raster.w, raster.h);
  const count = particleCount(narrow);
  const a = allocate(count);
  const yieldToMain = makeYield();
  for (let i = 0; i < count; i++) {
    buildParticle(classified, a, i);
    if (i > 0 && i % CHUNK === 0) await yieldToMain();
  }
  return a;
}

async function rasterize(
  url: string,
): Promise<{ data: Uint8ClampedArray; w: number; h: number }> {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
  await img.decode();

  const aspect =
    img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1;
  const w = SAMPLE_WIDTH;
  const h = Math.max(1, Math.round(w * aspect));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c2d = canvas.getContext("2d", { willReadFrequently: true });
  if (!c2d) throw new Error("2d context unavailable");
  c2d.clearRect(0, 0, w, h);
  c2d.drawImage(img, 0, 0, w, h);
  return { data: c2d.getImageData(0, 0, w, h).data, w, h };
}

// scheduler.yield() when available (lets the browser interleave input/paint),
// else a macrotask via setTimeout(0).
function makeYield(): () => Promise<void> {
  const sched = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (sched && typeof sched.yield === "function") {
    return () => sched.yield!();
  }
  return () => new Promise<void>((r) => setTimeout(r, 0));
}
