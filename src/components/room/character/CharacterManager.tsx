'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BOY, CharacterBoy, CharacterBoyHandle } from './CharacterBoy';
import { useCharacterBrain, type ActionPose } from './useCharacterBrain';
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

export function CharacterManager({ onStationArrival }: CharacterManagerProps) {
  const boyRef = useRef<CharacterBoyHandle>(null);
  const { walker, flags, update } = useCharacterBrain(onStationArrival);

  const strumSoundTimer = useRef(0);
  const lastFlags = useRef({ chilly: false, guitar: false, dart: false, backpack: true });

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

    switch (w.pose) {
      case 'walking': {
        // Gait phase advances with distance, so the feet match the ground speed
        const p = w.gait;
        const swing = Math.sin(p);
        const bend = (phase: number) => 0.1 + 0.75 * Math.pow(Math.max(0, Math.cos(phase)), 2);
        leftLeg.rotation.x = -swing * 0.55;
        rightLeg.rotation.x = swing * 0.55;
        leftKnee.rotation.x = bend(p);
        rightKnee.rotation.x = bend(p + Math.PI);
        leftArm.rotation.x = swing * 0.5;
        rightArm.rotation.x = -swing * 0.5;
        leftElbow.rotation.x = -0.2 - Math.max(0, -swing) * 0.4;
        rightElbow.rotation.x = -0.2 - Math.max(0, swing) * 0.4;
        spine.rotation.x = 0.06;
        spine.rotation.y = Math.sin(p) * 0.06;
        root.position.y = Math.abs(Math.sin(p)) * 0.018;
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
  });

  return <CharacterBoy ref={boyRef} />;
}
