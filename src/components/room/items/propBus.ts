import * as THREE from 'three';

/**
 * Shared, non-reactive links between the boy and the props he plays with, so
 * the prop reacts on the exact frame his hand gets there instead of on click.
 *
 * shortcut: one dartboard and one ball in the scene; make these per-instance if
 * a second ever appears.
 */

export const dartboardBus = {
  /** Board-local point the visitor clicked; the next throw lands there */
  aim: null as { x: number; y: number } | null,
  /** Registered by the dartboard: stick a dart in the board */
  land: null as null | ((aim: { x: number; y: number } | null) => void),
  /** Registered by the dartboard: pull every dart out */
  clear: null as null | (() => void),
};

export const ballBus = {
  pos: new THREE.Vector3(),
  vel: new THREE.Vector3(),
  /** In his hands: the ball follows `hand` */
  held: false,
  hand: new THREE.Vector3(),
  /** Forearm platform while he's doing keep-ups (null = nobody playing) */
  keeper: null as null | { x: number; y: number; z: number },
  /** Clock time of the last bump off his forearms */
  lastBumpAt: -10,
  simulating: false,
};

// Debug handle for the browser console; never exposed in production builds
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __props: unknown }).__props = { ballBus, dartboardBus };
}
