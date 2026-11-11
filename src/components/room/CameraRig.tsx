'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';
import { PLACEMENTS, WALL_ITEMS, WINDOW, ROOM, OUTDOOR } from './layout';
import { clampZoom, orbitFromDrag, panFromDrag, portraitFit, viewDirection, zoomFromPinch, zoomFromWheel } from './cameraMath';

/** Looking at the room from the front-right, the signature isometric angle */
const HOME_AZIMUTH = Math.PI / 4;
const HOME_ELEVATION = Math.asin(0.58 / Math.hypot(0.7, 0.58, 0.7));
/** Pixels of pointer travel before a press counts as a drag (and not a click) */
const DRAG_THRESHOLD = 6;
/** Two taps within this many ms (and DOUBLE_TAP_PX of each other) reset the view on touch screens */
const DOUBLE_TAP_MS = 320;
const DOUBLE_TAP_PX = 30;
const BASE_DISTANCE = 12.5;
/** How much of the way the camera target moves towards the selected station */
const STATION_PULL = 0.35;

const OVERVIEW: [number, number, number] = [0.2, 0.9, 0.9];

const STATION_POINTS: Record<ActiveStation, [number, number, number]> = {
  none: OVERVIEW,
  workstation: [PLACEMENTS.desk.x, 0.8, PLACEMENTS.desk.z],
  couch: [PLACEMENTS.armchair.x, 0.4, PLACEMENTS.armchair.z],
  guitar: [PLACEMENTS.guitar.x, 0.6, PLACEMENTS.guitar.z],
  window: [WINDOW.cx, WINDOW.sill + WINDOW.height / 2, ROOM.minZ],
  dartboard: [ROOM.minX, WALL_ITEMS.dartboard.y, WALL_ITEMS.dartboard.z],
  volleyball: [OUTDOOR.volleyball.x, 0.3, OUTDOOR.volleyball.z],
  flags: [-0.9, 0.9, PLACEMENTS.desk.z],
};

export function CameraRig() {
  const activeStation = useRoomStore((state) => state.activeStation);
  const { camera, gl } = useThree();

  const zoom = useRef(1);
  const zoomSmooth = useRef(1);
  const currentTarget = useRef(new THREE.Vector3(...OVERVIEW));
  const desiredTarget = useRef(new THREE.Vector3(...OVERVIEW));
  const offset = useRef(new THREE.Vector3());
  const orbit = useRef<[number, number]>([HOME_AZIMUTH, HOME_ELEVATION]);
  const orbitSmooth = useRef<[number, number]>([HOME_AZIMUTH, HOME_ELEVATION]);
  /** Ground-plane slide (x, z) added to the target by two-finger / right-button drags */
  const pan = useRef<[number, number]>([0, 0]);
  /** Current camera distance, so a pixel of drag can be turned into world units */
  const distance = useRef(BASE_DISTANCE);

  // Picking a station re-frames the camera on it, so drop any manual slide
  useEffect(() => {
    pan.current = [0, 0];
  }, [activeStation]);

  // Mouse wheel + two-finger pinch zoom on the canvas only (modals live in separate DOM)
  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current = zoomFromWheel(zoom.current, e.deltaY, e.deltaMode);
    };

    const touches = new Map<number, { x: number; y: number }>();
    const pinchDistance = () => {
      const pts = [...touches.values()];
      return pts.length >= 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    };
    const pinchMid = () => {
      const [a, b] = [...touches.values()];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };
    const panBy = (dx: number, dy: number) => {
      const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov || 38);
      const unitsPerPixel = (2 * distance.current * Math.tan(fov / 2)) / (el.clientHeight || 1);
      pan.current = panFromDrag(pan.current, orbitSmooth.current[0], orbitSmooth.current[1], dx, dy, unitsPerPixel);
    };
    const resetView = () => {
      orbit.current = [HOME_AZIMUTH, HOME_ELEVATION];
      zoom.current = 1;
      pan.current = [0, 0];
    };

    // Left drag / one finger orbits the camera; right drag slides it (two fingers are handled with the pinch)
    let drag: { id: number; x: number; y: number; travelled: number; pan: boolean } | null = null;
    let suppressClick = false;
    let lastTap = { at: 0, x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if ((e.button === 0 || e.button === 2) && touches.size <= 1)
        drag = { id: e.pointerId, x: e.clientX, y: e.clientY, travelled: 0, pan: e.button === 2 };
      else drag = null;
      suppressClick = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (drag && drag.id === e.pointerId && touches.size <= 1) {
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        drag.travelled += Math.hypot(dx, dy);
        drag.x = e.clientX;
        drag.y = e.clientY;
        if (drag.travelled > DRAG_THRESHOLD) {
          if (drag.pan) panBy(dx, dy);
          else orbit.current = orbitFromDrag(orbit.current[0], orbit.current[1], dx, dy);
          el.style.cursor = drag.pan ? 'move' : 'grabbing';
        }
      }
      if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return;
      // Two fingers: spreading zooms, moving together slides the view (both in one gesture)
      const two = touches.size >= 2;
      const before = pinchDistance();
      const midBefore = two ? pinchMid() : null;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = pinchDistance();
      if (two && before > 0) zoom.current = zoomFromPinch(zoom.current, before, after);
      if (midBefore) {
        const mid = pinchMid();
        panBy(mid.x - midBefore.x, mid.y - midBefore.y);
      }
    };
    const onPointerEnd = (e: PointerEvent) => {
      touches.delete(e.pointerId);
      if (drag && drag.id === e.pointerId) {
        suppressClick = drag.travelled > DRAG_THRESHOLD;
        if (suppressClick) el.style.cursor = '';
        // Touch has no reliable dblclick: two quick taps in the same spot reset the view
        if (e.pointerType === 'touch' && !suppressClick && e.type === 'pointerup') {
          const now = performance.now();
          const near = Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < DOUBLE_TAP_PX;
          if (now - lastTap.at < DOUBLE_TAP_MS && near) {
            resetView();
            lastTap = { at: 0, x: 0, y: 0 };
          } else lastTap = { at: now, x: e.clientX, y: e.clientY };
        }
        drag = null;
      }
    };
    // A drag that ends over an object must not also count as clicking it
    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      suppressClick = false;
      e.stopPropagation();
    };
    // Double-click flies back to the signature angle, zoom and position (touch uses the double-tap above)
    const onDoubleClick = (e: MouseEvent) => {
      if ((e as PointerEvent).pointerType !== 'touch') resetView();
    };
    // The right button pans here, so no context menu over the scene
    const onContextMenu = (e: MouseEvent) => e.preventDefault();

    // Non-passive so preventDefault stops the page from scrolling
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerEnd);
    el.addEventListener('pointercancel', onPointerEnd);
    el.addEventListener('dblclick', onDoubleClick);
    el.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('click', onClickCapture, true);
    el.style.touchAction = 'none';
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerEnd);
      el.removeEventListener('pointercancel', onPointerEnd);
      el.removeEventListener('dblclick', onDoubleClick);
      el.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('click', onClickCapture, true);
    };
  }, [gl, camera]);

  useFrame((_, delta) => {
    const station = STATION_POINTS[activeStation] ?? STATION_POINTS.none;
    desiredTarget.current.set(
      OVERVIEW[0] + (station[0] - OVERVIEW[0]) * STATION_PULL + pan.current[0],
      OVERVIEW[1] + (station[1] - OVERVIEW[1]) * STATION_PULL,
      OVERVIEW[2] + (station[2] - OVERVIEW[2]) * STATION_PULL + pan.current[1]
    );

    // Smooth cinematic damping of the look-at target and of the zoom itself
    const t = currentTarget.current;
    t.x = THREE.MathUtils.damp(t.x, desiredTarget.current.x, 3.5, delta);
    t.y = THREE.MathUtils.damp(t.y, desiredTarget.current.y, 3.5, delta);
    t.z = THREE.MathUtils.damp(t.z, desiredTarget.current.z, 3.5, delta);
    zoomSmooth.current = THREE.MathUtils.damp(zoomSmooth.current, clampZoom(zoom.current), 8, delta);
    const o = orbitSmooth.current;
    o[0] = THREE.MathUtils.damp(o[0], orbit.current[0], 10, delta);
    o[1] = THREE.MathUtils.damp(o[1], orbit.current[1], 10, delta);

    // Camera sits on the orbit ray through the target; zoom just slides along it
    // Portrait screens see less sideways: back off so the whole house still fits
    const aspect = (camera as THREE.PerspectiveCamera).aspect || 1;
    distance.current = BASE_DISTANCE * portraitFit(aspect) * zoomSmooth.current;
    offset.current.set(...viewDirection(o[0], o[1])).multiplyScalar(distance.current);
    camera.position.copy(t).add(offset.current);
    camera.lookAt(t);
  });

  return null;
}
