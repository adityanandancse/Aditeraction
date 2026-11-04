import { createElement, useCallback, type CSSProperties, type ElementType, type ReactNode } from "react";
import { observeReveal } from "./reveal-observer";

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** translateY start distance in px (default 16). */
  y?: number;
  /** base transition delay in ms (default 0). */
  delay?: number;
}

/**
 * Below-the-fold reveal wrapper. SSR-safe: it only emits a `data-reveal`
 * attribute — NEVER inline opacity:0. The initial hidden state is applied by
 * CSS gated on `.js [data-reveal]` (see app.css), so with JS disabled or before
 * hydration everything is fully visible. Never wrap an H1, the hero, or any
 * above-the-fold LCP candidate.
 */
export function Reveal({ as = "div", children, className, y = 16, delay = 0 }: RevealProps) {
  const setRef = useCallback((node: HTMLElement | null) => {
    if (node) observeReveal(node);
  }, []);

  return createElement(
    as,
    {
      ref: setRef,
      "data-reveal": "",
      "data-reveal-delay": delay,
      className,
      style: { "--reveal-y": `${y}px` } as CSSProperties,
    },
    children,
  );
}
