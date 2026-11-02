'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';
import { NODES, STOPS, planPath, type StopKey } from '../walkmap';
import type { Vec2 } from '../layout';

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

type Step =
  | { kind: 'go'; stop: StopKey; speed?: number }
  | {
      kind: 'do';
      pose: ActionPose;
      /** seconds; null = until something else happens */
      duration: number | null;
      enter?: () => void;
      exit?: () => void;
    };

export const WALK_SPEED = 1.4;
const DOCK_SPEED = 0.8;
/** Metres per full gait cycle (left + right step) */
export const STRIDE = 1.3;
/** Seconds of inactivity before an autonomous routine starts */
const IDLE_BEFORE_ROUTINE = 10;

export interface Walker {
  x: number;
  z: number;
  yaw: number;
  pose: ActionPose;
  /** Accumulated gait phase in radians (advances with distance walked) */
  gait: number;
  moving: boolean;
}

export interface CharacterFlags {
  chilly: boolean;
  guitar: boolean;
  dart: boolean;
}

/** Station the user can select -> where he goes and what he does when he gets there */
const STATION_PLANS: Record<
  Exclude<ActiveStation, 'none'>,
  { stop: StopKey; pose: ActionPose; flags?: Partial<CharacterFlags> }
> = {
  workstation: { stop: 'workstation', pose: 'typing' },
  couch: { stop: 'couch', pose: 'sitting' },
  guitar: { stop: 'guitar', pose: 'strumming', flags: { guitar: true } },
  window: { stop: 'window', pose: 'window' },
  dartboard: { stop: 'dartboard', pose: 'throwing', flags: { dart: true } },
  volleyball: { stop: 'volleyball', pose: 'bumping' },
  flags: { stop: 'flags', pose: 'fiddling_flags' },
};

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

export function useCharacterBrain(onStationArrival?: (station: ActiveStation) => void) {
  const activeStation = useRoomStore((state) => state.activeStation);
  const dartsLeft = useRoomStore((state) => state.dartsLeft);

  const spawn = NODES[STOPS.spawn.node];
  const walker = useRef<Walker>({
    x: spawn[0],
    z: spawn[1],
    yaw: STOPS.spawn.yaw,
    pose: 'walking',
    gait: 0,
    moving: true,
  });
  const flags = useRef<CharacterFlags>({ chilly: false, guitar: false, dart: false });

  const targetYaw = useRef<number>(STOPS.spawn.yaw);
  const path = useRef<Vec2[]>([]);
  const pathIndex = useRef(0);
  const currentStop = useRef<StopKey | null>(null);
  const queue = useRef<Step[]>([]);
  const stepTimer = useRef(0);
  const stepStarted = useRef(false);
  const idleTime = useRef(0);
  const routineRunning = useRef(false);
  const leaveIgnores = useRef<string[]>([]);
  const onArrivalRef = useRef(onStationArrival);
  onArrivalRef.current = onStationArrival;
  const activeStationRef = useRef(activeStation);
  activeStationRef.current = activeStation;
  // Last station we reacted to. Starts at 'none' so the intro walk isn't overridden
  // (also keeps React StrictMode's double effect run harmless).
  const handledStation = useRef<ActiveStation>('none');

  const setQueue = useCallback((steps: Step[], routine = false) => {
    // Leave the current 'do' cleanly (reset temporary props)
    const cur = queue.current[0];
    if (cur && cur.kind === 'do' && stepStarted.current) cur.exit?.();
    queue.current = steps;
    stepStarted.current = false;
    stepTimer.current = 0;
    idleTime.current = 0;
    routineRunning.current = routine;
  }, []);

  const setFlags = (patch: Partial<CharacterFlags>) => {
    flags.current = { ...flags.current, ...patch };
  };

  // Intro: walk in from the road, wave at the door, then settle
  useEffect(() => {
    setQueue([
      { kind: 'go', stop: 'rest' },
      { kind: 'do', pose: 'waving', duration: 1.6 },
      { kind: 'do', pose: 'idle', duration: null },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User picked a station
  useEffect(() => {
    if (handledStation.current === activeStation) return;
    handledStation.current = activeStation;
    if (activeStation === 'none') {
      setFlags({ guitar: false, dart: false, chilly: false });
      setQueue([
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ]);
      return;
    }
    const plan = STATION_PLANS[activeStation];
    setFlags({ guitar: false, dart: false, chilly: false });
    setQueue([
      { kind: 'go', stop: plan.stop },
      {
        kind: 'do',
        pose: plan.pose,
        duration: null,
        enter: () => {
          if (plan.flags) setFlags(plan.flags);
          onArrivalRef.current?.(activeStation);
        },
        exit: () => setFlags({ guitar: false, dart: false }),
      },
    ]);
  }, [activeStation, setQueue]);

  // When the darts run out he walks to the board, collects them and returns
  useEffect(() => {
    if (activeStation !== 'dartboard' || dartsLeft !== 0) return;
    setQueue([
      { kind: 'do', pose: 'throwing', duration: 0.8 },
      { kind: 'go', stop: 'dartRetrieve' },
      { kind: 'do', pose: 'retrieving', duration: 1.4, enter: () => setFlags({ dart: false }) },
      { kind: 'go', stop: 'dartboard' },
      { kind: 'do', pose: 'throwing', duration: null, enter: () => setFlags({ dart: true }) },
    ]);
  }, [activeStation, dartsLeft, setQueue]);

  const startRoutine = () => {
    const routines: Step[][] = [
      // A thoughtful walk on the lawn
      [
        { kind: 'go', stop: 'thinking_outdoor' },
        { kind: 'do', pose: 'thinking', duration: 5 },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
      // A few volleyball bumps
      [
        { kind: 'go', stop: 'volleyball' },
        { kind: 'do', pose: 'bumping', duration: 4.5 },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
      // Play the guitar
      [
        { kind: 'go', stop: 'guitar' },
        {
          kind: 'do',
          pose: 'strumming',
          duration: 6,
          enter: () => setFlags({ guitar: true }),
          exit: () => setFlags({ guitar: false }),
        },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
      // Feel a chill, go and close the window
      [
        {
          kind: 'do',
          pose: 'shivering',
          duration: 2.5,
          enter: () => setFlags({ chilly: true }),
          exit: () => setFlags({ chilly: false }),
        },
        { kind: 'go', stop: 'window' },
        { kind: 'do', pose: 'window', duration: 1.8, enter: () => roomStore.toggleWindow(false) },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
    ];
    setQueue(routines[Math.floor(Math.random() * routines.length)], true);
  };

  /** Advance the simulation. Call from useFrame. */
  const update = useCallback((delta: number) => {
    const w = walker.current;
    const dt = Math.min(delta, 0.1);
    const step = queue.current[0];

    if (!step) {
      // Nothing queued: idle, and maybe start a little routine
      w.pose = w.pose === 'walking' ? 'idle' : w.pose;
      w.moving = false;
    } else if (step.kind === 'do') {
      w.moving = false;
      if (!stepStarted.current) {
        stepStarted.current = true;
        stepTimer.current = 0;
        w.pose = step.pose;
        step.enter?.();
      }
      stepTimer.current += dt;
      if (step.duration !== null && stepTimer.current >= step.duration) {
        step.exit?.();
        queue.current.shift();
        stepStarted.current = false;
      }
    } else if (step.kind === 'go') {
      const stop = STOPS[step.stop];
      if (!stepStarted.current) {
        stepStarted.current = true;
        // Plan from wherever he is now, along the predefined lanes only
        const from: Vec2 = [w.x, w.z];
        path.current = planPath(from, step.stop, leaveIgnores.current);
        // Not at a seat any more; the seat ignores apply again once he gets to a dock
        leaveIgnores.current = [];
        pathIndex.current = path.current.length > 1 ? 1 : 0;
        currentStop.current = step.stop;
      }

      const target = path.current[pathIndex.current];
      const reachedEnd = !target || pathIndex.current >= path.current.length;
      if (reachedEnd) {
        w.moving = false;
        targetYaw.current = stop.yaw;
        // finish once facing roughly the right way
        if (Math.abs(wrapAngle(stop.yaw - w.yaw)) < 0.25) {
          leaveIgnores.current = stop.dockIgnores ?? [];
          queue.current.shift();
          stepStarted.current = false;
        }
      } else {
        w.moving = true;
        w.pose = 'walking';
        const dx = target[0] - w.x;
        const dz = target[1] - w.z;
        const d = Math.hypot(dx, dz);
        targetYaw.current = Math.atan2(dx, dz);

        const isDock = !!stop.dock && pathIndex.current === path.current.length - 1;
        const base = step.speed ?? (isDock ? DOCK_SPEED : WALK_SPEED);
        // Slow down while turning so he doesn't slide sideways around corners
        const turn = Math.abs(wrapAngle(targetYaw.current - w.yaw));
        const speed = base * Math.min(1, Math.max(0.1, 1 - turn / 1.2));
        const move = Math.min(speed * dt, d);
        if (d > 1e-5) {
          w.x += (dx / d) * move;
          w.z += (dz / d) * move;
        }
        w.gait += (move / STRIDE) * Math.PI * 2;
        if (d - move < 0.02) pathIndex.current += 1;
      }
    }

    // Smooth turning (shortest way round)
    const diff = wrapAngle(targetYaw.current - w.yaw);
    w.yaw = wrapAngle(w.yaw + diff * (1 - Math.exp(-9 * dt)));

    // Autonomous behaviour after a while with nothing to do
    const restingForever =
      !routineRunning.current &&
      activeStationRef.current === 'none' &&
      (!queue.current[0] || (queue.current[0].kind === 'do' && queue.current[0].duration === null));
    if (restingForever) {
      idleTime.current += dt;
      if (idleTime.current > IDLE_BEFORE_ROUTINE) {
        idleTime.current = 0;
        startRoutine();
      }
    } else if (routineRunning.current && queue.current.length === 0) {
      routineRunning.current = false;
    } else if (!routineRunning.current && activeStationRef.current !== 'none') {
      idleTime.current = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { walker, flags, update };
}
