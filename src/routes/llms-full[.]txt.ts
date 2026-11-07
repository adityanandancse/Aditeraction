import { createFileRoute } from "@tanstack/react-router";
import { buildLlmsFullTxt } from "~/lib/llms";

// /llms-full.txt — TanStack Start server route (no component). Same header as
// /llms.txt plus every FAQ (global + per service), grouped by page. See llms.ts.
export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsFullTxt(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
