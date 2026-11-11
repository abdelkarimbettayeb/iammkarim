'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/store/useRoomStore';
import { dayNight } from '@/store/dayNight';
import { SASH_TRAVEL, SLAT_CLOSED_ANGLE, blindAngle, blindSpacing } from './windowMotion';

const GLASS_DAY = new THREE.Color('#BFE3F5');
const GLASS_NIGHT = new THREE.Color('#0B1226');

interface VenetianWindowProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Clear opening width / height in metres */
  width?: number;
  height?: number;
  /** Wall thickness the window sits in */
  depth?: number;
}

const SLAT_COUNT = 26;

const FRAME_COLOR = '#F5F5F4';

export function VenetianWindow({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  width = 1.14,
  height = 1.4,
  depth = 0.12,
}: VenetianWindowProps) {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);
  const isWindowOpen = useRoomStore((state) => state.isWindowOpen);
  const toggleWindow = useRoomStore((state) => state.toggleWindow);
  const setActiveStation = useRoomStore((state) => state.setActiveStation);

  const slatsRef = useRef<THREE.Group>(null);
  const sashRef = useRef<THREE.Group>(null);
  const bottomRailRef = useRef<THREE.Mesh>(null);
  const glassMatRefs = useRef<THREE.MeshStandardMaterial[]>([]);
  /** 0 = closed, 1 = fully open */
  const openRef = useRef(isWindowOpen ? 1 : 0);

  // Close automatically when it turns night or starts to snow. Only reacts to
  // the transition, so a visitor can still open it again afterwards.
  const prevConditions = useRef({ night: isNightMode, snow: weatherState === 'snow' });
  useEffect(() => {
    const snow = weatherState === 'snow';
    const turnedNight = isNightMode && !prevConditions.current.night;
    const startedSnow = snow && !prevConditions.current.snow;
    if (turnedNight || startedSnow) toggleWindow(false);
    prevConditions.current = { night: isNightMode, snow };
  }, [isNightMode, weatherState, toggleWindow]);

  const innerW = width - 0.1;
  const innerH = height - 0.1;
  const sashH = innerH / 2 + 0.02;
  const blindTop = height / 2 - 0.1;
  const blindSpan = height - 0.22;
  const pitch = blindSpan / SLAT_COUNT;
  const slatWidth = pitch * 1.25; // wider than the pitch so a closed blind fully overlaps
  const blindZ = depth / 2 + 0.09;

  const slatIndices = useMemo(() => Array.from({ length: SLAT_COUNT }, (_, i) => i), []);

  useFrame((_, delta) => {
    const target = isWindowOpen ? 1 : 0;
    openRef.current = THREE.MathUtils.damp(openRef.current, target, 4.5, delta);
    const o = openRef.current;

    // Lower sash slides up
    if (sashRef.current) {
      sashRef.current.position.y = -innerH / 4 + o * sashH * SASH_TRAVEL;
    }

    // Blind: slats tilt open and the stack gathers towards the head rail
    const angle = blindAngle(o);
    const spacing = blindSpacing(pitch, o);
    if (slatsRef.current) {
      slatsRef.current.children.forEach((child, i) => {
        child.position.y = blindTop - pitch * 0.5 - i * spacing;
        child.rotation.x = angle;
      });
    }
    if (bottomRailRef.current) {
      bottomRailRef.current.position.y = blindTop - pitch * 0.5 - (SLAT_COUNT - 1) * spacing - 0.035;
    }

    // Glass: clear blue-ish by day, dark mirror at night
    const night = dayNight.blend;
    for (const m of glassMatRefs.current) {
      if (!m) continue;
      m.opacity = THREE.MathUtils.lerp(0.14, 0.5, night);
      m.color.copy(GLASS_DAY).lerp(GLASS_NIGHT, night);
    }
  });

  // He walks over and pulls the blind himself; the toggle happens when his hand gets there
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveStation('window');
  };

  const registerGlass = (index: number) => (m: THREE.MeshStandardMaterial | null) => {
    if (m) glassMatRefs.current[index] = m;
  };

  const frameMat = <meshStandardMaterial color={FRAME_COLOR} roughness={0.45} />;
  const slatMat = <meshStandardMaterial color="#F1F5F9" roughness={0.5} side={THREE.DoubleSide} />;
  const sashDepth = 0.035;

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* Invisible hit area covering the whole opening so any click on it counts */}
      <mesh position={[0, 0, depth / 2 + 0.12]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* =========================================
          Reveal liner: lines the opening through the wall
         ========================================= */}
      {[-1, 1].map((side) => (
        <mesh key={`jamb-${side}`} position={[side * (width / 2 - 0.025), 0, 0.02]} castShadow>
          <boxGeometry args={[0.05, height, depth + 0.04]} />
          {frameMat}
        </mesh>
      ))}
      <mesh position={[0, height / 2 - 0.025, 0.02]} castShadow>
        <boxGeometry args={[width, 0.05, depth + 0.04]} />
        {frameMat}
      </mesh>
      {/* Window board (sill) protruding into the room */}
      <mesh position={[0, -height / 2 + 0.0175, depth / 2 + 0.03]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.12, 0.035, 0.14]} />
        {frameMat}
      </mesh>

      {/* =========================================
          Upper fixed sash (outer track)
         ========================================= */}
      <group position={[0, innerH / 4, -0.015]}>
        <mesh>
          <planeGeometry args={[innerW - 0.04, sashH - 0.04]} />
          <meshStandardMaterial
            ref={registerGlass(0)}
            color="#BFE3F5"
            roughness={0.05}
            metalness={0.3}
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
        {/* Sash rails */}
        <mesh position={[0, sashH / 2 - 0.015, 0]}>
          <boxGeometry args={[innerW, 0.03, sashDepth]} />
          {frameMat}
        </mesh>
        <mesh position={[0, -sashH / 2 + 0.015, 0]}>
          <boxGeometry args={[innerW, 0.03, sashDepth]} />
          {frameMat}
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (innerW / 2 - 0.015), 0, 0]}>
            <boxGeometry args={[0.03, sashH, sashDepth]} />
            {frameMat}
          </mesh>
        ))}
      </group>

      {/* =========================================
          Lower sliding sash (inner track): slides up when opened
         ========================================= */}
      <group ref={sashRef} position={[0, -innerH / 4, 0.025]}>
        <mesh>
          <planeGeometry args={[innerW - 0.04, sashH - 0.04]} />
          <meshStandardMaterial
            ref={registerGlass(1)}
            color="#BFE3F5"
            roughness={0.05}
            metalness={0.3}
            transparent
            opacity={0.14}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, sashH / 2 - 0.015, 0]}>
          <boxGeometry args={[innerW, 0.03, sashDepth]} />
          {frameMat}
        </mesh>
        <mesh position={[0, -sashH / 2 + 0.015, 0]}>
          <boxGeometry args={[innerW, 0.03, sashDepth]} />
          {frameMat}
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (innerW / 2 - 0.015), 0, 0]}>
            <boxGeometry args={[0.03, sashH, sashDepth]} />
            {frameMat}
          </mesh>
        ))}
        {/* Handle */}
        <mesh position={[0, sashH / 2 - 0.045, sashDepth / 2 + 0.01]}>
          <boxGeometry args={[0.12, 0.012, 0.02]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>

      {/* =========================================
          Venetian blind (inside the room, in front of the sashes)
         ========================================= */}
      <mesh position={[0, height / 2 - 0.06, blindZ]} castShadow>
        <boxGeometry args={[width - 0.08, 0.06, 0.07]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
      </mesh>

      <group ref={slatsRef} position={[0, 0, blindZ]}>
        {slatIndices.map((i) => (
          <mesh key={i} position={[0, blindTop - pitch * 0.5 - i * pitch, 0]} rotation={[SLAT_CLOSED_ANGLE, 0, 0]} castShadow>
            <boxGeometry args={[width - 0.1, 0.004, slatWidth]} />
            {slatMat}
          </mesh>
        ))}
      </group>

      {/* Bottom rail follows the lowest slat */}
      <mesh ref={bottomRailRef} position={[0, blindTop - blindSpan - 0.035, blindZ]} castShadow>
        <boxGeometry args={[width - 0.1, 0.02, 0.035]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
      </mesh>

      {/* Ladder cords */}
      {[-1, 1].map((s) => (
        <mesh key={`cord-${s}`} position={[s * (width / 2 - 0.12), 0, blindZ + 0.002]}>
          <cylinderGeometry args={[0.002, 0.002, height - 0.18, 6]} />
          <meshBasicMaterial color="#94A3B8" />
        </mesh>
      ))}
    </group>
  );
}
