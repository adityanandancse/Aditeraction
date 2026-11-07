// Ambient type for the virtual module provided by @cloudflare/vite-plugin at
// runtime (and resolved only in the Worker/SSR environment). `env` carries the
// Worker's bindings, vars and secrets — e.g. RESEND_API_KEY. Server-only.
declare module "cloudflare:workers" {
  export const env: Record<string, string | undefined>;
}
