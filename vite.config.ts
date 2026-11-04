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
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
