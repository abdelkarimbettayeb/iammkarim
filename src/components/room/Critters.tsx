'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { dayNight } from '@/store/dayNight';
import { roomStore } from '@/store/useRoomStore';
import { OUTDOOR, PATH_X, ROOM } from './layout';

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function hash(i: number, salt: number): number {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/** Garden spots they hang around: the shrub, the pond, the flower beds */
const FLOWER_BEDS: [number, number][] = [
  [OUTDOOR.bush.x + 0.55, OUTDOOR.bush.z + 0.35],
  [ROOM.minX - 0.55, ROOM.maxZ + 0.55],
  // Clear of his lawn lanes (path -> volleyball, path -> thinking spot)
  [PATH_X + 1.8, ROOM.maxZ + 1.7],
  [OUTDOOR.puddle.x - 1.3, OUTDOOR.puddle.z - 0.6],
];

const FLOWER_COLORS = ['#F472B6', '#FDE047', '#FFFFFF', '#C084FC', '#FB923C'];

/** Little clumps of wildflowers the butterflies visit */
function Flowers() {
  const flowers = useMemo(
    () =>
      FLOWER_BEDS.flatMap(([cx, cz], b) =>
        Array.from({ length: 7 }, (_, i) => {
          const k = b * 10 + i;
          const a = hash(k, 1) * Math.PI * 2;
          const r = 0.06 + hash(k, 2) * 0.3;
          return {
            x: cx + Math.cos(a) * r,
            z: cz + Math.sin(a) * r,
            h: 0.12 + hash(k, 3) * 0.12,
            color: FLOWER_COLORS[(b + i) % FLOWER_COLORS.length],
            tilt: (hash(k, 4) - 0.5) * 0.4,
          };
        })
      ),
    []
  );
  return (
    <group name="flowers">
      {flowers.map((f, i) => (
        <group key={i} position={[f.x, -0.04, f.z]} rotation={[f.tilt, 0, f.tilt * 0.6]}>
          <mesh position={[0, f.h / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.005, f.h, 5]} />
            <meshStandardMaterial color="#3F7D32" roughness={0.8} />
          </mesh>
          {/* Five petals around a yellow eye */}
          {[0, 1, 2, 3, 4].map((p) => (
            <mesh
              key={p}
              position={[Math.cos((p / 5) * Math.PI * 2) * 0.016, f.h, Math.sin((p / 5) * Math.PI * 2) * 0.016]}
              scale={[1, 0.35, 1]}
            >
              <sphereGeometry args={[0.014, 8, 6]} />
              <meshStandardMaterial color={f.color} roughness={0.6} />
            </mesh>
          ))}
          <mesh position={[0, f.h + 0.004, 0]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshStandardMaterial color="#CA8A04" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const FIREFLIES = 40;

/** Blinking fireflies drifting low over the lawn after dark (they are their own light) */
function Fireflies() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const flies = useMemo(
    () =>
      Array.from({ length: FIREFLIES }, (_, i) => {
        const bed = FLOWER_BEDS[i % FLOWER_BEDS.length];
        return {
          x: bed[0] + (hash(i, 5) - 0.5) * 3,
          z: bed[1] + (hash(i, 6) - 0.5) * 2.4,
          y: 0.25 + hash(i, 7) * 0.9,
          phase: hash(i, 8) * 100,
          speed: 0.25 + hash(i, 9) * 0.35,
          blink: 0.6 + hash(i, 10) * 0.9,
        };
      }),
    []
  );
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const night = smoothstep(0.5, 0.95, dayNight.blend);
    // Not in the rain or snow either
    const out = roomStore.getState().weatherState === 'clear' ? night : 0;
    mesh.visible = out > 0.01;
    if (!mesh.visible) return;
    const t = state.clock.getElapsedTime();
    flies.forEach((f, i) => {
      const ph = f.phase + t * f.speed;
      tmp.p.set(
        f.x + Math.sin(ph * 1.3) * 0.6 + Math.sin(ph * 3.1) * 0.08,
        f.y + Math.sin(ph * 1.7) * 0.18,
        f.z + Math.cos(ph * 0.9) * 0.5
      );
      // Slow glow on, quick fade off, long dark gap
      const cycle = (t * f.blink + f.phase) % 3;
      const glow = cycle < 1 ? Math.sin(cycle * Math.PI) : 0;
      const r = (0.008 + glow * 0.022) * out;
      tmp.s.set(r, r, r);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, FIREFLIES]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial color="#E4FF7A" toneMapped={false} />
    </instancedMesh>
  );
}

const BUTTERFLY_COLORS = ['#F59E0B', '#38BDF8', '#F472B6', '#FFFFFF', '#A3E635'];

/** One butterfly: flapping wings, fluttering flight between the flower beds */
function Butterfly({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const color = BUTTERFLY_COLORS[index % BUTTERFLY_COLORS.length];
  const seed = useMemo(() => ({ a: hash(index, 11) * 10, s: 0.18 + hash(index, 12) * 0.1, bed: index % FLOWER_BEDS.length }), [index]);
  const prev = useRef(new THREE.Vector3());

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const day = 1 - smoothstep(0.3, 0.6, dayNight.blend);
    g.visible = day > 0.01 && roomStore.getState().weatherState === 'clear';
    if (!g.visible) return;
    const t = state.clock.getElapsedTime() * seed.s + seed.a;
    // Wander a loop around one bed, drifting over to the next now and then
    const bedA = FLOWER_BEDS[(seed.bed + Math.floor(t / 6)) % FLOWER_BEDS.length];
    const bedB = FLOWER_BEDS[(seed.bed + Math.floor(t / 6) + 1) % FLOWER_BEDS.length];
    const k = smoothstep(4.5, 6, t % 6);
    const cx = bedA[0] + (bedB[0] - bedA[0]) * k;
    const cz = bedA[1] + (bedB[1] - bedA[1]) * k;
    const x = cx + Math.sin(t * 3.1) * 0.45 + Math.sin(t * 7.3) * 0.08;
    const z = cz + Math.cos(t * 2.3) * 0.35;
    const y = 0.35 + Math.abs(Math.sin(t * 4.1)) * 0.35 + Math.sin(t * 13) * 0.04;
    g.position.set(x, y, z);
    const dx = x - prev.current.x;
    const dz = z - prev.current.z;
    if (Math.hypot(dx, dz) > 1e-4) g.rotation.y = Math.atan2(dx, dz);
    prev.current.set(x, y, z);
    const flap = Math.sin(state.clock.getElapsedTime() * 22 + seed.a) * 1.1;
    if (left.current) left.current.rotation.z = 0.2 + flap;
    if (right.current) right.current.rotation.z = -0.2 - flap;
  });

  const wing = (
    <>
      <mesh position={[0.026, 0, 0.008]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1.25, 1]}>
        <circleGeometry args={[0.026, 12]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
      <mesh position={[0.018, 0, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.017, 10]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.6} />
      </mesh>
    </>
  );

  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.004, 0.035, 3, 6]} />
        <meshStandardMaterial color="#1C1917" />
      </mesh>
      <group ref={right}>{wing}</group>
      <group ref={left} scale={[-1, 1, 1]}>
        {wing}
      </group>
    </group>
  );
}

export function Critters() {
  return (
    <group name="critters">
      <Flowers />
      <Fireflies />
      {[0, 1, 2, 3].map((i) => (
        <Butterfly key={i} index={i} />
      ))}
    </group>
  );
}
