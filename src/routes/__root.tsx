import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
// Dev: load the stylesheet as a file so Vite HMR applies CSS edits live.
// Prod: inline the compiled sheet (below) so first paint needs no extra CSS
// request — the whole file is small (~7.7KB brotli) and was flagged as the only
// render-blocking resource on the home page.
import appCssUrl from "~/styles/app.css?url";
import appCssInline from "~/styles/app.css?inline";
// Preload the latin variable woff2 that the H1 (Space Grotesk) and body (Inter)
// need first paint. JetBrains Mono is NOT preloaded (below the fold, mono UI).
import spaceGroteskLatin from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
import interLatin from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import { site } from "~/lib/site";
import { Header } from "~/components/layout/Header";
import { Footer } from "~/components/layout/Footer";
import { NotFound } from "~/components/layout/NotFound";
import { SmoothScroll } from "~/components/motion/SmoothScroll";

// Runs before paint: marks the document as JS-capable so the reveal hidden
// state can apply, and flags repeat visits so the intro loader shows once per
// session. Without JS this never runs and all content stays visible.
const JS_CLASS =
  "document.documentElement.classList.add('js');try{if(sessionStorage.getItem('adx-intro'))document.documentElement.classList.add('intro-seen')}catch(e){}";

// In production the built CSS is inlined into <head>; in dev it stays a linked
// file so CSS hot-module-reload keeps working.
const PROD = import.meta.env.PROD;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0B0B0D" },
      { name: "author", content: site.name },
    ],
    links: [
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: spaceGroteskLatin,
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: interLatin,
        crossOrigin: "anonymous",
      },
      // Dev only: external stylesheet (keeps CSS HMR). In prod the sheet is
      // inlined via `styles` below instead of a render-blocking <link>.
      ...(PROD ? [] : [{ rel: "stylesheet", href: appCssUrl }]),
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", href: "/icons/icon-32.png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
    ],
    // Prod only: inline the entire built stylesheet into a <head> <style>, so
    // the first paint needs no extra CSS request (fixes the ~846ms render-block
    // on /assets/app-*.css). TanStack renders this identically on the server and
    // during hydration, so there is no FOUC and no CLS change — the same rules
    // apply at first paint as before. Font preloads above are untouched, and the
    // @font-face / font-display: swap rules now live inside this inlined CSS.
    ...(PROD ? { styles: [{ children: appCssInline }] } : {}),
  }),
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_CLASS }} />
        <HeadContent />
      </head>
      <body>
        <SmoothScroll>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <Scripts />
      </body>
    </html>
  );
}
