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

/** Unit view direction (target -> camera) for an azimuth around y and an elevation above the floor */
export function viewDirection(azimuth: number, elevation: number): [number, number, number] {
  const c = Math.cos(elevation);
  return [Math.sin(azimuth) * c, Math.sin(elevation), Math.cos(azimuth) * c];
}
