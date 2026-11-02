'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CharacterBoy, CharacterBoyHandle } from './CharacterBoy';
import { useCharacterBrain } from './useCharacterBrain';
import { playSound } from '@/lib/audioEngine';
import type { ActiveStation } from '@/types/room';

interface CharacterManagerProps {
  onStationArrival?: (station: ActiveStation) => void;
}

export function CharacterManager({ onStationArrival }: CharacterManagerProps) {
  const boyRef = useRef<CharacterBoyHandle>(null);
  const {
    currentPos,
    currentRotY,
    currentPose,
    isChillyBreath,
    isHoldingGuitar,
    isHoldingDart,
    updatePosition,
  } = useCharacterBrain(onStationArrival);

  const strumSoundTimer = useRef(0);

  useFrame((state, delta) => {
    updatePosition(delta);
    const t = state.clock.getElapsedTime();

    if (!boyRef.current) return;

    boyRef.current.setChillyBreath(isChillyBreath);
    boyRef.current.setGuitarVisible(isHoldingGuitar);
    boyRef.current.setDartVisible(isHoldingDart);

    const { head, leftArm, rightArm, leftLeg, rightLeg, root } = boyRef.current;

    if (root) {
      root.position.set(currentPos[0], currentPos[1], currentPos[2]);
      root.rotation.y = currentRotY;
    }

    // Joint Choreographies based on currentPose
    switch (currentPose) {
      case 'walking': {
        const walkCycle = Math.sin(t * 10);
        if (root) {
          root.position.y = currentPos[1] + Math.abs(Math.sin(t * 10)) * 0.05; // Playful bobbing
          root.rotation.x = 0;
        }
        if (leftArm) leftArm.rotation.set(walkCycle * 0.6, 0, 0);
        if (rightArm) rightArm.rotation.set(-walkCycle * 0.6, 0, 0);
        if (leftLeg) leftLeg.rotation.set(-walkCycle * 0.7, 0, 0);
        if (rightLeg) rightLeg.rotation.set(walkCycle * 0.7, 0, 0);
        if (head) head.rotation.set(0, 0, 0);
        break;
      }

      case 'waving': {
        if (root) root.position.y = currentPos[1];
        if (rightArm) {
          rightArm.rotation.x = -Math.PI * 0.65;
          rightArm.rotation.z = -0.4 + Math.sin(t * 8) * 0.35; // Waving gesture
        }
        if (leftArm) leftArm.rotation.set(0, 0, 0.1);
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        if (head) head.rotation.set(0, 0.2, 0.05);
        break;
      }

      case 'fiddling_flags': {
        // Upright standing on the floor in front of the flags
        if (root) {
          root.position.y = currentPos[1];
          root.rotation.x = 0.06; // Attentive lean towards the desk
        }
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);

        // Right arm raised to table level, gently adjusting/fiddling with the flag cloth
        if (rightArm) {
          const reach = -Math.PI * 0.46 + Math.sin(t * 3.5) * 0.08;
          rightArm.rotation.set(reach, -0.15, 0.18 + Math.cos(t * 3.5) * 0.05);
        }

        // Left arm rests naturally at side/hip
        if (leftArm) {
          leftArm.rotation.set(-0.25, 0.1, 0.2);
        }

        // Head tilted down and focused on the flags
        if (head) {
          head.rotation.set(0.18, -0.12, 0.05);
        }
        break;
      }
      case 'typing': {
        if (root) root.position.y = currentPos[1] - 0.22; // Seated at desk
        if (leftLeg) leftLeg.rotation.set(-Math.PI / 2, 0, 0);
        if (rightLeg) rightLeg.rotation.set(-Math.PI / 2, 0, 0);
        if (leftArm) {
          leftArm.rotation.x = -Math.PI * 0.42 + Math.sin(t * 12) * 0.08;
          leftArm.rotation.z = 0.2;
        }
        if (rightArm) {
          rightArm.rotation.x = -Math.PI * 0.42 + Math.cos(t * 12) * 0.08;
          rightArm.rotation.z = -0.2;
        }
        if (head) head.rotation.set(0.18, 0, 0);
        break;
      }

      case 'sitting': {
        if (root) root.position.y = currentPos[1] - 0.24; // Seated on couch
        if (leftLeg) leftLeg.rotation.set(-Math.PI / 2, -0.15, 0);
        if (rightLeg) rightLeg.rotation.set(-Math.PI / 2, 0.15, 0);
        if (leftArm) leftArm.rotation.set(-0.25, 0, 0.2);
        if (rightArm) rightArm.rotation.set(-0.25, 0, -0.2);
        if (head) head.rotation.set(0, 0, 0);
        break;
      }

      case 'strumming': {
        if (root) root.position.y = currentPos[1];
        if (leftArm) leftArm.rotation.set(-Math.PI * 0.4, 0.3, 0.4); // Holding guitar neck
        if (rightArm) {
          // Strumming motion
          rightArm.rotation.set(-Math.PI * 0.35, 0, -0.2 + Math.sin(t * 6) * 0.25);
        }
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        if (head) head.rotation.set(0.1, 0.1, 0.05);

        // Sound trigger
        strumSoundTimer.current += delta;
        if (strumSoundTimer.current > 1.8) {
          strumSoundTimer.current = 0;
          playSound('guitar');
        }
        break;
      }

      case 'bumping': {
        if (root) root.position.y = currentPos[1] + Math.max(0, Math.sin(t * 4)) * 0.12;
        // Volleyball bump pose: forearms together in front
        if (leftArm) leftArm.rotation.set(-Math.PI * 0.45, 0.25, 0.2);
        if (rightArm) rightArm.rotation.set(-Math.PI * 0.45, -0.25, -0.2);
        if (leftLeg) leftLeg.rotation.set(-0.15, 0, 0);
        if (rightLeg) rightLeg.rotation.set(-0.15, 0, 0);
        if (head) head.rotation.set(-0.15, 0, 0);
        break;
      }

      case 'window': {
        if (root) root.position.y = currentPos[1];
        if (rightArm) rightArm.rotation.set(-Math.PI * 0.75, 0, -0.1); // Reaching to frame
        if (leftArm) leftArm.rotation.set(0, 0, 0.1);
        if (head) head.rotation.set(-0.25, 0, 0);
        break;
      }

      case 'throwing': {
        if (root) root.position.y = currentPos[1];
        if (rightArm) {
          const throwCycle = Math.sin(t * 3);
          rightArm.rotation.set(throwCycle > 0 ? -Math.PI * 0.6 : -0.2, 0, -0.15);
        }
        if (leftArm) leftArm.rotation.set(0, 0, 0.2);
        if (head) head.rotation.set(0, 0, 0);
        break;
      }

      case 'thinking': {
        if (root) root.position.y = currentPos[1];
        if (rightArm) rightArm.rotation.set(-Math.PI * 0.55, 0.3, -0.2); // Hand on chin
        if (leftArm) leftArm.rotation.set(0.1, 0, 0.1);
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        if (head) head.rotation.set(0.08, 0.15, 0.1); // Pondering tilt
        break;
      }

      case 'shivering': {
        const shiver = Math.sin(t * 28) * 0.03;
        if (root) root.position.x = currentPos[0] + shiver;
        // Hugging chest / rubbing arms
        if (leftArm) leftArm.rotation.set(-Math.PI * 0.38, 0.35, 0.35);
        if (rightArm) rightArm.rotation.set(-Math.PI * 0.38, -0.35, -0.35);
        if (head) head.rotation.set(0.12, 0, shiver * 2);
        break;
      }

      default: { // idle
        const breath = Math.sin(t * 2) * 0.02;
        if (root) root.position.y = currentPos[1] + breath;
        if (leftArm) leftArm.rotation.set(0, 0, 0.08 + breath);
        if (rightArm) rightArm.rotation.set(0, 0, -0.08 - breath);
        if (leftLeg) leftLeg.rotation.set(0, 0, 0);
        if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        if (head) head.rotation.set(breath, 0, 0);
        break;
      }
    }
  });

  return <CharacterBoy ref={boyRef} />;
}

