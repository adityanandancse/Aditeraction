// Builds the hero particle attributes off the main thread. Rasterises the brand
// symbol into an OffscreenCanvas, classifies the pixels and builds all five
// GPU attribute buffers, then transfers them back (zero-copy). Classification
// and attribute rules live in sampleMark.ts so the worker and the main-thread
// fallback stay in lock-step.
import { classify, buildAll, particleCount, SAMPLE_WIDTH } from "./sampleMark";

export interface ParticleRequest {
  url: string;
  narrow: boolean;
}

// The tsconfig uses the DOM lib (not WebWorker), so `self` is typed as a Window.
// Re-type the two members we touch to get a correct transferable postMessage.
interface WorkerScope {
  onmessage: ((e: MessageEvent<ParticleRequest>) => void) | null;
  postMessage(message: unknown, transfer?: Transferable[]): void;
}
const ctx = self as unknown as WorkerScope;

// Chromium/Firefox refuse createImageBitmap() on an SVG that declares only a
// viewBox (no intrinsic width/height) — "The source image could not be decoded."
// The brand symbol is exactly that shape, so inject width/height from the viewBox
// when the root <svg> lacks them. Returns the markup unchanged when already sized.
function ensureSvgSize(svg: string): string {
  const m = svg.match(/<svg\b[^>]*>/i);
  if (!m) return svg;
  const tag = m[0];
  if (/\bwidth\s*=/i.test(tag) && /\bheight\s*=/i.test(tag)) return svg;
  const vb = tag.match(
    /viewBox\s*=\s*["']\s*[\d.+-]+\s+[\d.+-]+\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i,
  );
  const w = vb ? vb[1] : "300";
  const h = vb ? vb[2] : "150";
  return svg.replace(tag, tag.replace(/<svg\b/i, `<svg width="${w}" height="${h}"`));
}

async function decode(blob: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(blob);
  } catch {
    // Retry with explicit dimensions derived from the viewBox.
    const sized = ensureSvgSize(await blob.text());
    return createImageBitmap(new Blob([sized], { type: "image/svg+xml" }));
  }
}

ctx.onmessage = async (e) => {
  const { url, narrow } = e.data;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const bitmap = await decode(blob);

    const aspect = bitmap.width && bitmap.height ? bitmap.height / bitmap.width : 1;
    const w = SAMPLE_WIDTH;
    const h = Math.max(1, Math.round(w * aspect));

    const canvas = new OffscreenCanvas(w, h);
    const c2d = canvas.getContext("2d", { willReadFrequently: true });
    if (!c2d) throw new Error("OffscreenCanvas 2d context unavailable");
    c2d.clearRect(0, 0, w, h);
    c2d.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const data = c2d.getImageData(0, 0, w, h).data;
    const classified = classify(data, w, h);
    const a = buildAll(classified, particleCount(narrow));

    ctx.postMessage(a, [
      a.position.buffer,
      a.aB.buffer,
      a.aC.buffer,
      a.aD.buffer,
      a.aR.buffer,
    ]);
  } catch (err) {
    ctx.postMessage({ error: err instanceof Error ? err.message : String(err) });
  }
};
