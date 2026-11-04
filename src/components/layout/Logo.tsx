// Real brand marks, inlined from brand/ (read-only — never modified).
// Imported as raw SVG strings so the rendered markup is the exact master asset,
// not a hand-drawn approximation. The source SVGs already carry
// role="img" aria-label="Aditeraction".
import symbolSvg from "../../../brand/aditeraction-symbol-on-dark.svg?raw";
import horizontalSvg from "../../../brand/aditeraction-logo-horizontal-on-dark.svg?raw";

/** The standalone code-nib symbol (Paper strokes + Vermilion nib) for dark surfaces. */
export function SymbolMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex [&_svg]:block [&_svg]:h-full [&_svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: symbolSvg }}
    />
  );
}

/** The primary horizontal lockup (symbol + wordmark) for dark surfaces. */
export function LogoHorizontal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex [&_svg]:block [&_svg]:h-full [&_svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: horizontalSvg }}
    />
  );
}
