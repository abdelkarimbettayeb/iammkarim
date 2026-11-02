'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';

export type ActionPose =
  | 'walking'
  | 'waving'
  | 'idle'
  | 'typing'
  | 'sitting'
  | 'strumming'
  | 'bumping'
  | 'window'
  | 'throwing'
  | 'retrieving'
  | 'thinking'
  | 'shivering'
  | 'fiddling_flags';

export interface StationWaypoint {
  pos: [number, number, number];
  rotY: number;
  pose: ActionPose;
}

export const STATION_WAYPOINTS: Record<ActiveStation | 'spawn' | 'doorway' | 'thinking_outdoor', StationWaypoint> = {
  spawn: { pos: [1.65, 0, 6.8], rotY: Math.PI, pose: 'walking' },
  doorway: { pos: [1.4, 0, 1.8], rotY: Math.PI * 0.25, pose: 'waving' },
  workstation: { pos: [-2.15, 0, -0.15], rotY: 0, pose: 'typing' },
  couch: { pos: [-1.6, 0, -1.2], rotY: Math.PI, pose: 'sitting' },
  guitar: { pos: [1.8, 0, -3.2], rotY: 0.35, pose: 'strumming' },
  window: { pos: [2.8, 0, -3.6], rotY: 0, pose: 'window' },
  dartboard: { pos: [-2.8, 0, 0.8], rotY: -Math.PI * 0.5, pose: 'throwing' },
  volleyball: { pos: [2.2, 0, 2.5], rotY: Math.PI * 0.3, pose: 'bumping' },
  flags: { pos: [-0.90, 0, 0.12], rotY: Math.PI * 0.96, pose: 'fiddling_flags' },
  thinking_outdoor: { pos: [-1.8, 0, 4.2], rotY: -Math.PI * 0.4, pose: 'thinking' },
  none: { pos: [1.4, 0, 1.8], rotY: Math.PI * 0.25, pose: 'idle' },
};

export function useCharacterBrain(onStationArrival?: (station: ActiveStation) => void) {
  const activeStation = useRoomStore((state) => state.activeStation);
  const dartsLeft = useRoomStore((state) => state.dartsLeft);

  const [currentPose, setCurrentPose] = useState<ActionPose>('walking');
  const [currentPos, setCurrentPos] = useState<[number, number, number]>([1.65, 0, 6.8]);
  const [currentRotY, setCurrentRotY] = useState(Math.PI);
  const [isChillyBreath, setIsChillyBreath] = useState(false);
  const [isHoldingGuitar, setIsHoldingGuitar] = useState(false);
  const [isHoldingDart, setIsHoldingDart] = useState(false);

  const posVec = useRef(new THREE.Vector3(1.65, 0, 6.8));
  const targetVec = useRef(new THREE.Vector3(1.4, 0, 1.8));
  const targetRotY = useRef(Math.PI);
  const isNavigating = useRef(true);
  const hasArrivedInitial = useRef(false);
  const lastInteractionTime = useRef(Date.now());
  const activeStationRef = useRef(activeStation);
  activeStationRef.current = activeStation;

  const autonomousTimers = useRef<NodeJS.Timeout[]>([]);
  const clearAutonomousTimers = () => {
    autonomousTimers.current.forEach(clearTimeout);
    autonomousTimers.current = [];
  };
  const addAutonomousTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    autonomousTimers.current.push(t);
    return t;
  };

  // Initial Arrival: highway road -> doorway wave -> idle
  useEffect(() => {
    posVec.current.set(1.65, 0, 6.8);
    targetVec.current.set(1.4, 0, 1.8);
    setCurrentPose('walking');
    isNavigating.current = true;

    const waveTimer = setTimeout(() => {
      setCurrentPose('waving');
      targetRotY.current = Math.PI * 0.25;
      hasArrivedInitial.current = true;
    }, 3000);

    const idleTimer = setTimeout(() => {
      setCurrentPose('idle');
      isNavigating.current = false;
    }, 4400);

    return () => {
      clearTimeout(waveTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  // Dispatch to clicked active station
  useEffect(() => {
    clearAutonomousTimers();
    if (!hasArrivedInitial.current) return;
    lastInteractionTime.current = Date.now();

    // Reset temporary states on new click
    setIsHoldingGuitar(false);
    setIsHoldingDart(false);
    setIsChillyBreath(false);

    if (activeStation === 'none') {
      targetVec.current.set(1.4, 0, 1.8);
      targetRotY.current = Math.PI * 0.25;
      setCurrentPose('idle');
      isNavigating.current = false;
      return;
    }

    const wp = STATION_WAYPOINTS[activeStation];
    if (wp) {
      targetVec.current.set(wp.pos[0], wp.pos[1], wp.pos[2]);
      targetRotY.current = wp.rotY;
      setCurrentPose('walking');
      isNavigating.current = true;
    }
  }, [activeStation]);

  // Dartboard retrieval loop when darts run out
  useEffect(() => {
    if (activeStation === 'dartboard' && dartsLeft === 0) {
      // Walk to board to retrieve darts
      const walkToBoard = setTimeout(() => {
        targetVec.current.set(-3.7, 0, -0.6);
        targetRotY.current = -Math.PI * 0.5;
        setCurrentPose('retrieving');
      }, 1200);

      const returnToLine = setTimeout(() => {
        targetVec.current.set(-2.8, 0, 0.8);
        targetRotY.current = -Math.PI * 0.5;
        setCurrentPose('throwing');
      }, 3200);

      return () => {
        clearTimeout(walkToBoard);
        clearTimeout(returnToLine);
      };
    }
  }, [activeStation, dartsLeft]);

  // Autonomous Idle Scheduler: fires after 10s of inactivity
  useEffect(() => {
    const idleCheckInterval = setInterval(() => {
      if (activeStationRef.current !== 'none') return;
      const elapsed = Date.now() - lastInteractionTime.current;

      if (elapsed > 10000 && !isNavigating.current) {
        lastInteractionTime.current = Date.now();
        // Pick randomly from 4 autonomous routines
        const routines = ['outdoor_walk', 'volleyball_bump', 'guitar_play', 'chilly_window'];
        const chosen = routines[Math.floor(Math.random() * routines.length)];

        if (chosen === 'outdoor_walk') {
          const wp = STATION_WAYPOINTS.thinking_outdoor;
          targetVec.current.set(wp.pos[0], wp.pos[1], wp.pos[2]);
          targetRotY.current = wp.rotY;
          setCurrentPose('walking');
          isNavigating.current = true;
          addAutonomousTimer(() => setCurrentPose('thinking'), 2800);
          addAutonomousTimer(() => {
            targetVec.current.set(1.4, 0, 1.8);
            setCurrentPose('walking');
            addAutonomousTimer(() => setCurrentPose('idle'), 2800);
          }, 8000);
        } else if (chosen === 'volleyball_bump') {
          const wp = STATION_WAYPOINTS.volleyball;
          targetVec.current.set(wp.pos[0], wp.pos[1], wp.pos[2]);
          targetRotY.current = wp.rotY;
          setCurrentPose('walking');
          isNavigating.current = true;
          addAutonomousTimer(() => setCurrentPose('bumping'), 2400);
          addAutonomousTimer(() => {
            targetVec.current.set(1.4, 0, 1.8);
            setCurrentPose('walking');
            addAutonomousTimer(() => setCurrentPose('idle'), 2400);
          }, 7000);
        } else if (chosen === 'guitar_play') {
          const wp = STATION_WAYPOINTS.guitar;
          targetVec.current.set(wp.pos[0], wp.pos[1], wp.pos[2]);
          targetRotY.current = wp.rotY;
          setCurrentPose('walking');
          isNavigating.current = true;
          addAutonomousTimer(() => {
            setCurrentPose('strumming');
            setIsHoldingGuitar(true);
          }, 2400);
          addAutonomousTimer(() => {
            setIsHoldingGuitar(false);
            targetVec.current.set(1.4, 0, 1.8);
            setCurrentPose('walking');
            addAutonomousTimer(() => setCurrentPose('idle'), 2400);
          }, 8000);
        } else if (chosen === 'chilly_window') {
          // Shiver & close window
          setCurrentPose('shivering');
          setIsChillyBreath(true);
          addAutonomousTimer(() => {
            setIsChillyBreath(false);
            const wp = STATION_WAYPOINTS.window;
            targetVec.current.set(wp.pos[0], wp.pos[1], wp.pos[2]);
            targetRotY.current = wp.rotY;
            setCurrentPose('walking');
            isNavigating.current = true;
            addAutonomousTimer(() => {
              setCurrentPose('window');
              roomStore.toggleWindow(false);
            }, 2600);
            setTimeout(() => {
              targetVec.current.set(1.4, 0, 1.8);
              setCurrentPose('walking');
              addAutonomousTimer(() => setCurrentPose('idle'), 2600);
            }, 6500);
          }, 2500);
        }
      }
    }, 3000);

    return () => clearInterval(idleCheckInterval);
  }, []);

  const updatePosition = useCallback((delta: number) => {
    const speed = 2.4;
    const dist = posVec.current.distanceTo(targetVec.current);

    if (dist > 0.08) {
      const dir = targetVec.current.clone().sub(posVec.current).normalize();
      posVec.current.addScaledVector(dir, Math.min(speed * delta, dist));
      targetRotY.current = Math.atan2(dir.x, dir.z);
    } else if (isNavigating.current) {
      isNavigating.current = false;
      const active = activeStationRef.current;
      if (active !== 'none') {
        const wp = STATION_WAYPOINTS[active];
        if (wp) {
          setCurrentPose(wp.pose);
          targetRotY.current = wp.rotY;
          if (active === 'guitar') setIsHoldingGuitar(true);
          if (active === 'dartboard') setIsHoldingDart(true);
          if (onStationArrival) onStationArrival(active);
        }
      }
    }

    // Smooth rotation lerp
    setCurrentRotY((prev) => THREE.MathUtils.damp(prev, targetRotY.current, 8, delta));
    setCurrentPos([posVec.current.x, posVec.current.y, posVec.current.z]);
  }, [onStationArrival]);

  return {
    currentPos,
    currentRotY,
    currentPose,
    isChillyBreath,
    isHoldingGuitar,
    isHoldingDart,
    updatePosition,
  };
}
