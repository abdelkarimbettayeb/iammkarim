'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface FoldedPrism3DProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  depth?: number;
  bevel?: number;
  centerZ?: boolean;
  primaryColor?: string;
  primaryDarkColor?: string;
  secondaryColor?: string;
  secondaryDarkColor?: string;
  accentColor?: string;
  accentDarkColor?: string;
  blendRef?: React.MutableRefObject<number>;
  metalness?: number;
  roughness?: number;
  accentEmissive?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

function toNorm(x: number, y: number): [number, number] {
  return [(x - 32) / 42, -(y - 31.5) / 42];
}

function createPolygonShape(points: Array<[number, number]>): THREE.Shape {
  const shape = new THREE.Shape();
  points.forEach(([x, y], idx) => {
    const [nx, ny] = toNorm(x, y);
    if (idx === 0) shape.moveTo(nx, ny);
    else shape.lineTo(nx, ny);
  });
  shape.closePath();
  return shape;
}

/**
 * Reusable sculpted 3D extrusion of Logo 07 (Folded Prism) with stepped ribbon depth
 * to prevent apex z-fighting and optional smooth light/dark material morphing.
 */
export function FoldedPrism3D({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  depth = 0.12,
  bevel = 0.008,
  centerZ = false,
  primaryColor = '#111113',
  primaryDarkColor,
  secondaryColor = '#4B5563',
  secondaryDarkColor,
  accentColor = '#E0441B',
  accentDarkColor,
  blendRef,
  metalness = 0.35,
  roughness = 0.26,
  accentEmissive = 0.12,
  castShadow = true,
  receiveShadow = true,
}: FoldedPrism3DProps) {
  const primaryMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const secondaryMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const accentMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const clampedBevel = Math.min(bevel, depth * 0.25);

  const geometries = useMemo(() => {
    const leftShape = createPolygonShape([
      [11, 52],
      [27.5, 11],
      [36.5, 11],
      [21, 52],
    ]);
    const rightShape = createPolygonShape([
      [27.5, 11],
      [36.5, 11],
      [53, 52],
      [43, 52],
    ]);
    const prismShape = createPolygonShape([
      [32, 27.5],
      [39.56, 47.5],
      [24.44, 47.5],
    ]);

    const makeGeo = (shape: THREE.Shape, extrudeDepth: number) =>
      new THREE.ExtrudeGeometry(shape, {
        depth: Math.max(0.001, extrudeDepth - clampedBevel * 2),
        bevelEnabled: clampedBevel > 0.0002,
        bevelThickness: clampedBevel,
        bevelSize: clampedBevel,
        bevelSegments: 2,
      });

    return {
      leftGeo: makeGeo(leftShape, depth),
      rightGeo: makeGeo(rightShape, depth * 0.78),
      prismGeo: makeGeo(prismShape, depth * 0.92),
    };
  }, [depth, clampedBevel]);

  useEffect(() => {
    return () => {
      geometries.leftGeo.dispose();
      geometries.rightGeo.dispose();
      geometries.prismGeo.dispose();
    };
  }, [geometries]);

  const colors = useMemo(
    () => ({
      pLight: new THREE.Color(primaryColor),
      pDark: new THREE.Color(primaryDarkColor ?? primaryColor),
      sLight: new THREE.Color(secondaryColor),
      sDark: new THREE.Color(secondaryDarkColor ?? secondaryColor),
      aLight: new THREE.Color(accentColor),
      aDark: new THREE.Color(accentDarkColor ?? accentColor),
    }),
    [primaryColor, primaryDarkColor, secondaryColor, secondaryDarkColor, accentColor, accentDarkColor]
  );

  useFrame(() => {
    if (!blendRef) return;
    const b = blendRef.current;
    if (primaryMatRef.current) {
      primaryMatRef.current.color.lerpColors(colors.pLight, colors.pDark, b);
    }
    if (secondaryMatRef.current) {
      secondaryMatRef.current.color.lerpColors(colors.sLight, colors.sDark, b);
    }
    if (accentMatRef.current) {
      accentMatRef.current.color.lerpColors(colors.aLight, colors.aDark, b);
      accentMatRef.current.emissive.lerpColors(colors.aLight, colors.aDark, b);
    }
  });

  const zShift = centerZ ? -depth * 0.5 : 0;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[0, 0, zShift]}>
        {/* Right descending ribbon (back fold) */}
        <mesh
          geometry={geometries.rightGeo}
          position={[0, 0, clampedBevel]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        >
          <meshStandardMaterial
            ref={secondaryMatRef}
            color={secondaryColor}
            metalness={metalness}
            roughness={roughness + 0.04}
          />
        </mesh>

        {/* Left ascending ribbon (forward apex fold) */}
        <mesh
          geometry={geometries.leftGeo}
          position={[0, 0, clampedBevel + depth * 0.08]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        >
          <meshStandardMaterial
            ref={primaryMatRef}
            color={primaryColor}
            metalness={metalness}
            roughness={roughness}
          />
        </mesh>

        {/* Signal Vermilion inner prism core */}
        <mesh
          geometry={geometries.prismGeo}
          position={[0, 0, clampedBevel + depth * 0.14]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        >
          <meshStandardMaterial
            ref={accentMatRef}
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={accentEmissive}
            metalness={Math.min(1, metalness + 0.1)}
            roughness={Math.max(0.1, roughness - 0.06)}
          />
        </mesh>
      </group>
    </group>
  );
}
