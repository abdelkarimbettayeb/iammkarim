/**
 * Shared, non-reactive day/night blend.
 *
 * `blend` is 0 in full daylight and 1 at full night. `DayNightDriver` eases it
 * towards the target every frame; anything that needs to fade between day and
 * night reads it inside `useFrame` (no React re-renders involved).
 */
export const dayNight = { blend: 0 };

/** Seconds-ish ease rate used by the driver (higher = faster) */
export const DAY_NIGHT_RATE = 1.6;

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
