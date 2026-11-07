'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BOY, CharacterBoy, CharacterBoyHandle } from './CharacterBoy';
import { useCharacterBrain, WALK_SPEED, type ActionPose } from './useCharacterBrain';
import { sampleGait } from './gait';
import { playSound } from '@/lib/audioEngine';
import { SEAT_HEIGHT } from '../layout';
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

/** Seconds to ease from the previous pose into a new one */
const BLEND_TIME = 0.22;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

export function CharacterManager({ onStationArrival }: CharacterManagerProps) {
  const boyRef = useRef<CharacterBoyHandle>(null);
  const { walker, flags, update } = useCharacterBrain(onStationArrival);

  const strumSoundTimer = useRef(0);
  const lastFlags = useRef({ chilly: false, guitar: false, dart: false, backpack: true });
  // Pose blending: last frame's joint values, the values we are easing away from
  const lastPose = useRef<ActionPose | null>(null);
  const lastJoints = useRef<number[] | null>(null);
  const blendFrom = useRef<number[] | null>(null);
  const blendLeft = useRef(0);

  useFrame((state, delta) => {
    update(delta);
    const boy = boyRef.current;
    if (!boy) return;
    const t = state.clock.getElapsedTime();
    const w = walker.current;

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
      leftLeg, rightLeg, leftKnee, rightKnee,
    } = boy;
    if (!root || !head || !spine) return;
    if (!leftArm || !rightArm || !leftElbow || !rightElbow) return;
    if (!leftLeg || !rightLeg || !leftKnee || !rightKnee) return;

    root.position.set(w.x, 0, w.z);
    root.rotation.set(0, w.yaw, 0);

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

    const joints = [spine, head, leftArm, rightArm, leftElbow, rightElbow, leftLeg, rightLeg, leftKnee, rightKnee];

    if (lastPose.current !== null && lastPose.current !== w.pose && lastJoints.current) {
      blendFrom.current = lastJoints.current;
      blendLeft.current = BLEND_TIME;
    }
    lastPose.current = w.pose;

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

        // Arms counter-swing the legs; elbows fold as the hand comes forward
        const swing = g.armPhase * 0.55 * w.stride;
        leftArm.rotation.x = swing;
        rightArm.rotation.x = -swing;
        leftElbow.rotation.x = -0.25 - Math.max(0, -swing) * 0.9;
        rightElbow.rotation.x = -0.25 - Math.max(0, swing) * 0.9;

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
        // Neck hand up at the headstock side, strumming hand sweeping over the body
        leftArm.rotation.set(-1.0, 0.1, 0.45);
        leftElbow.rotation.x = -1.0;
        rightArm.rotation.set(-0.5, 0, -0.2);
        rightElbow.rotation.x = -0.9 + Math.sin(t * 7) * 0.3;
        head.rotation.set(0.2, 0.25, 0);
        spine.rotation.x = 0.04;
        strumSoundTimer.current += delta;
        if (strumSoundTimer.current > 1.8) {
          strumSoundTimer.current = 0;
          playSound('guitar');
        }
        break;
      }

      case 'bumping': {
        // Volleyball bump: knees bent, forearms together
        const bounce = Math.max(0, Math.sin(t * 4));
        root.position.y = bounce * 0.1;
        leftLeg.rotation.x = -0.35;
        rightLeg.rotation.x = -0.25;
        leftKnee.rotation.x = 0.6 + (1 - bounce) * 0.3;
        rightKnee.rotation.x = 0.55 + (1 - bounce) * 0.3;
        spine.rotation.x = 0.25;
        leftArm.rotation.set(-0.95 + bounce * 0.5, 0.3, 0.1);
        rightArm.rotation.set(-0.95 + bounce * 0.5, -0.3, -0.1);
        leftElbow.rotation.x = -0.1;
        rightElbow.rotation.x = -0.1;
        head.rotation.set(-0.15, 0, 0);
        break;
      }

      case 'window': {
        // Reaching up and forward to the blind cord / sash
        rightArm.rotation.set(-Math.PI * 0.82, 0, -0.1);
        rightElbow.rotation.x = -0.25;
        leftArm.rotation.set(-0.3, 0, 0.2);
        leftElbow.rotation.x = -0.6;
        head.rotation.set(-0.3, 0, 0);
        spine.rotation.x = 0.06;
        break;
      }

      case 'throwing': {
        // Dart throw: forearm cocks back, then snaps forward
        const cycle = (t * 1.2) % 1;
        const snap = cycle < 0.55 ? 0 : Math.min(1, (cycle - 0.55) / 0.12);
        rightArm.rotation.set(-1.1, 0, -0.08);
        rightElbow.rotation.x = THREE.MathUtils.lerp(-1.9, -0.6, snap);
        leftArm.rotation.set(-0.1, 0, 0.2);
        spine.rotation.x = 0.05 + snap * 0.06;
        head.rotation.set(0.05, 0, 0);
        break;
      }

      case 'retrieving': {
        // Pulling darts out of the board
        rightArm.rotation.set(-1.3 + Math.sin(t * 5) * 0.08, 0, -0.1);
        rightElbow.rotation.x = -0.4;
        leftArm.rotation.set(0, 0, 0.15);
        head.rotation.set(0.1, 0, 0);
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
      const k = blendLeft.current / BLEND_TIME;
      const weight = k * k * (3 - 2 * k);
      joints.forEach((j, i) => {
        j.rotation.x += (from[i * 3] - j.rotation.x) * weight;
        j.rotation.y += (from[i * 3 + 1] - j.rotation.y) * weight;
        j.rotation.z += (from[i * 3 + 2] - j.rotation.z) * weight;
      });
      root.position.y += (from[joints.length * 3] - root.position.y) * weight;
    }
    lastJoints.current = [
      ...joints.flatMap((j) => [j.rotation.x, j.rotation.y, j.rotation.z]),
      root.position.y,
    ];
  });

  return <CharacterBoy ref={boyRef} />;
}
