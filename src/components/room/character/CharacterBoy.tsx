'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { ChillyBreathPuff } from './ChillyBreathPuff';

/**
 * Body proportions in metres (the boy is ~1.5 m tall, about 7 heads).
 * Exported so the choreography can derive seated heights from the same numbers.
 */
export const BOY = {
  hipY: 0.78,
  thigh: 0.37,
  shin: 0.33,
  shoulderY: 1.16,
  shoulderX: 0.165,
  upperArm: 0.25,
  forearm: 0.22,
  neckY: 1.27,
  headRadius: 0.105,
} as const;

export interface CharacterBoyHandle {
  root: THREE.Group | null;
  head: THREE.Group | null;
  spine: THREE.Group | null;
  leftArm: THREE.Group | null;
  rightArm: THREE.Group | null;
  leftElbow: THREE.Group | null;
  rightElbow: THREE.Group | null;
  leftLeg: THREE.Group | null;
  rightLeg: THREE.Group | null;
  leftKnee: THREE.Group | null;
  rightKnee: THREE.Group | null;
  setChillyBreath: (active: boolean) => void;
  setGuitarVisible: (visible: boolean) => void;
  setDartVisible: (visible: boolean) => void;
  setBackpackVisible: (visible: boolean) => void;
}

interface CharacterBoyProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

const SKIN = '#F1B78D';
const SKIN_SHADE = '#E39F73';
const HOODIE = '#EA580C';
const HOODIE_DARK = '#C2410C';
const JEANS = '#27408B';
const HAIR = '#2A1B14';

function Skin({ shade }: { shade?: boolean }) {
  return <meshStandardMaterial color={shade ? SKIN_SHADE : SKIN} roughness={0.6} />;
}

/** Arm = shoulder pivot > upper arm > elbow pivot > forearm > hand */
function Arm({
  side,
  armRef,
  elbowRef,
  children,
}: {
  side: -1 | 1;
  armRef: React.RefObject<THREE.Group | null>;
  elbowRef: React.RefObject<THREE.Group | null>;
  children?: React.ReactNode;
}) {
  const { upperArm, forearm } = BOY;
  return (
    <group ref={armRef} position={[side * BOY.shoulderX, BOY.shoulderY, 0]}>
      {/* Shoulder cap */}
      <mesh castShadow>
        <sphereGeometry args={[0.052, 16, 12]} />
        <meshStandardMaterial color={HOODIE} roughness={0.7} />
      </mesh>
      {/* Upper arm sleeve */}
      <mesh position={[0, -upperArm / 2 + 0.01, 0]} castShadow>
        <capsuleGeometry args={[0.043, upperArm - 0.09, 6, 14]} />
        <meshStandardMaterial color={HOODIE} roughness={0.7} />
      </mesh>

      <group ref={elbowRef} position={[0, -upperArm, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.04, 14, 10]} />
          <meshStandardMaterial color={HOODIE} roughness={0.7} />
        </mesh>
        {/* Forearm sleeve */}
        <mesh position={[0, -forearm / 2 + 0.02, 0]} castShadow>
          <capsuleGeometry args={[0.037, forearm - 0.12, 6, 14]} />
          <meshStandardMaterial color={HOODIE} roughness={0.7} />
        </mesh>
        {/* Ribbed cuff */}
        <mesh position={[0, -forearm + 0.075, 0]}>
          <cylinderGeometry args={[0.039, 0.037, 0.035, 14]} />
          <meshStandardMaterial color={HOODIE_DARK} roughness={0.8} />
        </mesh>
        {/* Hand */}
        <group position={[0, -forearm + 0.01, 0]}>
          <mesh position={[0, -0.035, 0]} scale={[0.9, 1.15, 0.7]} castShadow>
            <sphereGeometry args={[0.038, 14, 10]} />
            <Skin />
          </mesh>
          {/* Thumb */}
          <mesh position={[side * -0.03, -0.025, 0.012]} rotation={[0, 0, side * 0.5]} castShadow>
            <capsuleGeometry args={[0.011, 0.025, 4, 8]} />
            <Skin />
          </mesh>
          {children}
        </group>
      </group>
    </group>
  );
}

/** Leg = hip pivot > thigh > knee pivot > shin > sneaker */
function Leg({
  side,
  legRef,
  kneeRef,
}: {
  side: -1 | 1;
  legRef: React.RefObject<THREE.Group | null>;
  kneeRef: React.RefObject<THREE.Group | null>;
}) {
  const { thigh, shin } = BOY;
  return (
    <group ref={legRef} position={[side * 0.085, BOY.hipY, 0]}>
      {/* Thigh */}
      <mesh position={[0, -thigh / 2 + 0.01, 0]} castShadow>
        <capsuleGeometry args={[0.062, thigh - 0.12, 6, 14]} />
        <meshStandardMaterial color={JEANS} roughness={0.8} />
      </mesh>

      <group ref={kneeRef} position={[0, -thigh, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.055, 14, 10]} />
          <meshStandardMaterial color={JEANS} roughness={0.8} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -shin / 2 + 0.03, 0]} castShadow>
          <capsuleGeometry args={[0.05, shin - 0.15, 6, 14]} />
          <meshStandardMaterial color={JEANS} roughness={0.8} />
        </mesh>
        {/* Sneaker */}
        <group position={[0, -shin + 0.0, 0]}>
          <mesh position={[0, -0.03, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.8]} castShadow>
            <capsuleGeometry args={[0.05, 0.12, 6, 14]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.063, 0.05]} castShadow>
            <boxGeometry args={[0.1, 0.02, 0.25]} />
            <meshStandardMaterial color="#0F172A" roughness={0.7} />
          </mesh>
          {/* Toe cap stripe */}
          <mesh position={[0, -0.03, 0.14]} scale={[1, 0.8, 0.6]}>
            <sphereGeometry args={[0.046, 12, 8]} />
            <meshStandardMaterial color="#EA580C" roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export const CharacterBoy = forwardRef<CharacterBoyHandle, CharacterBoyProps>(
  function CharacterBoy({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }, ref) {
    const rootRef = useRef<THREE.Group>(null);
    const spineRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftElbowRef = useRef<THREE.Group>(null);
    const rightElbowRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const leftKneeRef = useRef<THREE.Group>(null);
    const rightKneeRef = useRef<THREE.Group>(null);
    const guitarHolderRef = useRef<THREE.Group>(null);
    const dartHolderRef = useRef<THREE.Group>(null);
    const backpackRef = useRef<THREE.Group>(null);
    const [isChilly, setIsChilly] = React.useState(false);

    useImperativeHandle(ref, () => ({
      root: rootRef.current,
      head: headRef.current,
      spine: spineRef.current,
      leftArm: leftArmRef.current,
      rightArm: rightArmRef.current,
      leftElbow: leftElbowRef.current,
      rightElbow: rightElbowRef.current,
      leftLeg: leftLegRef.current,
      rightLeg: rightLegRef.current,
      leftKnee: leftKneeRef.current,
      rightKnee: rightKneeRef.current,
      setChillyBreath: (active: boolean) => setIsChilly(active),
      setGuitarVisible: (visible: boolean) => {
        if (guitarHolderRef.current) guitarHolderRef.current.visible = visible;
      },
      setDartVisible: (visible: boolean) => {
        if (dartHolderRef.current) dartHolderRef.current.visible = visible;
      },
      setBackpackVisible: (visible: boolean) => {
        if (backpackRef.current) backpackRef.current.visible = visible;
      },
    }));

    const h = BOY.headRadius;

    return (
      <group ref={rootRef} position={position} rotation={rotation} scale={scale} name="character-boy">
        {/* Spine pivots at the hips so the whole upper body can lean */}
        <group ref={spineRef} position={[0, BOY.hipY, 0]}>
          <group position={[0, -BOY.hipY, 0]}>
            {/* =========================================
                Torso: hoodie, tapered, round in section
               ========================================= */}
            <mesh position={[0, 0.97, 0]} scale={[1.38, 1, 0.88]} castShadow receiveShadow>
              <capsuleGeometry args={[0.108, 0.2, 8, 20]} />
              <meshStandardMaterial color={HOODIE} roughness={0.72} />
            </mesh>
            {/* Hips / pelvis (jeans waist under the hoodie) */}
            <mesh position={[0, 0.8, 0]} scale={[1.45, 0.8, 0.95]} castShadow>
              <sphereGeometry args={[0.1, 16, 12]} />
              <meshStandardMaterial color={JEANS} roughness={0.8} />
            </mesh>
            {/* Hoodie hem band */}
            <mesh position={[0, 0.835, 0]} scale={[1, 1, 0.74]}>
              <cylinderGeometry args={[0.155, 0.16, 0.05, 20]} />
              <meshStandardMaterial color={HOODIE_DARK} roughness={0.85} />
            </mesh>
            {/* Kangaroo pocket */}
            <RoundedBox args={[0.19, 0.075, 0.03]} radius={0.015} smoothness={3} position={[0, 0.9, 0.1]} castShadow>
              <meshStandardMaterial color={HOODIE_DARK} roughness={0.8} />
            </RoundedBox>
            {/* Drawstrings */}
            {[-0.032, 0.032].map((dx) => (
              <mesh key={dx} position={[dx, 1.08, 0.098]}>
                <capsuleGeometry args={[0.004, 0.09, 3, 6]} />
                <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
              </mesh>
            ))}
            {/* Hood bunched around the neck */}
            <mesh position={[0, 1.2, -0.02]} rotation={[Math.PI / 2 - 0.25, 0, 0]} scale={[1, 1, 0.8]}>
              <torusGeometry args={[0.085, 0.036, 10, 20]} />
              <meshStandardMaterial color={HOODIE} roughness={0.75} />
            </mesh>

            {/* Backpack with straps (taken off when sitting) */}
            <group ref={backpackRef}>
            <group position={[0, 0.99, -0.165]}>
              <RoundedBox args={[0.24, 0.3, 0.12]} radius={0.04} smoothness={4} castShadow>
                <meshStandardMaterial color="#0284C7" roughness={0.55} />
              </RoundedBox>
              <RoundedBox args={[0.17, 0.12, 0.05]} radius={0.02} smoothness={3} position={[0, -0.07, -0.075]} castShadow>
                <meshStandardMaterial color="#0369A1" roughness={0.55} />
              </RoundedBox>
            </group>
            {[-0.085, 0.085].map((sx) => (
              <mesh key={sx} position={[sx, 1.07, 0.04]} rotation={[0.15, 0, 0]} scale={[1, 1, 0.3]}>
                <capsuleGeometry args={[0.018, 0.25, 4, 8]} />
                <meshStandardMaterial color="#075985" roughness={0.7} />
              </mesh>
            ))}
            </group>

            {/* Neck */}
            <mesh position={[0, 1.23, 0]} castShadow>
              <cylinderGeometry args={[0.036, 0.04, 0.07, 14]} />
              <Skin shade />
            </mesh>

            {/* =========================================
                Head
               ========================================= */}
            <group ref={headRef} position={[0, BOY.neckY, 0]}>
              <group position={[0, h - 0.005, 0.005]}>
                {/* Skull */}
                <mesh scale={[0.93, 1.06, 1]} castShadow>
                  <sphereGeometry args={[h, 28, 20]} />
                  <Skin />
                </mesh>
                {/* Jaw / cheeks add some softness below the skull */}
                <mesh position={[0, -0.035, 0.015]} scale={[0.82, 0.8, 0.85]}>
                  <sphereGeometry args={[h, 20, 14]} />
                  <Skin />
                </mesh>

                {/* Hair cap */}
                <mesh position={[0, 0.012, -0.008]} rotation={[-0.2, 0, 0]} scale={[0.97, 1.06, 1.03]} castShadow>
                  <sphereGeometry args={[h * 1.06, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
                  <meshStandardMaterial color={HAIR} roughness={0.7} />
                </mesh>
                {/* Back / sides of the hair */}
                <mesh position={[0, 0.0, -0.03]} scale={[0.98, 0.9, 0.9]}>
                  <sphereGeometry args={[h * 1.04, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
                  <meshStandardMaterial color={HAIR} roughness={0.7} />
                </mesh>
                {/* Swept fringe */}
                {[
                  [-0.045, 0.085, 0.07, 0.35],
                  [0.0, 0.095, 0.075, 0.0],
                  [0.05, 0.085, 0.068, -0.4],
                ].map(([fx, fy, fz, fr], i) => (
                  <mesh
                    key={i}
                    position={[fx, fy, fz]}
                    rotation={[0.5, 0, fr]}
                    scale={[1, 0.55, 0.9]}
                    castShadow
                  >
                    <sphereGeometry args={[0.04, 12, 10]} />
                    <meshStandardMaterial color={HAIR} roughness={0.7} />
                  </mesh>
                ))}

                {/* Ears */}
                {[-1, 1].map((s) => (
                  <mesh key={s} position={[s * h * 0.93, -0.005, 0]} scale={[0.5, 1, 0.8]}>
                    <sphereGeometry args={[0.022, 10, 8]} />
                    <Skin shade />
                  </mesh>
                ))}

                {/* Eyes: white, iris, highlight */}
                {[-0.037, 0.037].map((ex) => (
                  <group key={ex} position={[ex, 0.008, h * 0.9]}>
                    <mesh scale={[1, 1.1, 0.5]}>
                      <sphereGeometry args={[0.016, 12, 10]} />
                      <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 0, 0.007]} scale={[1, 1.1, 0.4]}>
                      <sphereGeometry args={[0.0105, 10, 8]} />
                      <meshBasicMaterial color="#1E1B18" />
                    </mesh>
                    <mesh position={[0.003, 0.004, 0.0105]}>
                      <sphereGeometry args={[0.0028, 6, 6]} />
                      <meshBasicMaterial color="#FFFFFF" />
                    </mesh>
                  </group>
                ))}

                {/* Brows */}
                {[-0.037, 0.037].map((ex, i) => (
                  <mesh
                    key={ex}
                    position={[ex, 0.037, h * 0.9]}
                    rotation={[0, 0, Math.PI / 2 + (i === 0 ? 0.12 : -0.12)]}
                  >
                    <capsuleGeometry args={[0.004, 0.026, 3, 6]} />
                    <meshStandardMaterial color={HAIR} roughness={0.8} />
                  </mesh>
                ))}

                {/* Nose */}
                <mesh position={[0, -0.012, h * 0.98]} scale={[0.9, 1, 1.1]}>
                  <sphereGeometry args={[0.014, 10, 8]} />
                  <Skin shade />
                </mesh>

                {/* Smile */}
                <mesh position={[0, -0.032, h * 0.93]} rotation={[0, 0, Math.PI]}>
                  <torusGeometry args={[0.02, 0.0038, 6, 14, Math.PI]} />
                  <meshStandardMaterial color="#9A3412" roughness={0.6} />
                </mesh>
                {/* Cheeks */}
                {[-0.058, 0.058].map((cx) => (
                  <mesh key={cx} position={[cx, -0.02, h * 0.82]} scale={[1, 0.7, 0.4]}>
                    <sphereGeometry args={[0.015, 8, 6]} />
                    <meshStandardMaterial color="#F59E8A" roughness={0.7} transparent opacity={0.6} />
                  </mesh>
                ))}

                {/* Cold breath emitter at the mouth */}
                <ChillyBreathPuff active={isChilly} position={[0, -0.032, h + 0.02]} />
              </group>
            </group>

            {/* Arms (named by stage side: right = +x) */}
            <Arm side={-1} armRef={leftArmRef} elbowRef={leftElbowRef} />
            <Arm side={1} armRef={rightArmRef} elbowRef={rightElbowRef}>
              {/* Dart socket in the right hand */}
              <group ref={dartHolderRef} position={[0, -0.03, 0.04]} visible={false}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.14, 6]} />
                  <meshStandardMaterial color="#E2E8F0" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0, -0.07]}>
                  <boxGeometry args={[0.04, 0.04, 0.008]} />
                  <meshBasicMaterial color="#DC2626" />
                </mesh>
              </group>
            </Arm>
          </group>
        </group>

        {/* Held acoustic guitar (simplified, ~1 m long) */}
        <group ref={guitarHolderRef} position={[0.02, 0.88, 0.2]} rotation={[0.15, 0.0, 1.0]} visible={false}>
          <mesh position={[0, -0.08, 0]} scale={[1, 1, 0.3]} castShadow>
            <sphereGeometry args={[0.2, 20, 14]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0]} scale={[1, 1, 0.3]} castShadow>
            <sphereGeometry args={[0.15, 20, 14]} />
            <meshStandardMaterial color="#B45309" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.0, 0.03]}>
            <circleGeometry args={[0.04, 20]} />
            <meshBasicMaterial color="#1C1917" />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.045, 0.5, 0.03]} />
            <meshStandardMaterial color="#451A03" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.8, 0]} castShadow>
            <boxGeometry args={[0.06, 0.12, 0.02]} />
            <meshStandardMaterial color="#451A03" roughness={0.5} />
          </mesh>
        </group>

        {/* Legs */}
        <Leg side={-1} legRef={leftLegRef} kneeRef={leftKneeRef} />
        <Leg side={1} legRef={rightLegRef} kneeRef={rightKneeRef} />
      </group>
    );
  }
);
