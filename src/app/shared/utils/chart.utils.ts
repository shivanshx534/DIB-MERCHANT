/** Small, dependency-free helpers for the SVG charts. */

export interface Pt {
  x: number;
  y: number;
}

/** Linear scale: maps [d0, d1] -> [r0, r1]. */
export function scale(d0: number, d1: number, r0: number, r1: number) {
  const k = d1 === d0 ? 0 : (r1 - r0) / (d1 - d0);
  return (v: number) => r0 + (v - d0) * k;
}

/** Straight polyline path. */
export function linePath(points: Pt[]): string {
  return points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

/** Smooth path with horizontal-tangent cubic segments (matches the Figma curves). */
export function smoothPath(points: Pt[]): string {
  if (!points.length) return '';
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const cx = (a.x + b.x) / 2;
    d += ` C${cx.toFixed(1)} ${a.y.toFixed(1)} ${cx.toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

/** Closes a line path down to a baseline to make an area. */
export function areaPath(points: Pt[], baseline: number, smooth = true): string {
  if (!points.length) return '';
  const top = smooth ? smoothPath(points) : linePath(points);
  const last = points[points.length - 1];
  return `${top} L${last.x.toFixed(1)} ${baseline} L${points[0].x.toFixed(1)} ${baseline} Z`;
}
