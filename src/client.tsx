import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

// Explicit client entry. TanStack Start resolves `src/client` by convention and
// otherwise falls back to its built-in entry (which is identical to this). It is
// made explicit here so the hydration call is in-repo and controllable.
//
// Hydration runs inside startTransition: React treats it as non-urgent, so it can
// yield between hydrating units and process input instead of blocking the main
// thread in one long task. Combined with the per-section <Suspense> boundaries on
// the routes, below-the-fold sections hydrate as separate, interruptible units.
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
