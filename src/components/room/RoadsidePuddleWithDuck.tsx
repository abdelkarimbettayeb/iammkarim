'use client';

import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { playSound } from '@/lib/audioEngine';
import { dayNight } from '@/store/dayNight';
import { duckHeading, duckPosition, puddleControlPoints } from './puddleMath';

interface RoadsidePuddleWithDuckProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const BLOB_SEGMENTS = 96;
/** Real ducks are ~35 cm; the pond is under 2 m across */
const DUCK_SCALE = 0.72;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Closed smooth outline through the control points, as a flat shape */
function buildBlob(scale: number): { shape: THREE.Shape; outline: THREE.Vector2[] } {
  const control = puddleControlPoints().map(([x, z]) => new THREE.Vector3(x * scale, 0, z * scale));
  const curve = new THREE.CatmullRomCurve3(control, true, 'catmullrom', 0.5);
  // Shape lives in the XY plane; the mesh is rotated flat so shape y becomes -z
  const outline = curve.getPoints(BLOB_SEGMENTS).map((p) => new THREE.Vector2(p.x, -p.z));
  return { shape: new THREE.Shape(outline), outline };
}

export function RoadsidePuddleWithDuck({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: RoadsidePuddleWithDuckProps) {
  const duckRef = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const rippleMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  const zzzRef = useRef<THREE.Group>(null);
  /** Swim clock: slows to a stop as the duck falls asleep */
  const swimT = useRef(0);
  const [quacked, setQuacked] = useState(false);

  const { water, mud, wetGrass, pebbles } = useMemo(() => {
    const water = buildBlob(1);
    const mud = buildBlob(1.13);
    const wetGrass = buildBlob(1.42);
    // Pebbles sit just outside the muddy rim at irregular intervals
    const pebbles = mud.outline
      .filter((_, i) => i % 9 === 4 || i % 23 === 0)
      .map((p, i) => {
        const len = Math.hypot(p.x, p.y) || 1;
        const out = 1 + (0.06 + (i % 3) * 0.04) / len;
        return { x: p.x * out, z: -p.y * out, r: 0.03 + (i % 4) * 0.012 };
      });
    return { water, mud, wetGrass, pebbles };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    // Asleep once night has properly fallen
    const sleep = smoothstep(0.55, 0.95, dayNight.blend);
    swimT.current += Math.min(delta, 0.1) * (1 - sleep);
    const st = swimT.current;

    if (duckRef.current) {
      const [x, z] = duckPosition(st);
      // Slow breathing bob while asleep, paddling bob while swimming
      const bob = THREE.MathUtils.lerp(Math.sin(t * 3.2) * 0.006, Math.sin(t * 1.1) * 0.003, sleep);
      duckRef.current.position.set(x, 0.012 + bob, z);
      // Beak points along the direction of travel, with a gentle waddle roll
      duckRef.current.rotation.y = duckHeading(st);
      duckRef.current.rotation.z = Math.sin(t * 3.6) * 0.05 * (1 - sleep);

      // Head turns back and tucks onto the back; eyes close
      if (headRef.current) {
        headRef.current.rotation.set(0.25 * sleep, 2.7 * sleep, 0);
        headRef.current.position.y = 0.11 - 0.035 * sleep;
      }
      if (eyesRef.current) eyesRef.current.scale.y = 1 - 0.85 * sleep;

      // Little z's drifting up
      if (zzzRef.current) {
        zzzRef.current.visible = sleep > 0.5;
        zzzRef.current.position.set(x, 0.3, z);
        zzzRef.current.children.forEach((child, i) => {
          const p = (t * 0.35 + i / 3) % 1;
          child.position.set(0.05 + p * 0.08, p * 0.35, 0);
          child.scale.setScalar(Math.sin(p * Math.PI) * (0.6 + i * 0.2));
        });
      }

      // Expanding ripple that trails the duck
      if (rippleRef.current && rippleMatRef.current) {
        const phase = (t * 0.7) % 1;
        rippleRef.current.position.set(x, 0.018, z);
        rippleRef.current.scale.setScalar((0.4 + phase * 1.6) * DUCK_SCALE);
        rippleMatRef.current.opacity = 0.35 * (1 - phase) * (1 - sleep * 0.8);
      }
    }
  });

  const handleDuckClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('chime');
    setQuacked(true);
    setTimeout(() => setQuacked(false), 1200);
  };

  return (
    <group position={position} rotation={rotation} name="roadside-puddle-with-duck">
      {/* Damp grass around the puddle */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[wetGrass.shape, 24]} />
        <meshStandardMaterial color="#2C6B30" roughness={1} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* Wet mud rim */}
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[mud.shape, 24]} />
        <meshStandardMaterial color="#4A3B2A" roughness={0.95} />
      </mesh>

      {/* Reflective water */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[water.shape, 24]} />
        <meshStandardMaterial
          color="#4FA8D8"
          roughness={0.05}
          metalness={0.55}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Ripple trailing the duck */}
      <mesh ref={rippleRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.115, 32]} />
        <meshBasicMaterial ref={rippleMatRef} color="#E0F2FE" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Pebbles scattered unevenly around the rim */}
      {pebbles.map((p, i) => (
        <mesh key={i} position={[p.x, p.r * 0.5, p.z]} scale={[1, 0.6, 1.2]} castShadow receiveShadow>
          <sphereGeometry args={[p.r, 8, 6]} />
          <meshStandardMaterial color={i % 2 ? '#78716C' : '#A8A29E'} roughness={0.7} />
        </mesh>
      ))}

      {/* Sleeping z's (night only) */}
      <group ref={zzzRef} visible={false}>
        {[0, 1, 2].map((i) => (
          <Text key={i} fontSize={0.09} color="#E0E7FF" anchorX="center" anchorY="middle" outlineWidth={0.004} outlineColor="#312E81">
            z
          </Text>
        ))}
      </group>

      {/* Low-poly duck, ~35 cm long */}
      <group
        ref={duckRef}
        scale={quacked ? DUCK_SCALE * 1.15 : DUCK_SCALE}
        onClick={handleDuckClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Body */}
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.12, 6, 12]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>

        {/* Tail */}
        <mesh position={[0, 0.095, -0.15]} rotation={[-0.9, 0, 0]} castShadow>
          <coneGeometry args={[0.04, 0.09, 6]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.5} />
        </mesh>

        {/* Head, beak and eyes pivot at the neck so it can tuck in to sleep */}
        <group ref={headRef} position={[0, 0.11, 0.07]}>
        <group position={[0, -0.11, -0.07]}>
        <mesh position={[0, 0.17, 0.1]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, 0.155, 0.17]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.028, 0.065, 8]} />
          <meshStandardMaterial color="#EA580C" roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <group ref={eyesRef} position={[0, 0.185, 0.125]}>
          {[-0.045, 0.045].map((xEye) => (
            <mesh key={xEye} position={[xEye, 0, 0]}>
              <sphereGeometry args={[0.011, 8, 8]} />
              <meshBasicMaterial color="#0F172A" />
            </mesh>
          ))}
        </group>
        </group>
        </group>

        {/* Folded wings */}
        {[-0.078, 0.078].map((xWing, idx) => (
          <mesh
            key={xWing}
            position={[xWing, 0.08, -0.01]}
            rotation={[0, 0, idx === 0 ? 0.2 : -0.2]}
            scale={[0.3, 0.8, 1.5]}
            castShadow
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
