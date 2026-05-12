import { useMemo } from 'react';

/**
 * HeatmapCanvas — renders click coordinates as radial-gradient heat dots
 * on a dark canvas, with color intensity based on click density.
 *
 * Props:
 *   clicks  — array of { x, y } objects
 *   width   — container width in px
 *   height  — container height in px
 */
export default function HeatmapCanvas({ clicks = [], width = 800, height = 500 }) {
  // Compute density at each point using a simple proximity count
  const enriched = useMemo(() => {
    const RADIUS = 60;
    return clicks.map((c) => {
      const nearby = clicks.filter(
        (o) => Math.hypot(o.x - c.x, o.y - c.y) < RADIUS
      ).length;
      return { ...c, density: nearby };
    });
  }, [clicks]);

  const maxDensity = useMemo(
    () => Math.max(1, ...enriched.map((c) => c.density)),
    [enriched]
  );

  /** Map density ratio 0–1 to a CSS radial-gradient color */
  function heatColor(ratio) {
    // cold (blue) → warm (orange) → hot (red)
    if (ratio < 0.33) return `rgba(59,130,246,${0.3 + ratio * 1.5})`;   // blue
    if (ratio < 0.66) return `rgba(251,146,60,${0.4 + ratio})`;         // orange
    return `rgba(239,68,68,${0.6 + ratio * 0.4})`;                      // red
  }

  if (!clicks.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-[#0a0a12]"
      style={{ width: '100%', aspectRatio: `${width} / ${height}` }}
    >
      {/* Grid overlay for visual reference */}
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0 opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Page wireframe placeholder */}
      <div className="absolute inset-0 flex flex-col gap-3 p-6 pointer-events-none opacity-[0.06]">
        <div className="h-8 w-48 rounded bg-white" />
        <div className="h-4 w-full rounded bg-white" />
        <div className="h-4 w-5/6 rounded bg-white" />
        <div className="h-4 w-4/6 rounded bg-white" />
        <div className="flex gap-3 mt-2">
          <div className="h-24 flex-1 rounded bg-white" />
          <div className="h-24 flex-1 rounded bg-white" />
          <div className="h-24 flex-1 rounded bg-white" />
        </div>
      </div>

      {/* Heat dots */}
      {enriched.map((c, i) => {
        const ratio = c.density / maxDensity;
        const size = 40 + ratio * 80; // 40px → 120px
        const color = heatColor(ratio);

        return (
          <div
            key={i}
            className="heat-dot"
            style={{
              left: `${(c.x / width) * 100}%`,
              top: `${(c.y / height) * 100}%`,
              width: size,
              height: size,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            }}
          />
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 backdrop-blur-sm">
        <div className="flex gap-0.5">
          {['rgba(59,130,246,0.7)', 'rgba(251,146,60,0.8)', 'rgba(239,68,68,0.9)'].map(
            (col, i) => (
              <div
                key={i}
                className="h-2.5 w-6 first:rounded-l-full last:rounded-r-full"
                style={{ background: col }}
              />
            )
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">Low → High</span>
      </div>
    </div>
  );
}
