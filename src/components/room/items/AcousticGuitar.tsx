'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playSound } from '@/lib/audioEngine';

interface AcousticGuitarProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isLeaning?: boolean;
}

export function AcousticGuitar({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  isLeaning = false,
}: AcousticGuitarProps) {
  const guitarRef = useRef<THREE.Group>(null);
  const guitarWobbleRef = useRef(0);

  const handleGuitarClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('guitar');
    guitarWobbleRef.current = 1;
  };

  useFrame((_, delta) => {
    if (guitarWobbleRef.current > 0) {
      guitarWobbleRef.current = Math.max(0, guitarWobbleRef.current - delta * 3.5);
      if (guitarRef.current) {
        const baseZRot = isLeaning ? -0.16 : 0;
        guitarRef.current.rotation.z =
          baseZRot + Math.sin(guitarWobbleRef.current * 32) * 0.07 * guitarWobbleRef.current;
      }
    }
  });

  // Dreadnought Continuous Body Shape with Soundhole cutout
  const { bodyGeometry, rosetteGeometry, pickguardGeometry } = useMemo(() => {
    const shape = new THREE.Shape();

    // Bottom center of guitar body
    shape.moveTo(0, -0.48);

    // Right lower bout (wide hip)
    shape.bezierCurveTo(0.24, -0.48, 0.38, -0.4, 0.38, -0.22);
    // Right waist (indented contour)
    shape.bezierCurveTo(0.38, -0.06, 0.27, 0.04, 0.25, 0.12);
    // Right upper bout (chest curve)
    shape.bezierCurveTo(0.23, 0.18, 0.31, 0.26, 0.31, 0.35);
    // Right shoulder to neck joint
    shape.bezierCurveTo(0.31, 0.42, 0.18, 0.45, 0.045, 0.45);

    // Neck joint top flat edge
    shape.lineTo(-0.045, 0.45);

    // Left shoulder
    shape.bezierCurveTo(-0.18, 0.45, -0.31, 0.42, -0.31, 0.35);
    // Left upper bout
    shape.bezierCurveTo(-0.31, 0.26, -0.23, 0.18, -0.25, 0.12);
    // Left waist
    shape.bezierCurveTo(-0.27, 0.04, -0.38, -0.06, -0.38, -0.22);
    // Left lower bout
    shape.bezierCurveTo(-0.38, -0.4, -0.24, -0.48, 0, -0.48);

    // Soundhole cutout
    const hole = new THREE.Path();
    hole.absarc(0, 0.18, 0.08, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.016,
      bevelSegments: 4,
      curveSegments: 32,
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();

    // Rosette ring around soundhole
    const rosette = new THREE.RingGeometry(0.082, 0.098, 36);

    // Teardrop Pickguard Shape (Mounted right of soundhole)
    const pg = new THREE.Shape();
    pg.moveTo(0.085, 0.18);
    pg.absarc(0, 0.18, 0.1, 0, -Math.PI / 2.2, true);
    pg.bezierCurveTo(0.18, 0.06, 0.22, 0.02, 0.22, -0.08);
    pg.bezierCurveTo(0.22, -0.16, 0.14, -0.18, 0.08, -0.14);
    pg.bezierCurveTo(0.06, -0.1, 0.085, 0.05, 0.085, 0.18);
    const pickguard = new THREE.ShapeGeometry(pg);

    return { bodyGeometry: geom, rosetteGeometry: rosette, pickguardGeometry: pickguard };
  }, []);

  const bodyMaterials = useMemo(() => {
    const spruce = new THREE.MeshStandardMaterial({
      color: '#F4E7D0',
      roughness: 0.35,
      metalness: 0.02,
    });
    const mahogany = new THREE.MeshStandardMaterial({
      color: '#702810',
      roughness: 0.4,
      metalness: 0.05,
    });
    return [spruce, mahogany];
  }, []);

  const defaultRotation: [number, number, number] = isLeaning
    ? [0.12, -0.2, -0.16]
    : rotation;

  return (
    <group
      ref={guitarRef}
      position={position}
      rotation={defaultRotation}
      scale={scale}
      onClick={handleGuitarClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      <group position={[0, isLeaning ? 0 : 0.52, 0]}>
        {/* 1. Continuous Dreadnought Body */}
        <mesh
          geometry={bodyGeometry}
          material={bodyMaterials}
          castShadow
          receiveShadow
        />

        {/* 2. Dark Soundhole Interior Cavity */}
        <mesh position={[0, 0.18, -0.04]}>
          <circleGeometry args={[0.082, 32]} />
          <meshBasicMaterial color="#141110" />
        </mesh>

        {/* 3. Ivory Rosette Inlay Ring Around Soundhole */}
        <mesh position={[0, 0.18, 0.088]} geometry={rosetteGeometry}>
          <meshStandardMaterial color="#FAF5EE" roughness={0.3} />
        </mesh>

        {/* 4. Classic Teardrop Pickguard */}
        <mesh position={[0, 0, 0.089]} geometry={pickguardGeometry}>
          <meshStandardMaterial color="#1E140E" roughness={0.3} metalness={0.1} />
        </mesh>

        {/* 5. Rosewood Bridge & Bone Saddle */}
        <mesh position={[0, -0.16, 0.095]} castShadow>
          <boxGeometry args={[0.22, 0.055, 0.02]} />
          <meshStandardMaterial color="#35160A" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.155, 0.106]}>
          <boxGeometry args={[0.16, 0.012, 0.008]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>

        {/* 6 Bridge Pins */}
        {[-0.06, -0.036, -0.012, 0.012, 0.036, 0.06].map((pinX, i) => (
          <mesh key={i} position={[pinX, -0.172, 0.107]}>
            <sphereGeometry args={[0.004, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
        ))}

        {/* 6. Sleek Mahogany Neck with Dark Rosewood Fretboard */}
        <mesh position={[0, 0.88, 0.02]} castShadow>
          <boxGeometry args={[0.075, 0.88, 0.045]} />
          <meshStandardMaterial color="#552107" roughness={0.45} />
        </mesh>
        <mesh position={[0, 0.88, 0.046]} receiveShadow>
          <boxGeometry args={[0.072, 0.88, 0.008]} />
          <meshStandardMaterial color="#241006" roughness={0.6} />
        </mesh>

        {/* Fret Markers (Silver Wire Frets) */}
        {[0.48, 0.58, 0.68, 0.78, 0.88, 0.98, 1.08, 1.18, 1.28].map((fretY, i) => (
          <mesh key={i} position={[0, fretY, 0.051]}>
            <boxGeometry args={[0.068, 0.003, 0.003]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* White Dot Position Inlays */}
        {[0.68, 0.88, 1.08].map((dotY, i) => (
          <mesh key={i} position={[0, dotY, 0.052]}>
            <circleGeometry args={[0.005, 12]} />
            <meshBasicMaterial color="#FAF5EE" />
          </mesh>
        ))}

        {/* 6 Acoustic Guitar Strings (Nut to Bridge) */}
        {[-0.025, -0.015, -0.005, 0.005, 0.015, 0.025].map((strX, i) => {
          const nutX = strX;
          const bridgeX = strX * 1.8;
          const midX = (nutX + bridgeX) / 2;
          return (
            <mesh
              key={i}
              position={[midX, 0.56, 0.106]}
              rotation={[0, 0, (bridgeX - nutX) * 0.6]}
            >
              <cylinderGeometry args={[0.0009, 0.0009, 1.48, 6]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} />
            </mesh>
          );
        })}

        {/* 7. Slotted Headstock & 6 Silver Tuning Pegs */}
        <mesh position={[0, 1.44, 0.015]} castShadow>
          <boxGeometry args={[0.11, 0.26, 0.038]} />
          <meshStandardMaterial color="#3B1505" roughness={0.5} />
        </mesh>
        {[-0.07, 0.07].map((xPeg, px) =>
          [1.35, 1.43, 1.51].map((yPeg, py) => (
            <mesh key={`${px}-${py}`} position={[xPeg, yPeg, 0.015]} castShadow>
              <sphereGeometry args={[0.016, 12, 12]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.15} />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
