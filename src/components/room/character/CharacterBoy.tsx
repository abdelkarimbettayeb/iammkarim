'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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

const SKIN = '#E3AC86';
const SKIN_SHADE = '#CF9470';
const LIP = '#B8685D';
const HOODIE = '#EA580C';
const HOODIE_DARK = '#C2410C';
const HOODIE_FOLD = '#D24E0A';
const JEANS = '#27408B';
const JEANS_SEAM = '#4A67B3';
const HAIR = '#2A1B14';
const HAIR_LIGHT = '#3D2A1F';

function Skin({ shade }: { shade?: boolean }) {
  return <meshStandardMaterial color={shade ? SKIN_SHADE : SKIN} roughness={0.62} />;
}

/** A tapered limb segment hanging down from its pivot (y = 0) */
function Tube({
  length,
  top,
  bottom,
  color,
  roughness = 0.75,
}: {
  length: number;
  top: number;
  bottom: number;
  color: string;
  roughness?: number;
}) {
  return (
    <mesh position={[0, -length / 2, 0]} castShadow>
      <cylinderGeometry args={[top, bottom, length, 20]} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

/** Relaxed hand: palm, curled fingers and a thumb. Origin sits at the wrist, hanging down. */
function Hand({ side, children }: { side: -1 | 1; children?: React.ReactNode }) {
  const fingers: [number, number][] = [
    [-0.027, 0.03],
    [-0.009, 0.038],
    [0.009, 0.042],
    [0.027, 0.037],
  ];
  return (
    <group>
      {/* Wrist */}
      <mesh castShadow>
        <cylinderGeometry args={[0.027, 0.03, 0.045, 14]} />
        <Skin shade />
      </mesh>
      {/* Palm */}
      <RoundedBox args={[0.034, 0.08, 0.078]} radius={0.012} smoothness={3} position={[0, -0.05, 0]} castShadow>
        <Skin />
      </RoundedBox>
      {/* Fingers curl gently towards the palm */}
      <group position={[0, -0.088, 0]} rotation={[-0.32, 0, 0]}>
        {fingers.map(([z, len]) => (
          <mesh key={z} position={[0, -(len / 2 + 0.008), z]} castShadow>
            <capsuleGeometry args={[0.0088, len, 4, 8]} />
            <Skin />
          </mesh>
        ))}
      </group>
      {/* Thumb points forward and slightly down */}
      <mesh position={[-side * 0.004, -0.045, 0.05]} rotation={[-0.85, 0, 0]} castShadow>
        <capsuleGeometry args={[0.0098, 0.036, 4, 8]} />
        <Skin />
      </mesh>
      {children}
    </group>
  );
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
      <mesh castShadow scale={[1, 0.95, 1]}>
        <sphereGeometry args={[0.053, 18, 14]} />
        <meshStandardMaterial color={HOODIE} roughness={0.75} />
      </mesh>
      {/* Upper arm sleeve */}
      <Tube length={upperArm} top={0.051} bottom={0.045} color={HOODIE} roughness={0.78} />

      <group ref={elbowRef} position={[0, -upperArm, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.047, 16, 12]} />
          <meshStandardMaterial color={HOODIE} roughness={0.78} />
        </mesh>
        {/* Sleeve bunching at the elbow crease */}
        <mesh position={[0, 0.0, -0.036]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 1]}>
          <capsuleGeometry args={[0.009, 0.05, 4, 8]} />
          <meshStandardMaterial color={HOODIE_FOLD} roughness={0.85} />
        </mesh>
        {/* Forearm sleeve */}
        <Tube length={forearm - 0.02} top={0.046} bottom={0.038} color={HOODIE} roughness={0.78} />
        {/* Ribbed cuff */}
        <mesh position={[0, -forearm + 0.036, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.038, 0.045, 18]} />
          <meshStandardMaterial color={HOODIE_DARK} roughness={0.85} />
        </mesh>
        <group position={[0, -forearm + 0.014, 0]}>
          <Hand side={side}>{children}</Hand>
        </group>
      </group>
    </group>
  );
}

/** Low-profile sneaker. Origin = ankle; the sole's underside sits 0.073 below it. */
function Sneaker() {
  const LACES = [0.045, 0.072, 0.099];
  return (
    <group>
      {/* Sole + midsole */}
      <RoundedBox args={[0.1, 0.03, 0.275]} radius={0.012} smoothness={3} position={[0, -0.058, 0.05]} castShadow>
        <meshStandardMaterial color="#0F172A" roughness={0.75} />
      </RoundedBox>
      <RoundedBox args={[0.102, 0.012, 0.272]} radius={0.005} smoothness={2} position={[0, -0.04, 0.05]}>
        <meshStandardMaterial color="#F1F5F9" roughness={0.55} />
      </RoundedBox>
      {/* Upper */}
      <mesh position={[0, -0.03, 0.04]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.9]} castShadow>
        <capsuleGeometry args={[0.044, 0.1, 6, 14]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
      </mesh>
      {/* Rounded toe box */}
      <mesh position={[0, -0.04, 0.13]} scale={[0.98, 0.65, 1.25]} castShadow>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.45} />
      </mesh>
      {/* Heel counter + accent tab */}
      <mesh position={[0, -0.025, -0.03]} scale={[1, 1, 1.05]}>
        <sphereGeometry args={[0.046, 14, 10]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.55} />
      </mesh>
      <RoundedBox args={[0.045, 0.05, 0.012]} radius={0.004} smoothness={2} position={[0, -0.012, -0.072]}>
        <meshStandardMaterial color="#EA580C" roughness={0.5} />
      </RoundedBox>
      {/* Padded collar */}
      <mesh position={[0, 0.004, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.0095, 8, 18]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.7} />
      </mesh>
      {/* Tongue + laces */}
      <mesh position={[0, 0.006, 0.032]} rotation={[0.55, 0, 0]}>
        <boxGeometry args={[0.046, 0.012, 0.06]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.7} />
      </mesh>
      {LACES.map((z) => (
        <mesh key={z} position={[0, 0.001, z]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.0035, 0.05, 3, 6]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
        </mesh>
      ))}
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
      {/* Hip joint + thigh, tapering towards the knee */}
      <mesh castShadow>
        <sphereGeometry args={[0.08, 18, 14]} />
        <meshStandardMaterial color={JEANS} roughness={0.82} />
      </mesh>
      <Tube length={thigh} top={0.08} bottom={0.059} color={JEANS} roughness={0.82} />
      {/* Outer seam */}
      <mesh position={[side * 0.07, -thigh / 2, 0]} scale={[0.3, 1, 1]}>
        <capsuleGeometry args={[0.004, thigh - 0.1, 3, 6]} />
        <meshStandardMaterial color={JEANS_SEAM} roughness={0.85} />
      </mesh>

      <group ref={kneeRef} position={[0, -thigh, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshStandardMaterial color={JEANS} roughness={0.82} />
        </mesh>
        {/* Kneecap bump + fabric crease behind the knee */}
        <mesh position={[0, 0.0, 0.05]} scale={[1, 1.1, 0.7]}>
          <sphereGeometry args={[0.03, 12, 10]} />
          <meshStandardMaterial color={JEANS} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.0, -0.052]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 1, 1]}>
          <capsuleGeometry args={[0.008, 0.06, 3, 8]} />
          <meshStandardMaterial color="#1E3270" roughness={0.9} />
        </mesh>
        {/* Calf: fuller at the top, slim at the ankle */}
        <Tube length={shin - 0.03} top={0.059} bottom={0.043} color={JEANS} roughness={0.82} />
        {/* Turned-up cuff over the shoe */}
        <mesh position={[0, -shin + 0.045, 0]} castShadow>
          <cylinderGeometry args={[0.049, 0.053, 0.05, 18]} />
          <meshStandardMaterial color="#1F3577" roughness={0.88} />
        </mesh>
        <group position={[0, -shin, 0]}>
          <Sneaker />
        </group>
      </group>
    </group>
  );
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/**
 * One continuous head surface sculpted from a sphere: round cranium, flatter
 * face plane, jaw that tapers to the chin. Avoids the creases you get where
 * separate spheres intersect.
 */
function createHeadGeometry(): THREE.BufferGeometry {
  const base = new THREE.SphereGeometry(1, 48, 36);
  base.deleteAttribute('normal');
  base.deleteAttribute('uv');
  const geo = mergeVertices(base, 1e-4);
  const pos = geo.attributes.position;
  const A = 0.079; // half width
  const B = 0.112; // half height
  const C = 0.1; // half depth
  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);
    let x = vx * A;
    const y = vy * B;
    let z = vz * C;
    if (vy < 0 && vz > 0) {
      // Flatten the lower front into a face plane (super-ellipse profile)
      const t = Math.min(0.999, -vy);
      const flat = Math.pow(1 - Math.pow(t, 3.2), 1 / 3.2) / Math.sqrt(1 - t * t);
      z *= 1 + (flat - 1) * smoothstep(0, 0.4, vz);
    }
    // Jaw narrows towards the chin
    x *= 1 - 0.2 * smoothstep(0.1, 0.9, -vy);
    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Face details, placed on the front of the head ellipsoid (head centre = origin) */
function Face({ h }: { h: number }) {
  return (
    <>
      {/* Eyes: socket shade, sclera, iris, pupil, glint, lash line */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.035, 0.016, 0.082]}>
          <mesh scale={[1.3, 0.95, 0.5]}>
            <sphereGeometry args={[0.0185, 16, 12]} />
            <Skin shade />
          </mesh>
          <mesh position={[0, 0, 0.0035]} scale={[1.2, 0.85, 0.5]}>
            <sphereGeometry args={[0.0172, 16, 12]} />
            <meshStandardMaterial color="#F4F1EC" roughness={0.25} />
          </mesh>
          <mesh position={[s * -0.0006, -0.0004, 0.0112]} scale={[1, 1, 0.4]}>
            <sphereGeometry args={[0.0102, 16, 12]} />
            <meshStandardMaterial color="#5A3820" roughness={0.3} />
          </mesh>
          <mesh position={[s * -0.0006, -0.0004, 0.0136]} scale={[1, 1, 0.3]}>
            <sphereGeometry args={[0.0046, 12, 8]} />
            <meshBasicMaterial color="#0B0907" />
          </mesh>
          <mesh position={[s * 0.0026, 0.0035, 0.0148]}>
            <sphereGeometry args={[0.0023, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          {/* Upper lash line */}
          <mesh position={[0, 0.0125, 0.0092]} rotation={[0, 0, Math.PI / 2 + s * 0.08]} scale={[1, 1, 0.6]}>
            <capsuleGeometry args={[0.0022, 0.03, 3, 6]} />
            <meshStandardMaterial color="#1A1210" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Eyebrows: slim, arching slightly outward */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.037, 0.043, 0.0795]} rotation={[0.12, s * 0.12, -s * 0.07]}>
          <mesh rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.6]}>
            <capsuleGeometry args={[0.0042, 0.031, 3, 8]} />
            <meshStandardMaterial color={HAIR_LIGHT} roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Nose: bridge, tip and soft wings */}
      <mesh position={[0, -0.007, 0.099]} rotation={[0.28, 0, 0]} scale={[0.85, 1, 0.8]}>
        <capsuleGeometry args={[0.0072, 0.016, 4, 8]} />
        <Skin />
      </mesh>
      <mesh position={[0, -0.0235, 0.106]} scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.0125, 16, 12]} />
        <Skin />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.0095, -0.0255, 0.1015]} scale={[0.8, 0.75, 0.75]}>
            <sphereGeometry args={[0.0075, 10, 8]} />
            <Skin />
          </mesh>
          <mesh position={[s * 0.005, -0.0315, 0.1045]} scale={[0.9, 0.5, 0.4]}>
            <sphereGeometry args={[0.0032, 8, 6]} />
            <meshStandardMaterial color="#7B4A38" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Chin */}
      <mesh position={[0, -0.089, 0.056]} scale={[1.0, 0.65, 0.7]}>
        <sphereGeometry args={[0.024, 16, 12]} />
        <Skin />
      </mesh>

      {/* Mouth: soft lips with a relaxed, slightly upturned line */}
      <mesh position={[0, -0.0575, 0.0985]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.65]}>
        <capsuleGeometry args={[0.0042, 0.026, 4, 8]} />
        <meshStandardMaterial color={LIP} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.0655, 0.0965]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]}>
        <capsuleGeometry args={[0.0052, 0.022, 4, 8]} />
        <meshStandardMaterial color="#C27468" roughness={0.45} />
      </mesh>
      <mesh position={[0, -0.0613, 0.1005]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.5]}>
        <capsuleGeometry args={[0.0013, 0.032, 3, 6]} />
        <meshStandardMaterial color="#7A3B35" roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.019, -0.0595, 0.0945]} scale={[1, 1, 0.45]}>
          <sphereGeometry args={[0.0038, 8, 6]} />
          <Skin shade />
        </mesh>
      ))}

      {/* Ears */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * h * 0.745, -0.006, -0.008]} rotation={[0, 0, s * -0.12]}>
          <mesh scale={[0.38, 1.05, 0.75]} castShadow>
            <sphereGeometry args={[0.02, 12, 10]} />
            <Skin />
          </mesh>
          <mesh position={[s * 0.002, 0, 0.002]} scale={[0.3, 0.65, 0.5]}>
            <sphereGeometry args={[0.013, 8, 6]} />
            <Skin shade />
          </mesh>
        </group>
      ))}
    </>
  );
}

type Tuft = [number, number, number, number, number, number, number, number, number, number, boolean];

/** [x, y, z, rotX, rotY, rotZ, scaleX, scaleY, scaleZ, radius, lighter] (long axis is z, -rotX lifts the tip) */
const TUFTS: Tuft[] = [
  [0.0, 0.108, 0.076, -0.85, 0, 0, 1.2, 0.75, 1.8, 0.027, false],
  [0.026, 0.105, 0.068, -0.78, -0.25, -0.3, 1.0, 0.7, 1.7, 0.026, true],
  [-0.026, 0.105, 0.068, -0.78, 0.25, 0.3, 1.0, 0.7, 1.7, 0.026, false],
  [0.0, 0.124, 0.044, -0.6, 0, 0, 1.25, 0.8, 1.9, 0.028, true],
  [0.033, 0.118, 0.038, -0.5, -0.2, -0.45, 1.0, 0.75, 1.8, 0.025, false],
  [-0.033, 0.118, 0.038, -0.5, 0.2, 0.45, 1.0, 0.75, 1.8, 0.025, true],
  [0.0, 0.131, 0.01, -0.35, 0, 0, 1.2, 0.75, 1.7, 0.027, false],
];

/** Short textured quiff: tapered sides, longer swept-up top */
function Hair({ h }: { h: number }) {
  return (
    <>
      {/* Scalp: hairline over the forehead, down over the nape at the back */}
      <mesh position={[0, 0.014, -0.006]} rotation={[-0.4, 0, 0]} scale={[0.79, 1.03, 1.0]} castShadow>
        <sphereGeometry args={[h * 1.04, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.4833]} />
        <meshStandardMaterial color={HAIR} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Faded sides and nape: short hair sitting right on the skull */}
      <mesh position={[0, -0.004, -0.028]} scale={[0.765, 0.8, 0.88]}>
        <sphereGeometry args={[h * 1.02, 22, 14, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#241812" roughness={0.85} />
      </mesh>
      {/* Swept-up quiff */}
      {TUFTS.map(([x, y, z, rx, ry, rz, sx, sy, sz, r, light], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} scale={[sx, sy, sz]} castShadow>
          <sphereGeometry args={[r, 14, 10]} />
          <meshStandardMaterial color={light ? HAIR_LIGHT : HAIR} roughness={0.62} />
        </mesh>
      ))}
    </>
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
    const headGeometry = React.useMemo(() => createHeadGeometry(), []);

    return (
      <group ref={rootRef} position={position} rotation={rotation} scale={scale} name="character-boy">
        {/* Spine pivots at the hips so the whole upper body can lean */}
        <group ref={spineRef} position={[0, BOY.hipY, 0]}>
          <group position={[0, -BOY.hipY, 0]}>
            {/* =========================================
                Torso: hoodie with chest, waist and sloped shoulders
               ========================================= */}
            {/* Chest */}
            <mesh position={[0, 1.03, 0]} scale={[1.55, 1.5, 1.0]} castShadow receiveShadow>
              <sphereGeometry args={[0.1, 24, 18]} />
              <meshStandardMaterial color={HOODIE} roughness={0.74} />
            </mesh>
            {/* Shoulder yoke blends the chest into the neck */}
            <mesh position={[0, 1.165, -0.004]} rotation={[0, 0, Math.PI / 2]} scale={[0.9, 1, 1]} castShadow>
              <capsuleGeometry args={[0.04, 0.2, 6, 14]} />
              <meshStandardMaterial color={HOODIE} roughness={0.74} />
            </mesh>
            {/* Abdomen */}
            <mesh position={[0, 0.89, 0]} scale={[1, 1, 0.72]} castShadow receiveShadow>
              <cylinderGeometry args={[0.138, 0.15, 0.18, 24]} />
              <meshStandardMaterial color={HOODIE} roughness={0.76} />
            </mesh>
            {/* Hips / pelvis (jeans waist under the hoodie) */}
            <mesh position={[0, 0.79, 0]} scale={[1.55, 0.95, 1.0]} castShadow>
              <sphereGeometry args={[0.1, 18, 14]} />
              <meshStandardMaterial color={JEANS} roughness={0.82} />
            </mesh>
            {/* Hoodie hem band */}
            <mesh position={[0, 0.822, 0]} scale={[1, 1, 0.74]}>
              <cylinderGeometry args={[0.153, 0.158, 0.05, 24]} />
              <meshStandardMaterial color={HOODIE_DARK} roughness={0.88} />
            </mesh>
            {/* Fabric folds across the belly */}
            {[
              [-0.06, 0.875, 0.5],
              [0.065, 0.865, -0.45],
              [0.0, 0.84, 0.15],
            ].map(([fx, fy, fr], i) => (
              <mesh key={i} position={[fx, fy, 0.103]} rotation={[0, 0, fr + Math.PI / 2]} scale={[1, 1, 0.35]}>
                <capsuleGeometry args={[0.005, 0.055, 3, 6]} />
                <meshStandardMaterial color={HOODIE_FOLD} roughness={0.9} />
              </mesh>
            ))}
            {/* Kangaroo pocket */}
            <RoundedBox args={[0.2, 0.08, 0.03]} radius={0.015} smoothness={3} position={[0, 0.9, 0.103]} castShadow>
              <meshStandardMaterial color={HOODIE_DARK} roughness={0.85} />
            </RoundedBox>
            {/* Drawstrings */}
            {[-0.034, 0.034].map((dx) => (
              <group key={dx}>
                <mesh position={[dx, 1.095, 0.087]} scale={[1, 1, 0.5]}>
                  <capsuleGeometry args={[0.0042, 0.1, 3, 6]} />
                  <meshStandardMaterial color="#F8FAFC" roughness={0.6} />
                </mesh>
                <mesh position={[dx, 1.036, 0.089]}>
                  <cylinderGeometry args={[0.0058, 0.0058, 0.016, 8]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.6} roughness={0.35} />
                </mesh>
              </group>
            ))}
            {/* Hood bunched around the neck */}
            <mesh position={[0, 1.205, -0.012]} rotation={[Math.PI / 2 - 0.2, 0, 0]} scale={[1, 1, 0.8]}>
              <torusGeometry args={[0.072, 0.02, 12, 24]} />
              <meshStandardMaterial color={HOODIE} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.17, -0.075]} scale={[1.35, 0.85, 0.9]}>
              <sphereGeometry args={[0.058, 16, 12]} />
              <meshStandardMaterial color={HOODIE_DARK} roughness={0.85} />
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
            {[-0.072, 0.072].map((sx) => (
              <mesh key={sx} position={[sx, 1.085, 0.082]} rotation={[-0.05, 0, 0]} scale={[1, 1, 0.22]}>
                <capsuleGeometry args={[0.012, 0.11, 4, 8]} />
                <meshStandardMaterial color="#0C4A6E" roughness={0.75} />
              </mesh>
            ))}
            </group>

            {/* Neck */}
            <mesh position={[0, 1.235, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.047, 0.11, 18]} />
              <Skin shade />
            </mesh>

            {/* =========================================
                Head: cranium + jaw, face features, quiff
               ========================================= */}
            <group ref={headRef} position={[0, BOY.neckY, 0]}>
              <group position={[0, h - 0.005, 0.005]}>
                {/* Sculpted head: cranium, face plane and jaw in one surface */}
                <mesh geometry={headGeometry} position={[0, 0.004, 0]} castShadow>
                  <Skin />
                </mesh>

                <Face h={h} />
                <Hair h={h} />

                {/* Cold breath emitter at the mouth */}
                <ChillyBreathPuff active={isChilly} position={[0, -0.063, 0.112]} />
              </group>
            </group>

            {/* Arms (named by stage side: right = +x) */}
            <Arm side={-1} armRef={leftArmRef} elbowRef={leftElbowRef} />
            <Arm side={1} armRef={rightArmRef} elbowRef={rightElbowRef}>
              {/* Dart socket in the right hand */}
              <group ref={dartHolderRef} position={[0, -0.06, 0.04]} visible={false}>
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
