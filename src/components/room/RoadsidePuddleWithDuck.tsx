'use client';

import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { playSound } from '@/lib/audioEngine';

interface RoadsidePuddleWithDuckProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export function RoadsidePuddleWithDuck({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: RoadsidePuddleWithDuckProps) {
  const duckRef = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const [quacked, setQuacked] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (duckRef.current) {
      // Gentle floating bob & circular paddle swim in the puddle
      const swimRadius = 0.22;
      duckRef.current.position.x = Math.cos(t * 0.8) * swimRadius;
      duckRef.current.position.z = Math.sin(t * 0.8) * swimRadius;
      duckRef.current.position.y = 0.03 + Math.sin(t * 3.5) * 0.015;
      // Facing the direction of travel + gentle waddle tilt
      duckRef.current.rotation.y = -t * 0.8 + Math.PI / 2;
      duckRef.current.rotation.z = Math.sin(t * 4.0) * 0.08;
    }

    if (rippleRef.current) {
      // Subtle pulsing water surface ripple
      const scale = 1 + (Math.sin(t * 2.0) * 0.06);
      rippleRef.current.scale.set(scale, 1, scale);
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
      {/* =========================================
          1. Organic Roadside Water Puddle
         ========================================= */}
      {/* Dark Damp Mud Basin */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0.3]} receiveShadow>
        <circleGeometry args={[0.95, 32]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

      {/* Glossy Reflective Water Surface */}
      <mesh
        ref={rippleRef}
        position={[0, 0.016, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.82, 32]} />
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.08}
          metalness={0.7}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Gentle Concentric Ripple Ring */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.33, 24]} />
        <meshBasicMaterial color="#E0F2FE" transparent opacity={0.35} />
      </mesh>

      {/* Smooth Pebbles Around Water Rim */}
      {[
        [-0.7, 0.02, 0.3, 0.06],
        [-0.45, 0.02, -0.65, 0.08],
        [0.65, 0.02, 0.4, 0.05],
        [0.72, 0.02, -0.3, 0.07],
        [0.1, 0.02, 0.78, 0.06],
      ].map(([px, py, pz, pr], i) => (
        <mesh key={i} position={[px, py, pz]} castShadow receiveShadow>
          <sphereGeometry args={[pr, 8, 8]} />
          <meshStandardMaterial color="#78716C" roughness={0.6} />
        </mesh>
      ))}

      {/* =========================================
          2. Cute Low-Poly Floating Duck
         ========================================= */}
      <group
        ref={duckRef}
        position={[0, 0.03, 0]}
        scale={quacked ? 1.25 : 1}
        onClick={handleDuckClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Yellow Feathered Body */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <capsuleGeometry args={[0.075, 0.12, 4, 8]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>

        {/* Tail Feather Tip */}
        <mesh position={[0, 0.1, -0.1]} rotation={[-0.4, 0, 0]} castShadow>
          <coneGeometry args={[0.04, 0.08, 4]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.5} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.16, 0.09]} castShadow>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FBBF24" roughness={0.5} />
        </mesh>

        {/* Cheerful Orange Beak */}
        <mesh position={[0, 0.145, 0.16]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[0.028, 0.065, 4]} />
          <meshStandardMaterial color="#EA580C" roughness={0.4} />
        </mesh>

        {/* Black Bead Eyes (Left & Right) */}
        {[-0.045, 0.045].map((xEye, idx) => (
          <mesh key={idx} position={[xEye, 0.175, 0.11]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        ))}

        {/* Folded Wings (Left & Right) */}
        {[-0.08, 0.08].map((xWing, idx) => (
          <mesh key={idx} position={[xWing, 0.075, 0]} rotation={[0, 0, idx === 0 ? 0.2 : -0.2]}>
            <boxGeometry args={[0.02, 0.06, 0.1]} />
            <meshStandardMaterial color="#F59E0B" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
