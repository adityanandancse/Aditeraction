// The primary horizontal lockup, inlined ONCE (the header, above the fold) from
// the svgo-optimized copy in src/assets/brand (the brand/ masters are read-only).
// Imported as a raw SVG string so the rendered markup is the exact asset, not a
// hand-drawn approximation; it already carries role="img" aria-label="Aditeraction".
// Every other placement (footer, hero) uses an <img> of the optimized file so the
// same SVG markup is never re-inlined.
import horizontalSvg from "~/assets/brand/aditeraction-logo-horizontal-on-dark.svg?raw";

/** The primary horizontal lockup (symbol + wordmark) for dark surfaces. */
export function LogoHorizontal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex [&_svg]:block [&_svg]:h-full [&_svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: horizontalSvg }}
    />
  );
}
