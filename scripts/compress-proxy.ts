// Local measurement proxy — makes `vite preview` behave like Cloudflare's edge,
// which brotli-compresses text responses. `vite preview` sends everything
// uncompressed, so a local Lighthouse run over-reports transfer size and LCP.
// This proxy sits in front of it and compresses text responses, giving an
// honest, prod-shaped measurement WITHOUT deploying.
//
// It also launches `vite preview` as a child so one command runs both (see the
// `preview:prod` package.json script). Build first: `bun run build`.
//
//   bun run build
//   bun run preview:prod      # → open http://localhost:4174
//
// Not for production serving — measurement only.
import { brotliCompressSync, constants } from "node:zlib";

const PROXY_PORT = 4174;
const ORIGIN_PORT = 4173;
const ORIGIN = `http://localhost:${ORIGIN_PORT}`;

// Content types we compress (mirrors what Cloudflare brotli-compresses).
const TEXT_TYPE =
  /^(?:text\/html|text\/css|application\/javascript|text\/javascript|application\/json|image\/svg\+xml|application\/xml|text\/xml|text\/plain)\b/i;

// Quality 11 for static assets (served many times, compressed once); a lighter
// quality 5 for HTML (generated per request — matches Cloudflare's dynamic path).
const Q_ASSET = 11;
const Q_HTML = 5;

function wantsBrotli(accept: string | null): boolean {
  return !!accept && /(^|,)\s*br\s*(;|,|$)/i.test(accept);
}

// Launch `vite preview` as a child so the two run together from one command.
const child = Bun.spawn(
  ["bunx", "vite", "preview", "--port", String(ORIGIN_PORT), "--strictPort"],
  { stdio: ["inherit", "inherit", "inherit"] },
);

function shutdown() {
  try {
    child.kill();
  } catch {
    /* already gone */
  }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const server = Bun.serve({
  port: PROXY_PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const target = ORIGIN + url.pathname + url.search;

    // Forward the request, but ask the origin for identity so we compress once.
    const fwdHeaders = new Headers(req.headers);
    fwdHeaders.set("accept-encoding", "identity");
    fwdHeaders.set("host", `localhost:${ORIGIN_PORT}`);

    let origin: Response;
    try {
      origin = await fetch(target, {
        method: req.method,
        headers: fwdHeaders,
        body:
          req.method === "GET" || req.method === "HEAD"
            ? undefined
            : await req.arrayBuffer(),
        redirect: "manual",
      });
    } catch {
      return new Response(
        `Compress proxy: origin ${ORIGIN} unreachable — run \`bun run build\` first, or wait for vite preview to start.`,
        { status: 502, headers: { "content-type": "text/plain" } },
      );
    }

    const contentType = origin.headers.get("content-type") ?? "";
    const headers = new Headers(origin.headers);

    if (origin.status === 200 && wantsBrotli(req.headers.get("accept-encoding")) && TEXT_TYPE.test(contentType)) {
      const body = Buffer.from(await origin.arrayBuffer());
      const quality = /^text\/html\b/i.test(contentType) ? Q_HTML : Q_ASSET;
      const compressed = brotliCompressSync(body, {
        params: {
          [constants.BROTLI_PARAM_QUALITY]: quality,
          [constants.BROTLI_PARAM_SIZE_HINT]: body.length,
        },
      });
      headers.set("content-encoding", "br");
      headers.set("content-length", String(compressed.length));
      // Ensure caches key on encoding (append — don't clobber an existing Vary).
      const vary = headers.get("vary");
      if (!vary) headers.set("vary", "Accept-Encoding");
      else if (!/accept-encoding/i.test(vary)) headers.set("vary", `${vary}, Accept-Encoding`);
      return new Response(compressed, { status: origin.status, headers });
    }

    // Everything else passes through untouched (images, fonts, already-encoded, etc.).
    return new Response(origin.body, { status: origin.status, headers });
  },
});

console.log(`\nCompress proxy  ┆  http://localhost:${server.port}  →  ${ORIGIN}  (brotli text, q${Q_ASSET}/q${Q_HTML})\n`);
