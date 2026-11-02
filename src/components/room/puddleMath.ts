/**
 * Pure helpers for the roadside puddle: irregular outline and the duck's swim path.
 * Kept free of React/three so it can be unit tested.
 */

export type P2 = [number, number];

function hash(i: number, seed: number): number {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** Half-extents of the (non-circular) puddle in metres */
export const PUDDLE_RX = 0.85;
export const PUDDLE_RZ = 0.6;

/**
 * Control points for a closed, organic blob. Radii vary by +-25% per point so
 * the outline is never a circle or an ellipse.
 */
export function puddleControlPoints(count = 11, seed = 3): P2[] {
  const pts: P2[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + (hash(i, seed + 1) - 0.5) * 0.35;
    const r = 0.72 + 0.4 * hash(i, seed);
    pts.push([Math.cos(a) * PUDDLE_RX * r, Math.sin(a) * PUDDLE_RZ * r]);
  }
  return pts;
}

/** Smallest distance from the puddle centre to its control points */
export function minControlRadius(pts: P2[]): number {
  return Math.min(...pts.map(([x, z]) => Math.hypot(x, z)));
}

/** Where the duck is at time t (local puddle coordinates) */
export function duckPosition(t: number): P2 {
  return [Math.cos(t * 0.55) * 0.3, Math.sin(t * 0.8 + 0.6) * 0.2];
}

/** Analytic velocity of the duck at time t */
export function duckVelocity(t: number): P2 {
  return [-Math.sin(t * 0.55) * 0.3 * 0.55, Math.cos(t * 0.8 + 0.6) * 0.2 * 0.8];
}

/** Yaw (about y) that points the duck's beak (+z) along its direction of travel */
export function duckHeading(t: number): number {
  const [vx, vz] = duckVelocity(t);
  return Math.atan2(vx, vz);
}
