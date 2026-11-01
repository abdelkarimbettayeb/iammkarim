'use client';

import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface AcousticGuitarProps extends React.ComponentProps<'group'> {
  isLeaning?: boolean;
}

export function AcousticGuitar({ isLeaning = false, ...props }: AcousticGuitarProps) {
  const setActiveStation = useRoomStore((state) => state.setActiveStation);
  // 1. Classical Dreadnought Acoustic Guitar Body Profile
  const bodyShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Start at top center neck joint
    shape.moveTo(0, 0.38);
    // Upper bout right shoulder
    shape.bezierCurveTo(0.12, 0.38, 0.26, 0.35, 0.27, 0.24);
    // Inward waist curve
    shape.bezierCurveTo(0.28, 0.15, 0.25, 0.08, 0.23, 0.02);
    // Waist to lower bout
    shape.bezierCurveTo(0.22, -0.05, 0.24, -0.12, 0.28, -0.18);
    // Generous lower bout hips
    shape.bezierCurveTo(0.36, -0.26, 0.36, -0.42, 0.24, -0.50);
    // Bottom heel
    shape.bezierCurveTo(0.15, -0.56, 0.06, -0.56, 0, -0.56);

    // Symmetric left side (mirrored)
    shape.bezierCurveTo(-0.06, -0.56, -0.15, -0.56, -0.24, -0.50);
    shape.bezierCurveTo(-0.36, -0.42, -0.36, -0.26, -0.28, -0.18);
    shape.bezierCurveTo(-0.24, -0.12, -0.22, -0.05, -0.23, 0.02);
    shape.bezierCurveTo(-0.25, 0.08, -0.28, 0.15, -0.27, 0.24);
    shape.bezierCurveTo(-0.26, 0.35, -0.12, 0.38, 0, 0.38);

    return shape;
  }, []);

  // 2. Extrusion Settings for 3D Hollow Body Box
  const bodyGeometry = useMemo(() => {
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    };
    const geom = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
    // Center depth so front face sits at +0.06 and back sits at -0.06
    geom.translate(0, 0, -0.06);
    return geom;
  }, [bodyShape]);

  // 3. Blonde Spruce Soundboard Top Face
  const soundboardGeometry = useMemo(() => {
    return new THREE.ShapeGeometry(bodyShape);
  }, [bodyShape]);

  // 4. Classic Teardrop Tortoiseshell Pickguard
  const pickguardGeometry = useMemo(() => {
    const p = new THREE.Shape();
    p.moveTo(0.06, 0.14);
    p.bezierCurveTo(0.14, 0.12, 0.18, 0.04, 0.17, -0.06);
    p.bezierCurveTo(0.16, -0.14, 0.08, -0.18, 0.02, -0.17);
    p.bezierCurveTo(0.04, -0.08, 0.03, 0.02, -0.01, 0.08);
    p.bezierCurveTo(0.01, 0.12, 0.03, 0.14, 0.06, 0.14);
    return new THREE.ShapeGeometry(p);
  }, []);

  // Fret positions along the fingerboard
  const frets = [1.04, 0.98, 0.92, 0.86, 0.80, 0.74, 0.68, 0.62, 0.56, 0.50, 0.44, 0.38, 0.32, 0.26];
  const fretDots = [0.95, 0.83, 0.71, 0.59]; // 3rd, 5th, 7th, 9th frets
  const strings = [-0.022, -0.013, -0.004, 0.005, 0.014, 0.023]; // E, A, D, G, B, E

  const handleGuitarClick = (e: any) => {
    e.stopPropagation();
    setActiveStation('guitar');
    playSound('guitar');
  };

  return (
    <group
      {...props}
      onClick={handleGuitarClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* 3D Extruded Mahogany Body Shell (Back & Sides) */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <meshStandardMaterial color="#5C240E" roughness={0.45} />
      </mesh>

      {/* Blonde Natural Spruce Soundboard (Top Plate) */}
      <mesh geometry={soundboardGeometry} position={[0, 0, 0.073]} receiveShadow>
        <meshStandardMaterial color="#F2DFC0" roughness={0.35} />
      </mesh>

      {/* Dark Acoustic Soundhole Interior */}
      <mesh position={[0, 0.08, 0.074]}>
        <circleGeometry args={[0.068, 32]} />
        <meshStandardMaterial color="#140C07" roughness={0.9} />
      </mesh>

      {/* Decorative Ivory & Abalone Rosette Rings */}
      <mesh position={[0, 0.08, 0.0742]}>
        <ringGeometry args={[0.070, 0.086, 32]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.08, 0.0744]}>
        <ringGeometry args={[0.074, 0.081, 32]} />
        <meshStandardMaterial color="#78350F" roughness={0.4} />
      </mesh>

      {/* Tortoiseshell Teardrop Pickguard */}
      <mesh geometry={pickguardGeometry} position={[0, 0, 0.075]}>
        <meshStandardMaterial color="#2B1005" roughness={0.25} />
      </mesh>

      {/* Rosewood Belly Bridge */}
      <mesh position={[0, -0.27, 0.080]} castShadow>
        <boxGeometry args={[0.18, 0.048, 0.014]} />
        <meshStandardMaterial color="#2B1206" roughness={0.5} />
      </mesh>

      {/* White Bone Saddle */}
      <mesh position={[0, -0.262, 0.087]}>
        <boxGeometry args={[0.13, 0.007, 0.009]} />
        <meshStandardMaterial color="#FFFDF8" roughness={0.2} />
      </mesh>

      {/* 6 White Bridge Pins */}
      {[-0.05, -0.03, -0.01, 0.01, 0.03, 0.05].map((xPin, i) => (
        <group key={`pin-${i}`} position={[xPin, -0.276, 0.087]}>
          <mesh>
            <sphereGeometry args={[0.0045, 8, 8]} />
            <meshStandardMaterial color="#FFFDF8" roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.003]}>
            <circleGeometry args={[0.0018, 8]} />
            <meshStandardMaterial color="#1E293B" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Mahogany Neck Back */}
      <mesh position={[0, 0.73, 0.050]} castShadow>
        <boxGeometry args={[0.058, 0.74, 0.038]} />
        <meshStandardMaterial color="#5C2508" roughness={0.45} />
      </mesh>

      {/* Neck Heel Block (Join to Body) */}
      <mesh position={[0, 0.35, -0.01]} castShadow>
        <boxGeometry args={[0.060, 0.12, 0.07]} />
        <meshStandardMaterial color="#5C2508" roughness={0.45} />
      </mesh>

      {/* Rosewood Fingerboard */}
      <mesh position={[0, 0.66, 0.077]} castShadow>
        <boxGeometry args={[0.056, 0.88, 0.008]} />
        <meshStandardMaterial color="#1C0D05" roughness={0.6} />
      </mesh>

      {/* Silver Nickel Frets */}
      {frets.map((yFret, i) => (
        <mesh key={`fret-${i}`} position={[0, yFret, 0.082]}>
          <boxGeometry args={[0.054, 0.003, 0.003]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.2} />
        </mesh>
      ))}

      {/* Mother-of-Pearl Fret Marker Dots */}
      {fretDots.map((yDot, i) => (
        <mesh key={`dot-${i}`} position={[0, yDot, 0.082]}>
          <circleGeometry args={[0.0035, 12]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
      ))}
      {/* 12th Fret Double Dots */}
      <mesh position={[-0.012, 0.47, 0.082]}>
        <circleGeometry args={[0.003, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>
      <mesh position={[0.012, 0.47, 0.082]}>
        <circleGeometry args={[0.003, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>

      {/* Bone Nut */}
      <mesh position={[0, 1.10, 0.084]}>
        <boxGeometry args={[0.056, 0.014, 0.010]} />
        <meshStandardMaterial color="#FAF7F0" roughness={0.2} />
      </mesh>

      {/* Angled Headstock (Tilted Back ~12 deg) */}
      <group position={[0, 1.10, 0.068]} rotation={[-0.20, 0, 0]}>
        {/* Mahogany Headstock Body */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.078, 0.24, 0.022]} />
          <meshStandardMaterial color="#451A03" roughness={0.5} />
        </mesh>
        {/* Dark Headplate Veneer */}
        <mesh position={[0, 0.12, 0.012]}>
          <boxGeometry args={[0.076, 0.238, 0.002]} />
          <meshStandardMaterial color="#200D04" roughness={0.4} />
        </mesh>

        {/* 6 Chrome Tuning Pegs & Knobs */}
        {[-0.044, 0.044].map((xPost, sideIdx) =>
          [0.05, 0.12, 0.19].map((yPost, pegIdx) => (
            <group key={`peg-${sideIdx}-${pegIdx}`} position={[xPost, yPost, 0]}>
              {/* String Post */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.004, 0.004, 0.024, 8]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.15} />
              </mesh>
              {/* Tuning Knob extending sideways */}
              <mesh position={[sideIdx === 0 ? -0.025 : 0.025, 0, 0]}>
                <boxGeometry args={[0.018, 0.012, 0.006]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          ))
        )}
      </group>

      {/* 6 Steel Acoustic Strings (Gleaming in light) */}
      {strings.map((xStr, i) => (
        <mesh key={`str-${i}`} position={[xStr, 0.41, 0.085]}>
          <cylinderGeometry args={[0.0012, 0.0012, 1.36, 6]} />
          <meshStandardMaterial
            color={i < 3 ? '#D4AF37' : '#E2E8F0'}
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

