'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRoomStore, roomStore } from '@/store/useRoomStore';
import type { ActiveStation } from '@/types/room';
import { NODES, STOPS, planPath, segmentClear, type StopKey } from '../walkmap';
import { forward, type Vec2 } from '../layout';
import { ballBus, dartboardBus } from '../items/propBus';
import { playSound } from '@/lib/audioEngine';
import { exploreStore } from '@/store/exploreStore';
import { personalInfo } from '@/data/resumeData';
import { GAIT } from './gait';

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
  | 'fiddling_flags'
  | 'reaching'
  | 'pickup';

type Step =
  | { kind: 'go'; stop: StopKey; speed?: number }
  | {
      kind: 'do';
      pose: ActionPose;
      /** seconds; null = until something else happens */
      duration: number | null;
      enter?: () => void;
      exit?: () => void;
      /** Fire `act` once, `at` seconds into the step (when the hand gets there) */
      at?: number;
      act?: () => void;
      /** Glide the hips here while easing into the pose (sitting down / standing up) */
      slideTo?: Vec2;
      /** This step sits him down (remember where to stand back up) */
      sit?: boolean;
      /** Seconds to blend into this pose */
      blend?: number;
    };

export const WALK_SPEED = 2.0;
const DOCK_SPEED = 1.2;
/** Metres per full gait cycle (left + right step) */
export const STRIDE = GAIT.cycle;
/** Seconds of inactivity before an autonomous routine starts */
const IDLE_BEFORE_ROUTINE = 10;

const ACCEL = 6;
const DECEL = 9;
/** Turning: target rate gain and the lag filter that rounds it off */
const TURN_GAIN = 7;
const MAX_TURN_RATE = 7;
const TURN_SMOOTHING = 20;
/** Above this heading error he pivots on the spot before setting off */
const PIVOT_ANGLE = 1.2;
/** Gait phase gained per radian of in-place turning (shuffling the feet) */
const PIVOT_STEP = 2.2;
const CORNER_RADIUS = 0.45;
/** Default pose cross-fade */
export const POSE_BLEND = 0.22;
/** Seconds to sit down or stand up */
const SIT_TIME = 0.8;

/** Dart throw timeline (seconds within one throw) */
export const THROW = { aimEnd: 0.9, drawEnd: 1.2, release: 1.27, followEnd: 1.8, reload: 2.2, cycle: 2.8 } as const;

export interface Walker {
  x: number;
  z: number;
  yaw: number;
  pose: ActionPose;
  /** Accumulated gait phase in radians (advances with distance walked) */
  gait: number;
  moving: boolean;
  /** Ground speed in m/s */
  speed: number;
  /** Step size 0..1: full stride while travelling, small shuffles while pivoting */
  stride: number;
  /** Current turn rate in rad/s (+ = towards his left-hand x axis) */
  turnRate: number;
  /** Seconds since the current pose started */
  poseTime: number;
  /** Cross-fade time into the current pose */
  blend: number;
  /** Seconds into the current dart throw */
  throwPhase: number;
}

export interface CharacterFlags {
  chilly: boolean;
  guitar: boolean;
  dart: boolean;
}

/** Header status line: what he's up to */
const POSE_ACTIVITY: Partial<Record<ActionPose, string>> = {
  waving: 'Saying hello',
  idle: 'Hanging out',
  typing: 'Coding at the desk',
  sitting: 'Reading in the armchair',
  strumming: 'Playing guitar',
  bumping: 'Playing volleyball',
  window: 'At the window',
  throwing: 'Throwing darts',
  retrieving: 'Collecting darts',
  thinking: 'Thinking on the lawn',
  shivering: 'Feeling the chill',
  fiddling_flags: 'Straightening the flags',
  reaching: 'Grabbing the guitar',
  pickup: 'Picking up the ball',
};
const STOP_ACTIVITY: Partial<Record<StopKey, string>> = {
  rest: 'Heading back inside',
  workstation: 'Going to the desk',
  couch: 'Going to the armchair',
  guitar: 'Going for the guitar',
  window: 'Going to the window',
  dartboard: 'Going to the oche',
  volleyball: 'Heading out to the lawn',
  flags: 'Going to the desk',
  thinking_outdoor: 'Going for a stroll',
};

function wrapAngle(a: number): number {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

function approach(value: number, target: number, maxStep: number): number {
  return value < target ? Math.min(target, value + maxStep) : Math.max(target, value - maxStep);
}

/** Toss the ball away gently if he's holding it, and stop the keep-ups */
function releaseBall(yaw: number) {
  ballBus.keeper = null;
  if (!ballBus.held) return;
  ballBus.held = false;
  const f = forward(yaw);
  ballBus.vel.set(f[0] * 0.7, 2.2, f[1] * 0.7);
  ballBus.simulating = true;
}

/**
 * Round the corners of a lane polyline with small quadratic curves so he
 * carves through turns instead of stopping to pivot. A corner is only rounded
 * when the chord across it is as clear of furniture as the lanes themselves.
 */
function roundCorners(path: Vec2[]): Vec2[] {
  if (path.length < 3) return path;
  const out: Vec2[] = [path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    const a = path[i - 1];
    const c = path[i];
    const b = path[i + 1];
    const l1 = Math.hypot(c[0] - a[0], c[1] - a[1]);
    const l2 = Math.hypot(b[0] - c[0], b[1] - c[1]);
    if (l1 < 1e-3 || l2 < 1e-3) {
      out.push(c);
      continue;
    }
    const u: Vec2 = [(c[0] - a[0]) / l1, (c[1] - a[1]) / l1];
    const v: Vec2 = [(b[0] - c[0]) / l2, (b[1] - c[1]) / l2];
    const angle = Math.acos(Math.min(1, Math.max(-1, u[0] * v[0] + u[1] * v[1])));
    const r = Math.min(CORNER_RADIUS, l1 * 0.45, l2 * 0.45);
    const pIn: Vec2 = [c[0] - u[0] * r, c[1] - u[1] * r];
    const pOut: Vec2 = [c[0] + v[0] * r, c[1] + v[1] * r];
    // Gentle bends need no help; near-reversals are left to pivot
    if (angle < 0.2 || angle > 2.4 || !segmentClear(pIn, pOut)) {
      out.push(c);
      continue;
    }
    out.push(pIn);
    for (const t of [0.25, 0.5, 0.75]) {
      const m = 1 - t;
      out.push([
        m * m * pIn[0] + 2 * m * t * c[0] + t * t * pOut[0],
        m * m * pIn[1] + 2 * m * t * c[1] + t * t * pOut[1],
      ]);
    }
    out.push(pOut);
  }
  out.push(path[path.length - 1]);
  return out;
}

export function useCharacterBrain(onStationArrival?: (station: ActiveStation) => void) {
  const activeStation = useRoomStore((state) => state.activeStation);
  const dartsLeft = useRoomStore((state) => state.dartsLeft);
  const stationNonce = useRoomStore((state) => state.stationNonce);

  const spawn = NODES[STOPS.spawn.node];
  const walker = useRef<Walker>({
    x: spawn[0],
    z: spawn[1],
    yaw: STOPS.spawn.yaw,
    pose: 'walking',
    gait: 0,
    moving: true,
    speed: 0,
    stride: 0,
    turnRate: 0,
    poseTime: 0,
    blend: POSE_BLEND,
    throwPhase: 0,
  });
  const yawVel = useRef(0);
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
  /** Where he stood before sitting down; he stands back up to here */
  const seatExit = useRef<Vec2 | null>(null);
  const slideFrom = useRef<Vec2>([0, 0]);
  const acted = useRef(false);
  const onArrivalRef = useRef(onStationArrival);
  onArrivalRef.current = onStationArrival;
  const activeStationRef = useRef(activeStation);
  activeStationRef.current = activeStation;
  // Last station we reacted to. Starts at 'none' so the intro walk isn't overridden
  // (also keeps React StrictMode's double effect run harmless).
  const handledStation = useRef<ActiveStation>('none');
  const handledNonce = useRef(-1);

  const setFlags = (patch: Partial<CharacterFlags>) => {
    flags.current = { ...flags.current, ...patch };
    if (patch.guitar !== undefined && roomStore.getState().isGuitarHeld !== patch.guitar) {
      roomStore.setGuitarHeld(patch.guitar);
    }
  };

  /** Walk to the wall stand and lift the guitar off it (or put it back) */
  const guitarSwap = (pickUp: boolean): Step[] => [
    { kind: 'go', stop: 'guitar' },
    { kind: 'do', pose: 'reaching', duration: 0.75, at: 0.4, act: () => setFlags({ guitar: pickUp }) },
  ];

  const setQueue = useCallback((steps: Step[], routine = false) => {
    // Leave the current 'do' cleanly (reset temporary props)
    const cur = queue.current[0];
    if (cur && cur.kind === 'do' && stepStarted.current) cur.exit?.();
    const plays = (pose: ActionPose) => steps.some((s) => s.kind === 'do' && s.pose === pose);
    if (!plays('bumping')) releaseBall(walker.current.yaw);
    const prefix: Step[] = [];
    if (steps[0]?.kind === 'go') {
      // Get up out of the chair before walking anywhere
      if (seatExit.current) {
        prefix.push({ kind: 'do', pose: 'idle', duration: SIT_TIME, slideTo: seatExit.current, blend: SIT_TIME });
        seatExit.current = null;
      }
      // Never wander off with the guitar: put it back on its stand first
      if (flags.current.guitar && !plays('strumming')) prefix.push(...guitarSwap(false));
    }
    queue.current = [...prefix, ...steps];
    stepStarted.current = false;
    stepTimer.current = 0;
    idleTime.current = 0;
    routineRunning.current = routine;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Where he goes and what he does for each station the visitor can pick */
  const stationSteps = (station: Exclude<ActiveStation, 'none'>): Step[] => {
    const arrive = () => onArrivalRef.current?.(station);
    switch (station) {
      case 'workstation':
      case 'couch':
        return [
          { kind: 'go', stop: station },
          {
            kind: 'do',
            pose: station === 'couch' ? 'sitting' : 'typing',
            duration: null,
            slideTo: STOPS[station].seat,
            sit: true,
            blend: SIT_TIME,
            at: SIT_TIME,
            act: arrive,
          },
        ];
      case 'guitar':
        return [
          ...(flags.current.guitar ? [] : guitarSwap(true)),
          { kind: 'go', stop: 'guitarPlay' },
          { kind: 'do', pose: 'strumming', duration: null, enter: arrive },
        ];
      case 'window':
        return [
          { kind: 'go', stop: 'window' },
          {
            kind: 'do',
            pose: 'window',
            duration: null,
            at: 0.45,
            act: () => {
              roomStore.toggleWindow();
              playSound('window');
              arrive();
            },
          },
        ];
      case 'dartboard':
        return [
          { kind: 'go', stop: 'dartboard' },
          { kind: 'do', pose: 'throwing', duration: null, enter: arrive, exit: () => setFlags({ dart: false }) },
        ];
      case 'volleyball':
        return [
          { kind: 'go', stop: 'volleyball' },
          { kind: 'do', pose: 'pickup', duration: 1.0, at: 0.5, act: () => (ballBus.held = true) },
          { kind: 'do', pose: 'bumping', duration: null, enter: arrive, exit: () => releaseBall(walker.current.yaw) },
        ];
      case 'flags':
        return [
          { kind: 'go', stop: 'flags' },
          { kind: 'do', pose: 'fiddling_flags', duration: null, enter: arrive },
        ];
    }
  };

  // Intro: walk in from the road, wave at the door, then settle
  useEffect(() => {
    setQueue([
      { kind: 'go', stop: 'rest' },
      {
        kind: 'do',
        pose: 'waving',
        duration: 1.6,
        enter: () =>
          exploreStore.say(`Hey, I'm ${personalInfo.name.split(' ')[0]}! Click around, everything in here does something.`),
      },
      { kind: 'do', pose: 'idle', duration: null },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User picked a station (picking the window again opens/closes it again)
  useEffect(() => {
    const same = handledStation.current === activeStation;
    const again = same && handledNonce.current !== stationNonce && activeStation === 'window';
    handledNonce.current = stationNonce;
    if (same && !again) return;
    handledStation.current = activeStation;
    setFlags({ dart: false, chilly: false });
    if (activeStation === 'none') {
      setQueue([
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ]);
      return;
    }
    setQueue(stationSteps(activeStation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStation, stationNonce, setQueue]);

  // When the darts run out he walks to the board, pulls them out and comes back
  useEffect(() => {
    if (activeStation !== 'dartboard' || dartsLeft !== 0) return;
    setQueue([
      { kind: 'do', pose: 'idle', duration: 0.6 },
      { kind: 'go', stop: 'dartRetrieve' },
      {
        kind: 'do',
        pose: 'retrieving',
        duration: 1.6,
        at: 0.9,
        act: () => dartboardBus.clear?.(),
        exit: () => roomStore.resetDarts(),
      },
      { kind: 'go', stop: 'dartboard' },
      { kind: 'do', pose: 'throwing', duration: null, exit: () => setFlags({ dart: false }) },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // A few volleyball keep-ups
      [
        { kind: 'go', stop: 'volleyball' },
        { kind: 'do', pose: 'pickup', duration: 1.0, at: 0.5, act: () => (ballBus.held = true) },
        { kind: 'do', pose: 'bumping', duration: 6, exit: () => releaseBall(walker.current.yaw) },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
      // Play the guitar, then put it back on its stand
      [
        ...guitarSwap(true),
        { kind: 'go', stop: 'guitarPlay' },
        { kind: 'do', pose: 'strumming', duration: 6 },
        ...guitarSwap(false),
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
        {
          kind: 'do',
          pose: 'window',
          duration: 1.8,
          at: 0.45,
          act: () => {
            if (!roomStore.getState().isWindowOpen) return;
            roomStore.toggleWindow(false);
            playSound('window');
          },
        },
        { kind: 'go', stop: 'rest' },
        { kind: 'do', pose: 'idle', duration: null },
      ],
    ];
    setQueue(routines[Math.floor(Math.random() * routines.length)], true);
  };

  /** One dart per THROW.cycle; the dart lands on the board on the release frame */
  const throwDarts = (dt: number) => {
    const w = walker.current;
    const left = roomStore.getState().dartsLeft;
    // A click on the board skips the wait for the next throw
    if (dartboardBus.aim && w.throwPhase > THROW.reload) w.throwPhase = 0.35;
    const before = w.throwPhase;
    w.throwPhase += dt;
    if (left > 0 && before < THROW.release && w.throwPhase >= THROW.release) {
      dartboardBus.land?.(dartboardBus.aim);
      dartboardBus.aim = null;
      roomStore.decrementDarts();
    }
    if (w.throwPhase >= THROW.cycle) w.throwPhase = left > 0 ? 0 : THROW.cycle;
    const holding = left > 0 && (w.throwPhase < THROW.release || w.throwPhase > THROW.reload);
    if (flags.current.dart !== holding) setFlags({ dart: holding });
  };

  /** Advance the simulation. Call from useFrame. */
  const update = useCallback((delta: number) => {
    const w = walker.current;
    const dt = Math.min(delta, 0.1);
    const step = queue.current[0];

    if (!step) {
      // Nothing queued: idle, and maybe start a little routine
      w.pose = w.pose === 'walking' ? 'idle' : w.pose;
      w.speed = 0;
    } else if (step.kind === 'do') {
      w.speed = 0;
      if (!stepStarted.current) {
        stepStarted.current = true;
        stepTimer.current = 0;
        acted.current = false;
        slideFrom.current = [w.x, w.z];
        if (step.sit) seatExit.current = [w.x, w.z];
        w.pose = step.pose;
        w.blend = step.blend ?? POSE_BLEND;
        w.throwPhase = 0;
        const doing = POSE_ACTIVITY[step.pose];
        if (doing) exploreStore.setActivity(doing);
        step.enter?.();
      }
      stepTimer.current += dt;
      w.poseTime = stepTimer.current;
      if (step.slideTo) {
        const k = Math.min(1, stepTimer.current / (step.blend ?? POSE_BLEND));
        const e = k * k * (3 - 2 * k);
        w.x = slideFrom.current[0] + (step.slideTo[0] - slideFrom.current[0]) * e;
        w.z = slideFrom.current[1] + (step.slideTo[1] - slideFrom.current[1]) * e;
      }
      if (step.act && !acted.current && stepTimer.current >= (step.at ?? 0)) {
        acted.current = true;
        step.act();
      }
      if (step.pose === 'throwing') throwDarts(dt);
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
        path.current = roundCorners(planPath(from, step.stop, leaveIgnores.current));
        // Not at a seat any more; the seat ignores apply again once he gets to a dock
        leaveIgnores.current = [];
        pathIndex.current = path.current.length > 1 ? 1 : 0;
        currentStop.current = step.stop;
        const going =
          step.stop === 'guitar' && flags.current.guitar ? 'Putting the guitar back' : STOP_ACTIVITY[step.stop];
        if (going) exploreStore.setActivity(going);
      }

      const target = path.current[pathIndex.current];
      const reachedEnd = !target || pathIndex.current >= path.current.length;
      if (reachedEnd) {
        targetYaw.current = stop.yaw;
        const left = Math.abs(wrapAngle(stop.yaw - w.yaw));
        // Still turning to face the stop: keep the feet shuffling
        if (left > 0.12) {
          w.pose = 'walking';
          w.blend = POSE_BLEND;
        }
        // finish once facing the right way
        if (left < 0.12 && Math.abs(yawVel.current) < 1.5) {
          leaveIgnores.current = stop.dockIgnores ?? [];
          queue.current.shift();
          stepStarted.current = false;
        }
      } else {
        w.pose = 'walking';
        w.blend = POSE_BLEND;
        const dx = target[0] - w.x;
        const dz = target[1] - w.z;
        const d = Math.hypot(dx, dz);
        const isLast = pathIndex.current === path.current.length - 1;
        const isDock = !!stop.dock && isLast;
        // Side-step into a dock instead of turning round to walk there
        if (isDock && stop.strafe) targetYaw.current = stop.yaw;
        else if (d > 1e-4) targetYaw.current = Math.atan2(dx, dz);

        const base = step.speed ?? (isDock ? DOCK_SPEED : WALK_SPEED);
        // Facing well away from the lane: pivot first, then set off
        const turn = Math.abs(wrapAngle(targetYaw.current - w.yaw));
        const align = turn > PIVOT_ANGLE ? 0 : Math.min(1, Math.max(0.3, 1 - turn / 1.4));
        // Ease off over the last stretch so he doesn't stop dead
        const arrive = isLast ? Math.min(1, 0.3 + d * 1.2) : 1;
        const targetSpeed = base * align * arrive;
        w.speed = approach(w.speed, targetSpeed, (targetSpeed > w.speed ? ACCEL : DECEL) * dt);
        const move = Math.min(w.speed * dt, d);
        if (d > 1e-5) {
          w.x += (dx / d) * move;
          w.z += (dz / d) * move;
        }
        w.gait += (move / STRIDE) * Math.PI * 2;
        if (d - move < 0.02) pathIndex.current += 1;
      }
      if (reachedEnd) w.speed = approach(w.speed, 0, DECEL * dt);
    }

    // Smooth, rate-limited turning (shortest way round)
    const diff = wrapAngle(targetYaw.current - w.yaw);
    const wanted = Math.max(-MAX_TURN_RATE, Math.min(MAX_TURN_RATE, diff * TURN_GAIN));
    yawVel.current += (wanted - yawVel.current) * (1 - Math.exp(-TURN_SMOOTHING * dt));
    w.yaw = wrapAngle(w.yaw + yawVel.current * dt);
    w.turnRate = yawVel.current;

    // Feet shuffle on the spot while turning without travelling
    const moveAmp = Math.min(1, w.speed / 0.6);
    const turning = Math.abs(yawVel.current);
    if (w.pose === 'walking') w.gait += turning * dt * PIVOT_STEP * (1 - moveAmp);
    const strideTarget =
      w.pose === 'walking' ? Math.max(moveAmp, 0.3 * Math.min(1, turning / 1.5)) : 0;
    w.stride = approach(w.stride, strideTarget, 6 * dt);
    w.moving = w.speed > 0.05;

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
