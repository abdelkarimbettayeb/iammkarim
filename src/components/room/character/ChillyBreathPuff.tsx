'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ChillyBreathPuffProps {
  active: boolean;
  position?: [number, number, number];
}

export function ChillyBreathPuff({ active, position = [0, 0, 0] }: ChillyBreathPuffProps) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef(0);
  const progressRef = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (active) {
      progressRef.current = (progressRef.current + delta * 1.6) % 1.0;
      opacityRef.current = Math.sin(progressRef.current * Math.PI) * 0.75;
      const s = 0.5 + progressRef.current * 0.9;
      groupRef.current.scale.set(s, s, s);
      groupRef.current.position.y = position[1] + progressRef.current * 0.12;
      groupRef.current.position.z = position[2] + progressRef.current * 0.18;
    } else {
      opacityRef.current = THREE.MathUtils.damp(opacityRef.current, 0, 6, delta);
    }

    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material && 'opacity' in mesh.material) {
        (mesh.material as THREE.MeshBasicMaterial).opacity = opacityRef.current;
      }
    });
  });

  return (
    <group ref={groupRef} position={position} name="chilly-breath-puff">
      {[
        [0, 0, 0.02, 0.045],
        [0.03, 0.02, 0.05, 0.04],
        [-0.025, 0.015, 0.06, 0.035],
        [0.01, 0.035, 0.08, 0.05],
      ].map(([px, py, pz, pr], idx) => (
        <mesh key={idx} position={[px, py, pz]}>
          <dodecahedronGeometry args={[pr, 0]} />
          <meshBasicMaterial color="#F8FAFC" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

