/**
 * Pure motion constants for the venetian window, kept separate from the React
 * component so they can be unit tested.
 *
 * A slat is a thin plate. Rotation 0 = flat/horizontal (edge-on to the viewer,
 * so light passes = OPEN). Around 75° it stands almost vertical and, because
 * the slat is wider than the pitch, overlaps its neighbours (CLOSED).
 */
export const SLAT_CLOSED_ANGLE = 1.31;
export const SLAT_OPEN_ANGLE = 0.12;
/** Fraction of the blind that gathers at the head rail when fully open */
export const BLIND_GATHER = 0.55;
/** How far the lower sash slides up when open, as a fraction of its height */
export const SASH_TRAVEL = 0.8;

/** open: 0 (closed) .. 1 (open) */
export function blindAngle(open: number): number {
  return SLAT_CLOSED_ANGLE + (SLAT_OPEN_ANGLE - SLAT_CLOSED_ANGLE) * open;
}

export function blindSpacing(pitch: number, open: number): number {
  return pitch * (1 - BLIND_GATHER * open);
}

/** Does a closed blind overlap its neighbours (no gaps)? */
export function projectedSlatHeight(slatWidth: number, angle: number): number {
  return slatWidth * Math.sin(angle);
}
