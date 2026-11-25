'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { exploreStore, hoverable, useExplore } from '@/store/exploreStore';
import { FUN_FACTS } from '@/data/discoveries';
import { BOY, CharacterBoy, CharacterBoyHandle, HELD_GUITAR } from './CharacterBoy';
import { useCharacterBrain, WALK_SPEED, THROW, type ActionPose } from './useCharacterBrain';
import { sampleGait } from './gait';
import { playSound } from '@/lib/audioEngine';
import { GUITAR_LEAN, PLACEMENTS, ROOM, SEAT_HEIGHT, WALL_ITEMS, WINDOW, scaleToNumber } from '../layout';
import { ballBus } from '../items/propBus';
import type { ActiveStation } from '@/types/room';

interface CharacterManagerProps {
  onStationArrival?: (station: ActiveStation) => void;
}

/** Contact height of the thigh above the seat surface (pivot sits inside the cushion) */
const SEAT_SINK = 0.04;

/**
 * Leg angles for sitting with the soles on the floor.
 * thigh tilts slightly down from horizontal so the shin can stand vertical.
 */
function seatedLegs(hipHeight: number) {
  const sole = 0.073; // ankle to sole
  const s = THREE.MathUtils.clamp((hipHeight - BOY.shin - sole) / BOY.thigh, 0, 0.45);
  const tilt = Math.asin(s);
  return { hip: -(Math.PI / 2 - tilt), knee: Math.PI / 2 - tilt };
}

const BACKPACK_HIDDEN_POSES: ActionPose[] = ['typing', 'sitting'];
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Two-bone arm IK: shoulder (ball joint) + elbow (hinge about x)
// ---------------------------------------------------------------------------

const UPPER = BOY.upperArm;
/** Elbow to the middle of the palm */
const LOWER = BOY.forearm + 0.036;
const REACH = (UPPER + LOWER) * 0.995;

const _dir = new THREE.Vector3();
const _hand = new THREE.Vector3();
const _elbow = new THREE.Vector3();
const _pole = new THREE.Vector3();
const _cross = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _twist = new THREE.Quaternion();

/**
 * Put the palm of `arm` on `target` (in the arm's parent frame). The elbow
 * swings towards `pole`. Out-of-reach targets get a straight arm pointing at them.
 */
function reachFor(arm: THREE.Group, elbow: THREE.Group, target: THREE.Vector3, pole: THREE.Vector3) {
  _dir.copy(target).sub(arm.position);
  const d = clamp(_dir.length(), 0.1, REACH);
  _dir.normalize();
  const cosE = clamp((UPPER * UPPER + LOWER * LOWER - d * d) / (2 * UPPER * LOWER), -1, 1);
  const bend = Math.PI - Math.acos(cosE);
  elbow.rotation.set(-bend, 0, 0);

  // Palm position with the shoulder unrotated (arm hanging, forearm folding forward)
  _hand.set(0, -UPPER - LOWER * Math.cos(bend), LOWER * Math.sin(bend)).normalize();
  _q.setFromUnitVectors(_hand, _dir);

  // Twist about the shoulder->target axis so the elbow points at the pole
  _elbow.set(0, -1, 0).applyQuaternion(_q);
  _elbow.addScaledVector(_dir, -_elbow.dot(_dir));
  _pole.copy(pole).addScaledVector(_dir, -pole.dot(_dir));
  if (_elbow.lengthSq() > 1e-6 && _pole.lengthSq() > 1e-6) {
    const angle = Math.atan2(_cross.crossVectors(_elbow, _pole).dot(_dir), _elbow.dot(_pole));
    _twist.setFromAxisAngle(_dir, angle);
    _q.premultiply(_twist);
  }
  arm.quaternion.copy(_q);
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** Elbow hints (spine frame): out and down, or out and forward for raised arms */
const POLE_DOWN_L = v(-0.6, -1, -0.3);
const POLE_DOWN_R = v(0.6, -1, -0.3);
const POLE_FRONT_R = v(0.35, -0.6, 1);
/** Picking elbow rides up over the guitar's upper rim instead of dropping through the body */
const POLE_STRUM_R = v(0.55, 0.25, 0.5);

const _fx = new THREE.Vector3();
const _fy = new THREE.Vector3();
const _fz = new THREE.Vector3();
const _basis = new THREE.Matrix4();
const _fore = new THREE.Quaternion();
const _want = new THREE.Quaternion();

/**
 * Turn a hand so the palm faces `palm` and the fingers point along `fingers` (arm frame),
 * `weight` 0..1 from the relaxed hang. Call after reachFor, which only places the palm.
 * Hand frame: fingers hang along -y, thumb is +z, the palm faces -side * x.
 */
function orientHand(
  hand: THREE.Group, arm: THREE.Group, elbow: THREE.Group,
  side: -1 | 1, fingers: THREE.Vector3, palm: THREE.Vector3, weight: number,
) {
  _fx.copy(palm).multiplyScalar(-side).normalize();
  _fore.copy(arm.quaternion).multiply(elbow.quaternion);
  // Lean the fingers towards the forearm so the wrist bends less than a full right angle
  _fy.set(0, -1, 0).applyQuaternion(_fore).lerp(fingers, 0.6);
  _fy.addScaledVector(_fx, -_fy.dot(_fx)).normalize().negate();
  _fz.crossVectors(_fx, _fy);
  _want.setFromRotationMatrix(_basis.makeBasis(_fx, _fy, _fz));
  hand.quaternion.identity().slerp(_fore.invert().multiply(_want), weight);
}

/**
 * Hand placement on the guitar (guitar-local units, so metres / guitar scale; +y up the neck,
 * +x across the strings, +z out of the soundboard). Palm centres sit one palm-half-thickness
 * (~0.033) clear of the wood. Tweak here if a hand drifts into or off the instrument.
 */
const GRIP = {
  /** Fretting hand: palm behind the neck, fingers wrapping up and over the fingerboard */
  fret: { x: -0.03, z: -0.009, curl: 1.3 },
  /** Picking hand: palm hovering over the strings, fingertips just brushing them */
  strum: { x: 0.08, y: -0.1, z: 0.15, curl: 0.5 },
  /** Lifting by the neck: palm in front of the fingerboard, fingers wrapping behind it */
  neck: { z: 0.125, curl: 1.1 },
};

const GUITAR_SCALE = scaleToNumber(PLACEMENTS.guitar.scale);
/** The guitar as it rests on the wall stand (matches Bookcase.tsx; 0.56 = local y of its lowest edge) */
const STAND_MATRIX = new THREE.Matrix4()
  .compose(v(PLACEMENTS.guitar.x, 0, PLACEMENTS.guitar.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(-GUITAR_LEAN, 0, 0)), v(1, 1, 1))
  .multiply(new THREE.Matrix4().makeTranslation(0, 0.56 * GUITAR_SCALE, 0));
const CARRY_POS = v(...HELD_GUITAR.position);
const CARRY_Q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...HELD_GUITAR.rotation));
const _sp = new THREE.Vector3();
const _sq = new THREE.Quaternion();
const _ss = new THREE.Vector3();
const _inv = new THREE.Matrix4();
const _gp = new THREE.Vector3();
const _gf = new THREE.Vector3();
const REST_L = v(-0.2, 0.78, 0.08);

// ---------------------------------------------------------------------------
// Dart throw: palm keyframes in the spine frame (he faces +z, board straight ahead)
// ---------------------------------------------------------------------------

type Key = [number, number, number, number];
const DART_KEYS: Key[] = [
  [0, 0.12, 1.4, 0.24],
  [THROW.aimEnd, 0.12, 1.43, 0.26], // aim: dart in front of the eye
  [THROW.drawEnd, 0.14, 1.45, 0.07], // draw back towards the cheek
  [THROW.release, 0.1, 1.41, 0.5], // snap forward and release
  [THROW.followEnd, 0.09, 1.2, 0.46], // follow through, arm drops
  [THROW.reload, 0.05, 1.08, 0.24], // take the next dart from the other hand
  [THROW.cycle, 0.12, 1.4, 0.24],
];

function sampleKeys(keys: Key[], t: number, out: THREE.Vector3) {
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const a = keys[i - 1];
      const b = keys[i];
      const k = smooth(a[0], b[0], t);
      return out.set(a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k);
    }
  }
  const last = keys[keys.length - 1];
  return out.set(last[1], last[2], last[3]);
}

// ---------------------------------------------------------------------------
// World targets
// ---------------------------------------------------------------------------

/** The blind's bottom rail, where he pulls it */
const WINDOW_GRIP = v(WINDOW.cx - 0.05, WINDOW.sill + WINDOW.height * 0.5, ROOM.minZ + 0.02);
const BOARD = v(ROOM.minX + 0.05, WALL_ITEMS.dartboard.y, WALL_ITEMS.dartboard.z);

/** Volleyball keep-ups: how hard he bumps and the gravity it flies under */
const BUMP_UP = 4.2;
const G = 9.81;

/** How long a speech bubble stays up */
const SPEECH_MS = 4800;

/** Comic speech bubble that follows his head */
function SpeechBubble() {
  const speech = useExplore((s) => s.speech);
  const [now, setNow] = React.useState(0);
  React.useEffect(() => {
    if (!speech) return;
    setNow(Date.now());
    const id = window.setTimeout(() => setNow(Date.now()), SPEECH_MS);
    return () => window.clearTimeout(id);
  }, [speech]);
  if (!speech || now - speech.at > SPEECH_MS) return null;
  return (
    <Html center position={[0, 0, 0]} pointerEvents="none" zIndexRange={[20, 0]}>
      <div key={speech.at} className="speech-bubble">
        {speech.text}
      </div>
    </Html>
  );
}

const hoverMe = hoverable('Abdelkarim', 'Click me for a fun fact');
let factIndex = Math.floor(Math.random() * FUN_FACTS.length);

export function CharacterManager({ onStationArrival }: CharacterManagerProps) {
  const boyRef = useRef<CharacterBoyHandle>(null);
  const bubbleRef = useRef<THREE.Group>(null);
  const { walker, flags, update } = useCharacterBrain(onStationArrival);

  const strumSoundTimer = useRef(0);
  const lastFlags = useRef({ chilly: false, guitar: false, dart: false, backpack: true });
  // Pose blending: last frame's joint values, the values we are easing away from
  const lastPose = useRef<ActionPose | null>(null);
  const lastJoints = useRef<number[] | null>(null);
  const blendFrom = useRef<number[] | null>(null);
  const blendLeft = useRef(0);
  const blendTime = useRef(0.22);
  const lastHands = useRef<THREE.Quaternion[] | null>(null);
  const blendHandsFrom = useRef<THREE.Quaternion[] | null>(null);
  /** Current guitar swap goes stand -> hands (true) or hands -> stand (false) */
  const swapUp = useRef(true);
  const tmp = useRef({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3() });

  useFrame((state, delta) => {
    update(delta);
    const boy = boyRef.current;
    if (!boy) return;
    const t = state.clock.getElapsedTime();
    const w = walker.current;
    const { a: ta, b: tb, c: tc } = tmp.current;

    // Props / effects only change occasionally, so only push them to the model on change
    const f = flags.current;
    const last = lastFlags.current;
    if (f.chilly !== last.chilly) boy.setChillyBreath(f.chilly);
    if (f.guitar !== last.guitar) boy.setGuitarVisible(f.guitar);
    if (f.dart !== last.dart) boy.setDartVisible(f.dart);
    const backpack = !BACKPACK_HIDDEN_POSES.includes(w.pose);
    if (backpack !== last.backpack) boy.setBackpackVisible(backpack);
    lastFlags.current = { ...f, backpack };

    const {
      root, head, spine, leftArm, rightArm, leftElbow, rightElbow,
      leftLeg, rightLeg, leftKnee, rightKnee, guitar,
      leftHand, rightHand, leftFingers, rightFingers,
    } = boy;
    if (!root || !head || !spine) return;
    if (!leftArm || !rightArm || !leftElbow || !rightElbow) return;
    if (!leftHand || !rightHand || !leftFingers || !rightFingers) return;
    if (!leftLeg || !rightLeg || !leftKnee || !rightKnee) return;
    const armFrame = rightArm.parent;
    if (!armFrame) return;

    root.position.set(w.x, 0, w.z);
    root.rotation.set(0, w.yaw, 0);
    bubbleRef.current?.position.set(w.x, 1.95, w.z);

    // Neutral stance; each pose overrides what it needs
    spine.rotation.set(0, 0, 0);
    head.rotation.set(0, 0, 0);
    leftArm.rotation.set(0, 0, 0.06);
    rightArm.rotation.set(0, 0, -0.06);
    leftElbow.rotation.set(-0.08, 0, 0);
    rightElbow.rotation.set(-0.08, 0, 0);
    leftLeg.rotation.set(0, 0, 0);
    rightLeg.rotation.set(0, 0, 0);
    leftKnee.rotation.set(0, 0, 0);
    rightKnee.rotation.set(0, 0, 0);
    leftHand.quaternion.identity();
    rightHand.quaternion.identity();
    leftFingers.rotation.z = 0.32;
    rightFingers.rotation.z = -0.32;
    const hands = [leftHand, rightHand];

    const joints = [spine, head, leftArm, rightArm, leftElbow, rightElbow, leftLeg, rightLeg, leftKnee, rightKnee];

    if (w.pose === 'reaching' && lastPose.current !== 'reaching') swapUp.current = !f.guitar;
    if (lastPose.current !== null && lastPose.current !== w.pose && lastJoints.current) {
      blendHandsFrom.current = lastHands.current;
      blendFrom.current = lastJoints.current;
      blendTime.current = w.blend;
      blendLeft.current = w.blend;
    }
    lastPose.current = w.pose;

    /** World point -> arm frame (needs this frame's root/spine matrices) */
    const toArmFrame = (world: THREE.Vector3, out: THREE.Vector3) => {
      root.updateMatrixWorld(true);
      return armFrame.worldToLocal(out.copy(world));
    };
    /** Point on the held guitar (guitar-local units) -> arm frame */
    const onGuitar = (x: number, y: number, z: number, out: THREE.Vector3) => {
      if (!guitar) return out.set(0, 1, 0.3);
      guitar.updateMatrix();
      return out.set(x, y, z).applyMatrix4(guitar.matrix);
    };
    /** The held guitar sits at its carry pose, unless a swap below moves it */
    const placeGuitar = (k: number) => {
      if (!guitar) return;
      if (k >= 1) {
        guitar.position.copy(CARRY_POS);
        guitar.quaternion.copy(CARRY_Q);
        return;
      }
      // Stand pose in the arm frame, eased into the carry pose with a little lift in between
      root.updateMatrixWorld(true);
      _inv.copy(armFrame.matrixWorld).invert().multiply(STAND_MATRIX).decompose(_sp, _sq, _ss);
      guitar.position.lerpVectors(_sp, CARRY_POS, k);
      guitar.position.y += Math.sin(k * Math.PI) * 0.05;
      guitar.quaternion.slerpQuaternions(_sq, CARRY_Q, k);
    };
    /** Palm faces the guitar's `palmZ` side (+1 front, -1 back), fingers along its `fingerX` (+1/-1) */
    const gripHand = (side: -1 | 1, palmZ: number, fingerX: number, curl: number, weight: number) => {
      if (!guitar) return;
      const [hand, arm, elbow, fingers] =
        side < 0 ? [leftHand, leftArm, leftElbow, leftFingers] : [rightHand, rightArm, rightElbow, rightFingers];
      orientHand(hand, arm, elbow, side, _gf.set(fingerX, 0, 0).applyQuaternion(guitar.quaternion),
        _gp.set(0, 0, palmZ).applyQuaternion(guitar.quaternion), weight);
      fingers.rotation.z = -side * (0.32 + (curl - 0.32) * weight);
    };
    /** Both hands on the guitar: fretting hand on the neck, picking hand over the sound hole */
    const holdGuitar = (strum: number) => {
      const chord = Math.floor(t / 2) % 2 === 0 ? 0.88 : 0.97;
      reachFor(leftArm, leftElbow, onGuitar(GRIP.fret.x, chord, GRIP.fret.z, ta), POLE_DOWN_L);
      gripHand(-1, 1, 1, GRIP.fret.curl, 1);
      reachFor(rightArm, rightElbow, onGuitar(GRIP.strum.x + strum, GRIP.strum.y, GRIP.strum.z, tb), POLE_STRUM_R);
      gripHand(1, -1, -1, GRIP.strum.curl, 1);
    };
    placeGuitar(1);

    switch (w.pose) {
      case 'walking': {
        // Feet are placed explicitly (see gait.ts); the pelvis height falls out of the IK
        const g = sampleGait(w.gait, w.stride, BOY);
        const speedFrac = clamp(w.speed / WALK_SPEED, 0, 1);
        leftLeg.rotation.x = g.left.hip;
        rightLeg.rotation.x = g.right.hip;
        leftKnee.rotation.x = g.left.knee;
        rightKnee.rotation.x = g.right.knee;
        root.position.y = g.hipHeight - BOY.hipY;

        if (f.guitar) {
          holdGuitar(0);
        } else {
          // Arms counter-swing the legs; elbows fold as the hand comes forward
          const swing = g.armPhase * 0.55 * w.stride;
          leftArm.rotation.x = swing;
          rightArm.rotation.x = -swing;
          leftElbow.rotation.x = -0.25 - Math.max(0, -swing) * 0.9;
          rightElbow.rotation.x = -0.25 - Math.max(0, swing) * 0.9;
        }

        // Lean into the walk, counter-twist the shoulders, and tilt into turns
        const turnLean = clamp(w.turnRate * 0.022, -0.12, 0.12) * speedFrac;
        spine.rotation.x = 0.03 + 0.1 * speedFrac;
        spine.rotation.y = -g.armPhase * 0.07 * w.stride;
        spine.rotation.z = g.sway * 0.03 * w.stride - turnLean;
        head.rotation.x = -0.05 - 0.04 * speedFrac;
        head.rotation.y = clamp(w.turnRate * 0.05, -0.3, 0.3);
        break;
      }

      case 'waving': {
        rightArm.rotation.set(-Math.PI * 0.85, 0, -0.35 + Math.sin(t * 8) * 0.12);
        rightElbow.rotation.set(-0.5 + Math.sin(t * 8) * 0.35, 0, 0);
        leftArm.rotation.set(0, 0, 0.1);
        head.rotation.set(0, 0.2, 0.05);
        break;
      }

      case 'fiddling_flags': {
        // Standing close to the desk, leaning in and tweaking a flag
        spine.rotation.x = 0.16;
        rightArm.rotation.set(-0.95 + Math.sin(t * 3.5) * 0.06, -0.1, -0.05);
        rightElbow.rotation.set(-0.95 + Math.cos(t * 3.5) * 0.08, 0, 0);
        leftArm.rotation.set(-0.15, 0, 0.15);
        leftElbow.rotation.set(-0.35, 0, 0);
        head.rotation.set(0.25, -0.1, 0.04);
        break;
      }

      case 'typing': {
        const hip = SEAT_HEIGHT.deskChair + SEAT_SINK;
        const legs = seatedLegs(hip);
        root.position.y = -(BOY.hipY - hip);
        leftLeg.rotation.x = legs.hip;
        rightLeg.rotation.x = legs.hip;
        leftKnee.rotation.x = legs.knee;
        rightKnee.rotation.x = legs.knee;
        spine.rotation.x = 0.08;
        // Upper arms hang, forearms reach up and out to the keyboard
        leftArm.rotation.set(-0.12, 0, 0.1);
        rightArm.rotation.set(-0.12, 0, -0.1);
        leftElbow.rotation.x = -(Math.PI / 2 + 0.45) + Math.sin(t * 12) * 0.05;
        rightElbow.rotation.x = -(Math.PI / 2 + 0.45) + Math.cos(t * 12) * 0.05;
        head.rotation.set(0.1, Math.sin(t * 0.7) * 0.05, 0);
        break;
      }

      case 'sitting': {
        const hip = SEAT_HEIGHT.armchair + SEAT_SINK;
        const legs = seatedLegs(hip);
        root.position.y = -(BOY.hipY - hip);
        leftLeg.rotation.set(legs.hip, -0.1, 0);
        rightLeg.rotation.set(legs.hip, 0.1, 0);
        leftKnee.rotation.x = legs.knee;
        rightKnee.rotation.x = legs.knee;
        // Relaxed, leaning back into the cushions with forearms on the armrests
        spine.rotation.x = -0.2;
        leftArm.rotation.set(-0.15, 0, 0.3);
        rightArm.rotation.set(-0.15, 0, -0.3);
        leftElbow.rotation.x = -1.1;
        rightElbow.rotation.x = -1.1;
        head.rotation.set(0.15, 0, 0);
        break;
      }

      case 'strumming': {
        // Down-up strum across the strings, a little louder on the beat
        const beat = (t * 2.2) % 1;
        const strum = Math.sin(beat * Math.PI * 2) * 0.07;
        holdGuitar(strum);
        spine.rotation.x = 0.06;
        head.rotation.set(0.32, 0.35, 0.05 + Math.sin(t * 2.2 * Math.PI) * 0.03);
        root.position.y = Math.abs(Math.sin(t * 2.2 * Math.PI)) * -0.006;
        strumSoundTimer.current += delta;
        if (strumSoundTimer.current > 1.8) {
          strumSoundTimer.current = 0;
          playSound('guitar');
        }
        break;
      }

      case 'reaching': {
        // Lean in, take the neck, and carry the guitar between the stand and his body.
        // Timings match guitarSwap in the brain, which flips the guitar flag mid-way.
        const p = w.poseTime;
        const up = swapUp.current;
        const k = up ? smooth(0.55, 1.45, p) : 1 - smooth(0.4, 1.3, p); // 0 on the stand, 1 in his arms
        const picking = up ? smooth(1.3, 1.75, p) : 1 - smooth(0, 0.4, p); // right hand: neck -> strum spot
        const fretting = up ? smooth(0.9, 1.5, p) : 1 - smooth(0.2, 0.7, p); // left hand: rest -> neck
        placeGuitar(k);

        spine.rotation.x = 0.28 * (1 - k) + 0.06 * k;
        root.position.y = -0.03 * (1 - k);
        leftKnee.rotation.x = rightKnee.rotation.x = 0.15 * (1 - k);
        leftLeg.rotation.x = rightLeg.rotation.x = -0.08 * (1 - k);
        head.rotation.set(0.3 - 0.1 * k, 0, 0);

        // Right hand holds the neck (sliding down it towards his body as it comes in, so it stays in reach)
        onGuitar(0, 0.78 - 0.33 * k, GRIP.neck.z, ta);
        ta.lerp(onGuitar(GRIP.strum.x, GRIP.strum.y, GRIP.strum.z, tb), picking);
        reachFor(rightArm, rightElbow, ta, tc.lerpVectors(POLE_DOWN_R, POLE_STRUM_R, picking));
        gripHand(1, -1, -1, GRIP.neck.curl + (GRIP.strum.curl - GRIP.neck.curl) * picking, 1);

        // Left hand comes up to fret
        onGuitar(GRIP.fret.x, 0.88, GRIP.fret.z, tb);
        reachFor(leftArm, leftElbow, ta.lerpVectors(REST_L, tb, fretting), POLE_DOWN_L);
        gripHand(-1, 1, 1, GRIP.fret.curl, fretting);
        break;
      }

      case 'pickup': {
        // Squat down, scoop the ball up, stand with it at the chest
        const p = w.poseTime;
        const bend = p < 0.5 ? smooth(0, 0.5, p) : 1 - smooth(0.55, 1.0, p);
        spine.rotation.x = 0.75 * bend;
        leftLeg.rotation.x = -0.75 * bend;
        rightLeg.rotation.x = -0.75 * bend;
        leftKnee.rotation.x = 1.3 * bend;
        rightKnee.rotation.x = 1.3 * bend;
        root.position.y = -0.2 * bend;
        if (ballBus.held) {
          ta.set(-0.07, 1.0, 0.27);
          tb.set(0.07, 1.0, 0.27);
        } else {
          toArmFrame(ballBus.pos, tc);
          ta.copy(tc).x -= 0.09;
          tb.copy(tc).x += 0.09;
        }
        reachFor(leftArm, leftElbow, ta, POLE_DOWN_L);
        reachFor(rightArm, rightElbow, tb, POLE_DOWN_R);
        head.rotation.set(0.45 * bend, 0, 0);
        break;
      }

      case 'bumping': {
        // Keep-ups synced to the ball: arms pop up on contact, knees load as it falls
        const s = t - ballBus.lastBumpAt;
        let untilContact = 1;
        if (ballBus.keeper && !ballBus.held && ballBus.vel.y < 0.5) {
          const dy = ballBus.pos.y - ballBus.keeper.y;
          untilContact = (ballBus.vel.y + Math.sqrt(Math.max(0, ballBus.vel.y ** 2 + 2 * G * dy))) / G;
        }
        const lift = Math.max(1 - smooth(0, 0.14, untilContact), 1 - smooth(0.04, 0.3, s));
        const crouch = ballBus.held ? 0.2 : 1 - smooth(0, 0.3, Math.min(s, untilContact + 0.15)) * 0.6;
        leftLeg.rotation.x = -0.45 * crouch;
        rightLeg.rotation.x = -0.35 * crouch;
        leftKnee.rotation.x = 0.75 * crouch;
        rightKnee.rotation.x = 0.7 * crouch;
        root.position.y = -0.09 * crouch + lift * 0.03;
        spine.rotation.x = 0.12 + 0.12 * crouch;

        if (ballBus.held) {
          // Hold the ball at the chest, then toss it up to start the rally
          ta.set(-0.08, 1.02, 0.26);
          tb.set(0.08, 1.02, 0.26);
          if (w.poseTime > 0.6) {
            ballBus.held = false;
            const k = ballBus.keeper;
            ballBus.vel.set(k ? (k.x - ballBus.pos.x) / 0.8 : 0, 2.6, k ? (k.z - ballBus.pos.z) / 0.8 : 0);
            ballBus.simulating = true;
          }
        } else {
          // Straight arms, hands together: the platform angle drops from ~55 to ~25 degrees at contact
          const ang = THREE.MathUtils.lerp(0.95, 0.42, lift);
          for (const [arm, elbow, side, pole] of [
            [leftArm, leftElbow, -1, POLE_DOWN_L],
            [rightArm, rightElbow, 1, POLE_DOWN_R],
          ] as const) {
            const target = side < 0 ? ta : tb;
            target.set(side * 0.03, -Math.sin(ang), Math.cos(ang)).normalize();
            target.multiplyScalar(REACH).add(arm.position);
            target.x = side * 0.035;
            reachFor(arm, elbow, target, pole);
          }
        }
        // Platform contact point (forearms just above the wrists), published for the ball
        root.updateMatrixWorld(true);
        const fwdX = Math.sin(w.yaw);
        const fwdZ = Math.cos(w.yaw);
        ballBus.keeper = { x: w.x + fwdX * 0.42, y: 0.72, z: w.z + fwdZ * 0.42 };
        // Eyes on the ball
        const bdx = ballBus.pos.x - w.x;
        const bdz = ballBus.pos.z - w.z;
        head.rotation.set(-Math.atan2(ballBus.pos.y - 1.35, Math.hypot(bdx, bdz)) * 0.6, 0, 0);
        break;
      }

      case 'window': {
        // Reach up to the blind's rail and pull
        const tug = Math.sin(clamp(w.poseTime - 0.3, 0, 0.5) * Math.PI * 2) * 0.04;
        toArmFrame(WINDOW_GRIP, ta).y -= tug;
        reachFor(rightArm, rightElbow, ta, POLE_DOWN_R);
        leftArm.rotation.set(-0.15, 0, 0.12);
        leftElbow.rotation.x = -0.4;
        head.rotation.set(-0.25, 0, 0);
        spine.rotation.x = 0.04;
        break;
      }

      case 'throwing': {
        // Side-on stance, throwing foot forward, elbow up; the brain lands the dart on release
        const p = w.throwPhase;
        leftLeg.rotation.x = 0.12;
        rightLeg.rotation.x = -0.18;
        leftKnee.rotation.x = 0.08;
        rightKnee.rotation.x = 0.1;
        const snap = smooth(THROW.drawEnd, THROW.release + 0.08, p) * (1 - smooth(THROW.followEnd, THROW.reload, p));
        spine.rotation.set(0.04 + snap * 0.07, -0.25 + snap * 0.1, 0);
        sampleKeys(DART_KEYS, p, tb);
        reachFor(rightArm, rightElbow, tb, POLE_FRONT_R);
        // Spare darts held in the other hand, at the chest
        reachFor(leftArm, leftElbow, ta.set(-0.02, 1.06, 0.22), POLE_DOWN_L);
        head.rotation.set(0.0, 0.22, 0);
        break;
      }

      case 'retrieving': {
        // Pulling the darts out of the board, one tug at a time
        const tug = Math.max(0, Math.sin(w.poseTime * 7)) * 0.05;
        toArmFrame(BOARD, ta).z -= tug;
        reachFor(rightArm, rightElbow, ta, POLE_DOWN_R);
        reachFor(leftArm, leftElbow, tc.set(-0.04, 1.04, 0.24), POLE_DOWN_L);
        head.rotation.set(-0.15, 0, 0);
        spine.rotation.x = 0.05;
        break;
      }

      case 'thinking': {
        // Hand to chin
        rightArm.rotation.set(-0.5, 0.2, -0.1);
        rightElbow.rotation.x = -2.1;
        leftArm.rotation.set(-0.25, 0, 0.25);
        leftElbow.rotation.x = -1.2;
        head.rotation.set(0.1, 0.25, 0.1);
        root.position.y = 0;
        break;
      }

      case 'shivering': {
        const shiver = Math.sin(t * 28) * 0.012;
        root.position.x += shiver;
        leftArm.rotation.set(-0.5, 0.4, 0.45);
        rightArm.rotation.set(-0.5, -0.4, -0.45);
        leftElbow.rotation.x = -1.7;
        rightElbow.rotation.x = -1.7;
        spine.rotation.x = 0.14;
        head.rotation.set(0.15, 0, shiver * 4);
        break;
      }

      default: {
        // Idle: soft breathing
        const breath = Math.sin(t * 2) * 0.012;
        root.position.y = breath * 0.5;
        leftArm.rotation.z = 0.06 + breath;
        rightArm.rotation.z = -0.06 - breath;
        head.rotation.set(breath * 2, Math.sin(t * 0.5) * 0.08, 0);
        spine.rotation.x = breath;
        break;
      }
    }

    // Ease out of the previous pose so legs and arms don't snap
    const from = blendFrom.current;
    if (from && blendLeft.current > 0) {
      blendLeft.current = Math.max(0, blendLeft.current - delta);
      const k = blendLeft.current / blendTime.current;
      const weight = k * k * (3 - 2 * k);
      joints.forEach((j, i) => {
        j.rotation.x += (from[i * 3] - j.rotation.x) * weight;
        j.rotation.y += (from[i * 3 + 1] - j.rotation.y) * weight;
        j.rotation.z += (from[i * 3 + 2] - j.rotation.z) * weight;
      });
      root.position.y += (from[joints.length * 3] - root.position.y) * weight;
      blendHandsFrom.current?.forEach((q, i) => hands[i].quaternion.slerp(q, weight));
    }
    lastHands.current = hands.map((h) => h.quaternion.clone());
    lastJoints.current = [
      ...joints.flatMap((j) => [j.rotation.x, j.rotation.y, j.rotation.z]),
      root.position.y,
    ];

    // Safety net: only the ball poses may hold the ball (e.g. after a hot reload mid-rally)
    if (ballBus.held && w.pose !== 'pickup' && w.pose !== 'bumping') {
      ballBus.held = false;
      ballBus.keeper = null;
      ballBus.simulating = true;
    }

    // The ball rides in his hands (midpoint of both palms) while he carries it
    if (ballBus.held) {
      root.updateMatrixWorld(true);
      leftElbow.localToWorld(ta.set(0, -LOWER, 0.02));
      rightElbow.localToWorld(tb.set(0, -LOWER, 0.02));
      ballBus.hand.copy(ta).add(tb).multiplyScalar(0.5);
      ballBus.hand.y += 0.04;
    }
  });

  return (
    <>
      <group
        {...hoverMe}
        onClick={(e) => {
          e.stopPropagation();
          exploreStore.discover('me');
          factIndex = (factIndex + 1) % FUN_FACTS.length;
          exploreStore.say(FUN_FACTS[factIndex]);
          playSound('chime');
        }}
      >
        <CharacterBoy ref={boyRef} />
      </group>
      <group ref={bubbleRef}>
        <SpeechBubble />
      </group>
    </>
  );
}
