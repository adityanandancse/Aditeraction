import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { NotFound } from "./components/layout/NotFound";

// TanStack Start resolves `src/router` as the router entry and calls getRouter().
export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    // Scroll is owned by SmoothScroll (Lenis-aware top/restore/hash). Opacity
    // crossfade on <main> via the browser View Transitions API.
    scrollRestoration: false,
    defaultViewTransition: true,
    defaultPreload: "intent",
    defaultNotFoundComponent: () => <NotFound />,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
