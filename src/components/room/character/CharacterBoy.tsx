'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { ChillyBreathPuff } from './ChillyBreathPuff';

export interface CharacterBoyHandle {
  root: THREE.Group | null;
  head: THREE.Group | null;
  leftArm: THREE.Group | null;
  rightArm: THREE.Group | null;
  leftLeg: THREE.Group | null;
  rightLeg: THREE.Group | null;
  setChillyBreath: (active: boolean) => void;
  setGuitarVisible: (visible: boolean) => void;
  setDartVisible: (visible: boolean) => void;
}

interface CharacterBoyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const CharacterBoy = forwardRef<CharacterBoyHandle, CharacterBoyProps>(
  function CharacterBoy({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }, ref) {
    const rootRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const guitarHolderRef = useRef<THREE.Group>(null);
    const dartHolderRef = useRef<THREE.Group>(null);
    const [isChilly, setIsChilly] = React.useState(false);

    useImperativeHandle(ref, () => ({
      root: rootRef.current,
      head: headRef.current,
      leftArm: leftArmRef.current,
      rightArm: rightArmRef.current,
      leftLeg: leftLegRef.current,
      rightLeg: rightLegRef.current,
      setChillyBreath: (active: boolean) => setIsChilly(active),
      setGuitarVisible: (visible: boolean) => {
        if (guitarHolderRef.current) guitarHolderRef.current.visible = visible;
      },
      setDartVisible: (visible: boolean) => {
        if (dartHolderRef.current) dartHolderRef.current.visible = visible;
      },
    }));

    return (
      <group ref={rootRef} position={position} rotation={rotation} scale={scale} name="character-boy">
        {/* =========================================
            1. Torso & Orange Hoodie (Center of mass at Y = 0.72)
           ========================================= */}
        <group position={[0, 0.72, 0]}>
          {/* Main Hoodie Chest */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.42, 0.24]} />
            <meshStandardMaterial color="#EA580C" roughness={0.65} />
          </mesh>

          {/* Hoodie Front Pocket Pouch */}
          <mesh position={[0, -0.09, 0.13]} castShadow>
            <boxGeometry args={[0.22, 0.12, 0.04]} />
            <meshStandardMaterial color="#C2410C" roughness={0.7} />
          </mesh>

          {/* White Drawstrings */}
          {[-0.05, 0.05].map((dx, i) => (
            <mesh key={i} position={[dx, 0.08, 0.13]}>
              <boxGeometry args={[0.015, 0.12, 0.01]} />
              <meshBasicMaterial color="#F8FAFC" />
            </mesh>
          ))}

          {/* Cute Explorer Backpack on Back */}
          <group position={[0, 0.02, -0.16]}>
            <mesh castShadow>
              <boxGeometry args={[0.26, 0.32, 0.12]} />
              <meshStandardMaterial color="#0284C7" roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.06, -0.07]} castShadow>
              <boxGeometry args={[0.2, 0.14, 0.05]} />
              <meshStandardMaterial color="#0369A1" roughness={0.5} />
            </mesh>
          </group>
        </group>

        {/* =========================================
            2. Head & Facial Expressions (Y = 1.08)
           ========================================= */}
        <group ref={headRef} position={[0, 1.06, 0]}>
          {/* Faceted Head */}
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.3, 0.28]} />
            <meshStandardMaterial color="#FDBA74" roughness={0.55} />
          </mesh>

          {/* Spiky Low-Poly Dark Hair */}
          <group position={[0, 0.14, 0]}>
            <mesh position={[0, 0.04, 0]} castShadow>
              <boxGeometry args={[0.32, 0.08, 0.3]} />
              <meshStandardMaterial color="#1C1917" roughness={0.6} />
            </mesh>
            {/* Front Fringe Tuft */}
            <mesh position={[0, 0.01, 0.15]} rotation={[-0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.26, 0.09, 0.06]} />
              <meshStandardMaterial color="#1C1917" roughness={0.6} />
            </mesh>
          </group>

          {/* Friendly Eyes */}
          {[-0.075, 0.075].map((ex, i) => (
            <mesh key={i} position={[ex, 0.01, 0.145]}>
              <boxGeometry args={[0.035, 0.045, 0.01]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
          ))}

          {/* Cheerful Smile */}
          <mesh position={[0, -0.07, 0.145]}>
            <boxGeometry args={[0.08, 0.018, 0.01]} />
            <meshBasicMaterial color="#C2410C" />
          </mesh>

          {/* Cold Frosty Breath Puff Emitter */}
          <ChillyBreathPuff active={isChilly} position={[0, -0.07, 0.16]} />
        </group>

        {/* =========================================
            3. Left Arm & Shoulder Pivot (X = -0.21, Y = 0.88)
           ========================================= */}
        <group ref={leftArmRef} position={[-0.21, 0.88, 0]}>
          {/* Shoulder Sleeve */}
          <mesh position={[-0.03, -0.16, 0]} castShadow>
            <boxGeometry args={[0.1, 0.34, 0.12]} />
            <meshStandardMaterial color="#EA580C" roughness={0.65} />
          </mesh>
          {/* Hand */}
          <mesh position={[-0.03, -0.36, 0]} castShadow>
            <boxGeometry args={[0.08, 0.09, 0.09]} />
            <meshStandardMaterial color="#FDBA74" roughness={0.55} />
          </mesh>
        </group>

        {/* =========================================
            4. Right Arm & Shoulder Pivot (X = 0.21, Y = 0.88)
           ========================================= */}
        <group ref={rightArmRef} position={[0.21, 0.88, 0]}>
          {/* Shoulder Sleeve */}
          <mesh position={[0.03, -0.16, 0]} castShadow>
            <boxGeometry args={[0.1, 0.34, 0.12]} />
            <meshStandardMaterial color="#EA580C" roughness={0.65} />
          </mesh>
          {/* Hand */}
          <mesh position={[0.03, -0.36, 0]} castShadow>
            <boxGeometry args={[0.08, 0.09, 0.09]} />
            <meshStandardMaterial color="#FDBA74" roughness={0.55} />
          </mesh>

          {/* Dart Socket in Right Hand */}
          <group ref={dartHolderRef} position={[0.03, -0.38, 0.06]} visible={false}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.18, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0, -0.09]}>
              <boxGeometry args={[0.06, 0.06, 0.01]} />
              <meshBasicMaterial color="#DC2626" />
            </mesh>
          </group>
        </group>

        {/* =========================================
            5. Held Acoustic Guitar Socket (Across chest)
           ========================================= */}
        <group ref={guitarHolderRef} position={[0.05, 0.65, 0.22]} rotation={[0.2, 0.4, -0.35]} visible={false}>
          {/* Mini Guitar Body Clone when held */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.44, 0.1]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <boxGeometry args={[0.06, 0.32, 0.04]} />
            <meshStandardMaterial color="#78350F" roughness={0.5} />
          </mesh>
        </group>

        {/* =========================================
            6. Left Leg & Hip Pivot (X = -0.1, Y = 0.5)
           ========================================= */}
        <group ref={leftLegRef} position={[-0.1, 0.5, 0]}>
          {/* Denim Trouser */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.13, 0.44, 0.16]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
          </mesh>
          {/* Chunky Low-Poly White Sneaker */}
          <group position={[0, -0.46, 0.03]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.09, 0.24]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
            </mesh>
            {/* Sneaker Sole */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.15, 0.025, 0.25]} />
              <meshStandardMaterial color="#0F172A" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* =========================================
            7. Right Leg & Hip Pivot (X = 0.1, Y = 0.5)
           ========================================= */}
        <group ref={rightLegRef} position={[0.1, 0.5, 0]}>
          {/* Denim Trouser */}
          <mesh position={[0, -0.22, 0]} castShadow>
            <boxGeometry args={[0.13, 0.44, 0.16]} />
            <meshStandardMaterial color="#1E3A8A" roughness={0.7} />
          </mesh>
          {/* Chunky Low-Poly White Sneaker */}
          <group position={[0, -0.46, 0.03]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.09, 0.24]} />
              <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
            </mesh>
            {/* Sneaker Sole */}
            <mesh position={[0, -0.04, 0]}>
              <boxGeometry args={[0.15, 0.025, 0.25]} />
              <meshStandardMaterial color="#0F172A" roughness={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }
);
