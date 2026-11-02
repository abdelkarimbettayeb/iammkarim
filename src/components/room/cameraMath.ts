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
