'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PottedCactusProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function PottedCactus({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: PottedCactusProps) {
  const cactusWobbleRef = useRef(0);
  const cactusRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (cactusWobbleRef.current > 0) {
      cactusWobbleRef.current = Math.max(0, cactusWobbleRef.current - delta * 4.5);
      if (cactusRef.current) {
        cactusRef.current.rotation.z =
          Math.sin(cactusWobbleRef.current * 30) * 0.12 * cactusWobbleRef.current;
      }
    }
  });

  const handleCactusClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    cactusWobbleRef.current = 1;
  };

  // Smooth curved geometries for left and right cactus arms
  const { leftArmGeom, rightArmGeom } = useMemo(() => {
    // Left arm: smooth S/U curve from trunk out and upward
    const leftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.52, 0),
      new THREE.Vector3(-0.08, 0.53, 0),
      new THREE.Vector3(-0.16, 0.58, 0),
      new THREE.Vector3(-0.16, 0.76, 0),
    ]);
    const leftGeom = new THREE.TubeGeometry(leftCurve, 20, 0.048, 16, false);

    // Right arm: slightly higher branching curve
    const rightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.62, 0),
      new THREE.Vector3(0.08, 0.63, 0),
      new THREE.Vector3(0.16, 0.68, 0),
      new THREE.Vector3(0.16, 0.84, 0),
    ]);
    const rightGeom = new THREE.TubeGeometry(rightCurve, 20, 0.048, 16, false);

    return { leftArmGeom: leftGeom, rightArmGeom: rightGeom };
  }, []);

  return (
    <group
      ref={cactusRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleCactusClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Ceramic Pot with Terracotta Rim */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.28, 24]} />
        <meshStandardMaterial color="#1E232B" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.06, 24]} />
        <meshStandardMaterial color="#C2410C" roughness={0.6} />
      </mesh>
      {/* Dark Pot Soil */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.03, 20]} />
        <meshStandardMaterial color="#382419" roughness={0.9} />
      </mesh>

      {/* 2. Main Saguaro Stem (Smooth dome tip) */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.58, 20]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.87, 0]} castShadow>
        <sphereGeometry args={[0.089, 20, 20]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>

      {/* 3. Smooth Curved Left Arm & Domed Tip */}
      <mesh geometry={leftArmGeom} castShadow>
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>
      <mesh position={[-0.16, 0.76, 0]} castShadow>
        <sphereGeometry args={[0.047, 16, 16]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>

      {/* 4. Smooth Curved Right Arm & Domed Tip */}
      <mesh geometry={rightArmGeom} castShadow>
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>
      <mesh position={[0.16, 0.84, 0]} castShadow>
        <sphereGeometry args={[0.047, 16, 16]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.55} />
      </mesh>
    </group>
  );
}
