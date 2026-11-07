/**
 * Procedural walk cycle with explicit foot placement.
 *
 * Each foot is given a target in the hip's sagittal plane: during stance it
 * slides back at exactly the body's ground speed (so it stays planted in the
 * world), during swing it arcs forward. A two-bone IK solve turns that into
 * hip and knee angles, and the pelvis height is whatever keeps both ankles in
 * reach, which gives the dip at double support and the rise at mid stance.
 *
 * Kept free of imports so tests can load it directly.
 */

export interface LegDims {
  thigh: number;
  shin: number;
  hipY: number;
}

/** Metres of travel per full cycle (left + right step) */
const CYCLE = 1.3;
/** Fraction of the cycle a foot spends on the ground */
const STANCE = 0.52;
/** Peak foot clearance during swing */
const LIFT = 0.085;
/** How far the pelvis stays below fully-extended at mid stance */
const SOFT_KNEE = 0.012;
/** Extra margin so a "straight" leg keeps a little flex */
const REACH_MARGIN = 0.003;

export const GAIT = { cycle: CYCLE, stance: STANCE, lift: LIFT } as const;

export interface LegPose {
  /** Hip rotation.x (negative swings the foot forward) */
  hip: number;
  /** Knee rotation.x (positive flexes) */
  knee: number;
}

export interface GaitSample {
  left: LegPose;
  right: LegPose;
  /** Hip pivot height above the ground (standing = dims.hipY) */
  hipHeight: number;
  /** Smooth -1..1 swing signal; +1 when the left foot is furthest forward */
  armPhase: number;
  /** Smooth -1..1 lateral sway signal (+ = weight on the left leg) */
  sway: number;
}

const TAU = Math.PI * 2;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const fract = (x: number) => x - Math.floor(x);
const smooth = (s: number) => s * s * (3 - 2 * s);

/** Foot position (forward of the hip) and lift for a point in the cycle */
export function footTarget(u: number, stride: number): { z: number; lift: number } {
  const amp = (stride * STANCE * CYCLE) / 2;
  if (u < STANCE) {
    return { z: amp * (1 - (2 * u) / STANCE), lift: 0 };
  }
  const s = (u - STANCE) / (1 - STANCE);
  return { z: amp * (-1 + 2 * smooth(s)), lift: LIFT * Math.min(1, stride * 1.4) * Math.sin(Math.PI * s) };
}

function solveLeg(dims: LegDims, z: number, drop: number): LegPose {
  const { thigh: T, shin: S } = dims;
  const D = clamp(Math.hypot(z, drop), Math.abs(T - S) + 0.02, T + S - REACH_MARGIN);
  const knee = Math.PI - Math.acos(clamp((T * T + S * S - D * D) / (2 * T * S), -1, 1));
  const alpha = Math.acos(clamp((T * T + D * D - S * S) / (2 * T * D), -1, 1));
  const phi = Math.atan2(z, drop);
  return { hip: -(phi + alpha), knee };
}

/**
 * @param gait   accumulated phase in radians (TAU = one full cycle)
 * @param stride 0..1 step size (1 = full walking stride, small = shuffling on the spot)
 */
export function sampleGait(gait: number, stride: number, dims: LegDims): GaitSample {
  const u = fract(gait / TAU);
  const l = footTarget(u, stride);
  const r = footTarget(fract(u + 0.5), stride);

  const ankle = dims.hipY - dims.thigh - dims.shin;
  const reach = dims.thigh + dims.shin - REACH_MARGIN;
  const maxHeight = (f: { z: number; lift: number }) =>
    ankle + f.lift + Math.sqrt(Math.max(0, reach * reach - f.z * f.z));
  const hipHeight = Math.min(dims.hipY - SOFT_KNEE, maxHeight(l), maxHeight(r));

  return {
    left: solveLeg(dims, l.z, hipHeight - ankle - l.lift),
    right: solveLeg(dims, r.z, hipHeight - ankle - r.lift),
    hipHeight,
    armPhase: Math.cos(gait - 0.12),
    sway: Math.sin(gait),
  };
}
