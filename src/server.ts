// Custom TanStack Start server entry. The Start plugin resolves `src/server` by
// convention and aliases it behind "@tanstack/react-start/server-entry" (the
// `main` in wrangler.jsonc), so no config change is needed.
//
// Adds three things around the stock handler:
//   1. www → apex: any host starting with "www." gets a 301 to the same
//      path + query on the apex host.
//   2. Legacy URLs from the old Hostinger site (.html/.htm/.php, /home) get a
//      301 to the matching current route.
//   3. Security headers on every response.
//
// NO Content-Security-Policy for now, on purpose: the site ships inline styles
// (the production stylesheet is inlined in <head>), inline scripts (the JS-class
// bootstrap, JSON-LD, the router's hydration payload) and a module worker for
// the hero. A CSP strict enough to be worth having would break those until
// nonces/hashes and a worker-src rule are wired through.
import {
  createStartHandler,
  defaultStreamHandler,
  createServerEntry,
} from "@tanstack/react-start/server";

// Old Hostinger site URLs → current routes (keys lowercase). Add new entries
// here as Search Console reports 404s for legacy URLs.
export const LEGACY_REDIRECTS: Record<string, string> = {
  "/index.html": "/",
  "/index.htm": "/",
  "/index.php": "/",
  "/home": "/",
  "/home.html": "/",
  "/privacy-policy.html": "/privacy",
  "/privacy.html": "/privacy",
  "/privacy-policy.php": "/privacy",
  "/about.html": "/about",
  "/about-us.html": "/about",
  "/contact.html": "/contact",
  "/contact-us.html": "/contact",
  "/services.html": "/services",
  "/service.html": "/services",
  "/portfolio.html": "/",
  "/work.html": "/",
  "/projects.html": "/",
};

const LEGACY_EXTENSION = /\.(html?|php)$/;
const LEGACY_KEYWORDS: Array<[string, string]> = [
  ["privacy", "/privacy"],
  ["about", "/about"],
  ["contact", "/contact"],
  ["service", "/services"],
];

// Returns the current route for a legacy URL, or null if the path isn't one.
function legacyRedirectTarget(method: string, pathname: string): string | null {
  if (method !== "GET" && method !== "HEAD") return null;
  const path = pathname.toLowerCase();
  if (path.startsWith("/assets/") || path.startsWith("/og/")) return null;
  if (path !== "/home" && !LEGACY_EXTENSION.test(path)) return null;

  const mapped = Object.hasOwn(LEGACY_REDIRECTS, path) ? LEGACY_REDIRECTS[path] : undefined;
  if (mapped !== undefined) return mapped;

  const filename = path.slice(path.lastIndexOf("/") + 1).replace(LEGACY_EXTENSION, "");
  for (const [keyword, target] of LEGACY_KEYWORDS) {
    if (filename.includes(keyword)) return target;
  }
  return "/";
}

const startFetch = createStartHandler(defaultStreamHandler);

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

function withSecurityHeaders(response: Response): Response {
  try {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(name, value);
    }
    return response;
  } catch {
    // Immutable headers (e.g. a Response passed straight through from fetch()):
    // re-wrap with a mutable copy of the headers and the same body/status.
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(name, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

export default createServerEntry({
  async fetch(request, ...rest) {
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;

    if (host.toLowerCase().startsWith("www.")) {
      url.host = host.slice(4); // keeps any port; path + query stay as-is
      return withSecurityHeaders(
        new Response(null, { status: 301, headers: { Location: url.toString() } }),
      );
    }

    const legacyTarget = legacyRedirectTarget(request.method, url.pathname);
    if (legacyTarget !== null) {
      // Absolute apex URL (www is already handled above); query string dropped.
      return withSecurityHeaders(
        new Response(null, { status: 301, headers: { Location: url.origin + legacyTarget } }),
      );
    }

    return withSecurityHeaders(await startFetch(request, ...rest));
  },
});
