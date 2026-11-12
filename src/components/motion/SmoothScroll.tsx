import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import type LenisType from "lenis";
import { onLoadIdle } from "~/lib/idle";

// Phase 3 consumers read the live Lenis instance (or null under reduced motion
// / no-JS) via useLenis().
const LenisContext = createContext<LenisType | null>(null);
export const useLenis = () => useContext(LenisContext);

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function headerOffset(): number {
  if (typeof document === "undefined") return 0;
  const header = document.querySelector("header");
  return header instanceof HTMLElement ? header.offsetHeight : 0;
}

/**
 * Smooth scroll + scroll management, mounted once in __root.
 * - Lenis is dynamically imported inside the effect (client-only lazy chunk) and
 *   runs on its OWN rAF (autoRaf: true) — no GSAP, no GSAP ticker. GSAP and
 *   ScrollTrigger are fully removed from the project.
 * - The dynamic import is deferred to requestIdleCallback so Lenis module eval
 *   never lands in the hydration long task. Anchor/popstate listeners attach
 *   synchronously so navigation works immediately even before Lenis is ready.
 * - Lenis loads/starts ONLY on a fine-pointer, hover-capable device (desktop) with
 *   reduced motion off. Touch/coarse-pointer devices and reduced-motion users never
 *   download or run it — native scroll is used. Preference changes re-apply live.
 * - Route changes jump to top; #hash targets scroll with a header offset;
 *   back/forward restores the saved position. All teardown on unmount/HMR.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<LenisType | null>(null);
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    let instance: LenisType | null = null;
    const positions = new Map<string, number>();
    let navType: "push" | "pop" = "push";
    let currentKey =
      (router.state.location.state as { key?: string } | undefined)?.key ??
      router.state.location.href;

    const mq = window.matchMedia(REDUCE_QUERY);
    const prevHistoryRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* some browsers disallow — harmless */
    }

    const scrollToY = (y: number, immediate = true) => {
      if (instance) instance.scrollTo(y, { immediate });
      else window.scrollTo(0, y);
    };

    const scrollToHash = (hash: string) => {
      const el = document.getElementById(hash.replace(/^#/, ""));
      if (!el) return;
      if (instance) {
        instance.scrollTo(el, { offset: -headerOffset() - 8 });
      } else {
        // No Lenis (touch / reduced motion / not yet started): native scroll.
        // scroll-margin-top keeps the target clear of the sticky header.
        el.style.scrollMarginTop = `${headerOffset() + 8}px`;
        el.scrollIntoView({ behavior: mq.matches ? "auto" : "smooth", block: "start" });
      }
    };

    const onScroll = () => {
      positions.set(currentKey, instance ? instance.scroll : window.scrollY);
    };

    const onPopState = () => {
      navType = "pop";
    };

    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const target = e.target as Element | null;
      const anchor = target?.closest("a");
      const href = anchor?.getAttribute("href");
      if (href && href.length > 1 && href.startsWith("#")) {
        const el = document.getElementById(href.slice(1));
        if (el) {
          e.preventDefault();
          scrollToHash(href);
        }
      }
    };

    const handleNav = (to: { hash?: string; href: string; state?: unknown }) => {
      const newKey = (to.state as { key?: string } | undefined)?.key ?? to.href;
      if (to.hash) {
        // allow the new DOM to paint before measuring the target
        requestAnimationFrame(() => scrollToHash(to.hash!));
      } else if (navType === "pop") {
        const y = positions.get(newKey) ?? 0;
        scrollToY(y, true);
      } else {
        scrollToY(0, true);
      }
      navType = "push";
      currentKey = newKey;
    };

    const attachShared = () => {
      window.addEventListener("popstate", onPopState);
      document.addEventListener("click", onAnchorClick);
    };
    const detachShared = () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onAnchorClick);
    };

    async function setup() {
      // Only desktop-class input (hover + fine pointer) with motion allowed gets
      // Lenis. Touch/coarse devices and reduced-motion users use native scroll and
      // never download the chunk (the dynamic import lives in the else branch).
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (mq.matches || !canHover) {
        instance = null;
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        const { default: Lenis } = await import("lenis");
        if (disposed) return;
        // autoRaf: Lenis drives its own requestAnimationFrame loop — no ticker.
        instance = new Lenis({ autoRaf: true });
        instance.on("scroll", onScroll);
      }
      if (disposed) {
        instance?.destroy();
        return;
      }
      setLenis(instance);
    }

    function teardown() {
      window.removeEventListener("scroll", onScroll);
      instance?.destroy();
      instance = null;
      setLenis(null);
    }

    const onPreferenceChange = () => {
      teardown();
      void setup();
    };
    mq.addEventListener("change", onPreferenceChange);

    attachShared();

    // Defer Lenis init to load + idle — native scroll works immediately (anchor
    // and popstate listeners attached above), and Lenis's module eval + init land
    // in an idle slice instead of the hydration long task. Attaching does not move
    // the scroll position, so there is no jump when it takes over.
    const cancelIdle = onLoadIdle(() => void setup());

    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      handleNav(toLocation as { hash?: string; href: string; state?: unknown });
    });

    return () => {
      disposed = true;
      unsubscribe();
      mq.removeEventListener("change", onPreferenceChange);
      detachShared();
      cancelIdle();
      window.removeEventListener("scroll", onScroll);
      instance?.destroy();
      try {
        window.history.scrollRestoration = prevHistoryRestoration;
      } catch {
        /* ignore */
      }
    };
    // router is stable for the app lifetime; set up once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
