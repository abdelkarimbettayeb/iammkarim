'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';
import { PLACEMENTS, WALL_ITEMS, WINDOW, ROOM, OUTDOOR } from './layout';
import { clampZoom, zoomFromPinch, zoomFromWheel } from './cameraMath';

/** Looking at the room from the front-right, the signature isometric angle */
const VIEW_DIRECTION = new THREE.Vector3(0.7, 0.58, 0.7).normalize();
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
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return;
      const before = pinchDistance();
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = pinchDistance();
      if (touches.size >= 2 && before > 0) zoom.current = zoomFromPinch(zoom.current, before, after);
    };
    const onPointerEnd = (e: PointerEvent) => {
      touches.delete(e.pointerId);
    };

    // Non-passive so preventDefault stops the page from scrolling
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerEnd);
    el.addEventListener('pointercancel', onPointerEnd);
    el.style.touchAction = 'none';
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerEnd);
      el.removeEventListener('pointercancel', onPointerEnd);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const station = STATION_POINTS[activeStation] ?? STATION_POINTS.none;
    desiredTarget.current.set(
      OVERVIEW[0] + (station[0] - OVERVIEW[0]) * STATION_PULL,
      OVERVIEW[1] + (station[1] - OVERVIEW[1]) * STATION_PULL,
      OVERVIEW[2] + (station[2] - OVERVIEW[2]) * STATION_PULL
    );

    // Smooth cinematic damping of the look-at target and of the zoom itself
    const t = currentTarget.current;
    t.x = THREE.MathUtils.damp(t.x, desiredTarget.current.x, 3.5, delta);
    t.y = THREE.MathUtils.damp(t.y, desiredTarget.current.y, 3.5, delta);
    t.z = THREE.MathUtils.damp(t.z, desiredTarget.current.z, 3.5, delta);
    zoomSmooth.current = THREE.MathUtils.damp(zoomSmooth.current, clampZoom(zoom.current), 8, delta);

    // Camera stays on the isometric ray through the target; zoom just slides along it
    offset.current.copy(VIEW_DIRECTION).multiplyScalar(BASE_DISTANCE * zoomSmooth.current);
    camera.position.copy(t).add(offset.current);
    camera.lookAt(t);
  });

  return null;
}
