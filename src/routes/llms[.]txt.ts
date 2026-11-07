import { createFileRoute } from "@tanstack/react-router";
import { buildLlmsTxt } from "~/lib/llms";

// /llms.txt — TanStack Start server route (no component). Concise, llmstxt.org
// Markdown index of the studio, built from site.ts. See src/lib/llms.ts.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsTxt(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
