import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

// Cloudflare plugin must come first; React's plugin must come after Start's.
// (Per the official TanStack Start Cloudflare hosting guide.)
// tsconfig `paths` (~/* → ./src/*) resolved natively by Vite 8 — no plugin.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  // Emit the hero particle worker as a real ES module. Without this, Vite's
  // default worker format is `iife`, which is incompatible with a module worker
  // (`new Worker(url, { type: "module" })`) under the multi-environment build
  // (Cloudflare + TanStack Start client/ssr) — the worker chunk was never emitted
  // for the client, so `new Worker(...)` failed at runtime and every load fell
  // through to the main-thread fallback. `format: "es"` makes the client bundle
  // actually produce and reference the worker chunk.
  worker: { format: "es" },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
