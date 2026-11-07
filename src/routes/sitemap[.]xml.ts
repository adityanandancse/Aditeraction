import { createFileRoute } from "@tanstack/react-router";
import { buildSitemap } from "~/lib/sitemap";

// /sitemap.xml — TanStack Start server route (no component), so the XML is built
// from site.ts on every request and never drifts from the live routes. Cached for
// an hour at the edge/browser. See src/lib/sitemap.ts for the inclusion rules.
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
