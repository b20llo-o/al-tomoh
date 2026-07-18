import { cn } from "@/lib/utils";

/**
 * A red nine-pointed star ("seal") showing the discount percentage. It is meant
 * to be pinned OUTSIDE the top corner of a book cover (via absolute positioning
 * from the parent) so it never hides any part of the artwork.
 */
export function DiscountBadge({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  const outer = starPoints(9, 50, 50, 48, 33);
  const inner = starPoints(9, 50, 50, 40, 28);
  const gradId = `disc-${percent}`;

  return (
    <div className={cn("pointer-events-none absolute z-20", className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0323f" />
            <stop offset="100%" stopColor="#c40f1b" />
          </linearGradient>
          <filter id={`${gradId}-sh`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        {/* Outer star with soft shadow + white rim */}
        <polygon
          points={outer}
          fill={`url(#${gradId})`}
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinejoin="round"
          filter={`url(#${gradId}-sh)`}
        />
        {/* Subtle inner star outline for a crisper, "sealed" look */}
        <polygon
          points={inner}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <text
          x="50"
          y="51"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#ffffff"
          fontWeight="800"
          fontSize="26"
          fontFamily="Arial, sans-serif"
        >
          -{percent}%
        </text>
      </svg>
    </div>
  );
}

/** Build the polygon points for an N-pointed star. */
function starPoints(
  spikes: number,
  cx: number,
  cy: number,
  outer: number,
  inner: number
): string {
  const step = Math.PI / spikes;
  const coords: string[] = [];
  let rot = -Math.PI / 2; // start at the top
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    coords.push(`${(cx + Math.cos(rot) * r).toFixed(2)},${(cy + Math.sin(rot) * r).toFixed(2)}`);
    rot += step;
  }
  return coords.join(" ");
}
