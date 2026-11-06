import type { CSSProperties } from "react";
import { site } from "~/lib/site";
import { Eyebrow } from "~/components/ui/Eyebrow";
import { Reveal } from "~/components/motion/Reveal";
import { project, WORLD_VIEW } from "~/lib/worldProjection";
// Build-time dotted world map (one <path>, ~2.3k dots). Lazy <img>, so it never
// blocks first paint; the arc overlay is SSR-rendered inline SVG on top.
import worldDots from "~/assets/world-dots.svg?url";

// World reach (Phase 5c) — replaces the "At a glance" stats section in the same
// slot. Ink surface. The map is an <img> inside a fixed 2:1 aspect wrapper (no
// CLS); an absolutely-positioned inline <svg> with the SAME viewBox draws the
// Noida origin, a pulse, arcs to each client region, and a soft ring for "across
// India". Arc draw-in + pulse are CSS only (see app.css, gated on reduced motion
// and on the Reveal `data-revealed` flag). Region names also render as crawlable
// text chips below the map on all sizes.
const { reach } = site.home;

const origin = project(reach.origin.lat, reach.origin.lng);
const regions = reach.regions.map((r) => ({
  label: r.label,
  local: "local" in r && r.local === true,
  ...project(r.lat, r.lng),
}));
const arcs = regions.filter((r) => !r.local);

const pct = (v: number, span: number) => `${(v / span) * 100}%`;

// Quadratic arc from Noida to a region end point, bowed upward toward the top.
function arcPath(ex: number, ey: number): string {
  const mx = (origin.x + ex) / 2;
  const my = (origin.y + ey) / 2;
  const dist = Math.hypot(ex - origin.x, ey - origin.y);
  const cy = my - dist * 0.22; // lift the control point so the arc arches
  const f = (n: number) => n.toFixed(1);
  return `M${f(origin.x)},${f(origin.y)} Q${f(mx)},${f(cy)} ${f(ex)},${f(ey)}`;
}

export function HomeReach() {
  return (
    <section
      id="reach"
      aria-labelledby="reach-title"
      className="border-t border-line bg-ink"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <Eyebrow>{reach.eyebrow}</Eyebrow>
        <h2 id="reach-title" className="mt-5 font-display text-3xl text-paper sm:text-4xl">
          {reach.title}
        </h2>
        <p className="mt-5 max-w-xl text-graphite">{reach.body}</p>

        {/* Reveal wrapper carries `data-revealed` → arcs draw in on enter view. */}
        <Reveal className="relative mt-12 w-full aspect-[2/1]">
          <img
            src={worldDots}
            width={WORLD_VIEW.w}
            height={WORLD_VIEW.h}
            loading="lazy"
            decoding="async"
            alt=""
            className="block h-full w-full"
          />

          <svg
            viewBox={`0 0 ${WORLD_VIEW.w} ${WORLD_VIEW.h}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            {/* "Across India" — a soft ring around Noida instead of an arc. */}
            <circle
              className="reach-localring"
              cx={origin.x}
              cy={origin.y}
              r={22}
              fill="none"
              stroke="#FF4D2E"
              strokeOpacity={0.35}
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
            />

            {arcs.map((r, i) => (
              <path
                key={r.label}
                className="reach-arc"
                d={arcPath(r.x, r.y)}
                fill="none"
                stroke="#FF4D2E"
                strokeWidth={1.5}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
                style={{ "--arc-delay": `${i * 180}ms` } as CSSProperties}
              />
            ))}

            {arcs.map((r) => (
              <circle key={r.label} cx={r.x} cy={r.y} r={3} fill="#FF4D2E" />
            ))}

            {/* Noida origin — pulse ring behind a solid dot. */}
            <circle
              className="reach-pulse"
              cx={origin.x}
              cy={origin.y}
              r={6}
              fill="#FF4D2E"
              fillOpacity={0.5}
            />
            <circle cx={origin.x} cy={origin.y} r={4.5} fill="#FF4D2E" />
          </svg>

          {/* On-map labels — md+ only (too cramped below). Decorative. */}
          <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
            {[{ label: reach.origin.label, x: origin.x, y: origin.y }, ...arcs].map((pt) => (
              <span
                key={pt.label}
                className="absolute -translate-x-1/2 translate-y-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-graphite"
                style={{ left: pct(pt.x, WORLD_VIEW.w), top: pct(pt.y, WORLD_VIEW.h) }}
              >
                {pt.label}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Crawlable region list — every size. */}
        <ul aria-label="Client regions" className="mt-8 flex flex-wrap gap-2">
          {regions.map((r) => (
            <li
              key={r.label}
              className="border border-line px-2.5 py-1 font-mono text-xs uppercase tracking-[0.1em] text-paper/85"
            >
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
