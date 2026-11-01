'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

interface WallSconceProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function WallSconce({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: WallSconceProps) {
  // Graceful looping gooseneck / shepherd's hook arch starting from mounting plate at (0,0,0)
  const { curveGeo } = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 0.02),
      new THREE.Vector3(0.06, 0.12, 0.04),
      new THREE.Vector3(0.16, 0.22, 0.04),
      new THREE.Vector3(0.26, 0.2, 0.04),
      new THREE.Vector3(0.32, 0.1, 0.04),
      new THREE.Vector3(0.33, 0.02, 0.04),
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const curveGeo = new THREE.TubeGeometry(curve, 32, 0.012, 12, false);
    return { curveGeo };
  }, []);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Wall Mounting Disc at local origin (0,0,0) */}
      <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.075, 0.02, 24]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Seamless Continuous Looping White Gooseneck Arm */}
      <mesh geometry={curveGeo} castShadow>
        <meshStandardMaterial color="#F8FAFC" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Brass Lamp Socket Cap */}
      <mesh position={[0.33, 0.0, 0.04]} castShadow>
        <cylinderGeometry args={[0.026, 0.03, 0.03, 16]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.9} />
      </mesh>

      {/* Frosted Opal Glass Sphere Globe (Emissive Warm Glow) */}
      <mesh position={[0.33, -0.16, 0.04]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial
          color="#FFFFFF"
          emissive="#FFFBEB"
          emissiveIntensity={1.4}
          roughness={0.15}
        />
      </mesh>

      {/* Atmospheric Ambient Glow Light */}
      <pointLight
        position={[0.33, -0.16, 0.08]}
        intensity={1.2}
        distance={4}
        decay={2}
        color="#FEF3C7"
      />
    </group>
  );
}
