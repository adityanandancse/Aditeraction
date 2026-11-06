// The primary horizontal lockup (mark + wordmark), inlined from the cleaned asset
// in src/assets/brand (the brand/ masters are read-only). Imported as a raw SVG
// string so the rendered markup is the exact asset; it carries role="img"
// aria-label="Aditeraction". The SVG uses `currentColor` for the wordmark and
// brackets, so the caller controls the colour via text colour: Paper on Ink
// surfaces (`text-paper`), Ink on Paper surfaces (`text-ink`). The nib and i-dots
// stay Vermilion. The svg has no width/height (viewBox 8980:995) so CSS sets the
// height and the width follows the aspect ratio.
import logoSvg from "~/assets/brand/logo.svg?raw";

/** The primary horizontal lockup (mark + wordmark). Inherits colour via currentColor. */
export function LogoHorizontal({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex text-current [&_svg]:block [&_svg]:h-full [&_svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: logoSvg }}
    />
  );
}
