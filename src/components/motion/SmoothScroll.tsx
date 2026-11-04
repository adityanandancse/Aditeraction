import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "@tanstack/react-router";
import type LenisType from "lenis";

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
 * - Lenis/GSAP/ScrollTrigger are dynamically imported inside the effect, so
 *   they stay out of the SSR/critical bundle (client-only lazy chunks).
 * - Lenis is driven by the GSAP ticker (autoRaf: false) and kept in sync with
 *   ScrollTrigger.
 * - prefers-reduced-motion: reduce → Lenis is NOT initialised (native scroll);
 *   changes to the preference are listened for and re-applied live.
 * - Route changes jump to top; #hash targets scroll with a header offset;
 *   back/forward restores the saved position. All teardown on unmount/HMR.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<LenisType | null>(null);
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    let instance: LenisType | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let removeGsapTicker: (() => void) | null = null;
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
      const offset = -headerOffset() - 8;
      if (instance) {
        instance.scrollTo(el, { offset });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top });
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
      if (mq.matches) {
        // Reduced motion: native scroll, no Lenis.
        instance = null;
        window.addEventListener("scroll", onScroll, { passive: true });
      } else {
        const [{ default: Lenis }, gsapMod, stMod] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (disposed) return;
        const gsap = gsapMod.gsap ?? gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        instance = new Lenis({ autoRaf: false });

        tickerFn = (time: number) => {
          instance?.raf(time * 1000);
        };
        gsap.ticker.add(tickerFn);
        gsap.ticker.lagSmoothing(0);
        removeGsapTicker = () => {
          if (tickerFn) gsap.ticker.remove(tickerFn);
        };

        instance.on("scroll", ScrollTrigger.update);
        instance.on("scroll", onScroll);
      }
      if (disposed) {
        instance?.destroy();
        return;
      }
      setLenis(instance);
    }

    function teardown() {
      removeGsapTicker?.();
      removeGsapTicker = null;
      tickerFn = null;
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
    void setup();

    const unsubscribe = router.subscribe("onResolved", ({ toLocation }) => {
      handleNav(toLocation as { hash?: string; href: string; state?: unknown });
    });

    return () => {
      disposed = true;
      unsubscribe();
      mq.removeEventListener("change", onPreferenceChange);
      detachShared();
      removeGsapTicker?.();
      window.removeEventListener("scroll", onScroll);
      instance?.destroy();
      // kill any ScrollTriggers created this session (no HMR leaks)
      import("gsap/ScrollTrigger")
        .then(({ ScrollTrigger }) => ScrollTrigger.getAll().forEach((t) => t.kill()))
        .catch(() => {});
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
