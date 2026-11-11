/** Pure helpers for the camera rig (unit tested). */

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 1.7;

export function clampZoom(z: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
}

/** Convert a wheel delta (pixels or lines) into a multiplicative zoom change */
export function zoomFromWheel(current: number, deltaY: number, deltaMode = 0): number {
  const pixels = deltaMode === 1 ? deltaY * 16 : deltaMode === 2 ? deltaY * 400 : deltaY;
  return clampZoom(current * Math.exp(pixels * 0.0012));
}

/** Pinch: ratio of new finger distance to old (>1 = fingers apart = zoom in) */
export function zoomFromPinch(current: number, previousDistance: number, newDistance: number): number {
  if (previousDistance <= 0 || newDistance <= 0) return current;
  return clampZoom(current * (previousDistance / newDistance));
}

/** Orbit limits: never under the floor, never straight down */
export const ELEVATION_MIN = 0.2;
export const ELEVATION_MAX = 1.3;
/** Radians of orbit per pixel dragged */
export const ORBIT_SPEED = 0.006;

/** Drag by (dx, dy) pixels: right drag swings the view left round the room, down drag raises it */
export function orbitFromDrag(azimuth: number, elevation: number, dx: number, dy: number): [number, number] {
  const el = Math.min(ELEVATION_MAX, Math.max(ELEVATION_MIN, elevation + dy * ORBIT_SPEED));
  return [azimuth - dx * ORBIT_SPEED, el];
}

/** How far (world units) the view may slide away from the house, so nobody gets lost */
export const PAN_LIMIT = 6;

/**
 * Slide the ground-plane target so the scene follows a (dx, dy) pixel drag.
 * unitsPerPixel is the world size of one pixel at the target; vertical drags
 * are stretched by the camera tilt so the ground keeps up with the finger.
 */
export function panFromDrag(
  pan: [number, number],
  azimuth: number,
  elevation: number,
  dx: number,
  dy: number,
  unitsPerPixel: number
): [number, number] {
  const c = Math.cos(azimuth);
  const s = Math.sin(azimuth);
  const v = dy / Math.max(0.3, Math.sin(elevation));
  let x = pan[0] - (c * dx + s * v) * unitsPerPixel;
  let z = pan[1] + (s * dx - c * v) * unitsPerPixel;
  const len = Math.hypot(x, z);
  if (len > PAN_LIMIT) {
    x *= PAN_LIMIT / len;
    z *= PAN_LIMIT / len;
  }
  return [x, z];
}

/** Distance multiplier so the whole house fits narrow (portrait) screens; measured, 1.04 = house width at home angle */
export function portraitFit(aspect: number): number {
  return Math.max(1, 1.04 / aspect);
}

/** Unit view direction (target -> camera) for an azimuth around y and an elevation above the floor */
export function viewDirection(azimuth: number, elevation: number): [number, number, number] {
  const c = Math.cos(elevation);
  return [Math.sin(azimuth) * c, Math.sin(elevation), Math.cos(azimuth) * c];
}
