'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CartridgeProject } from '@/types/room';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';
import { exploreStore } from '@/store/exploreStore';

interface RetroCartridgeProps {
  project: CartridgeProject;
  position: [number, number, number];
}

export function RetroCartridge({ project, position }: RetroCartridgeProps) {
  const [hovered, setHovered] = useState(false);
  const meshGroup = useRef<THREE.Group>(null);

  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveCartridge = useRoomStore((state) => state.setActiveCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  const isSelected = activeCartridge === project.id;

  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        exploreStore.setHover(null);
    };
  }, []);

  useFrame((_, delta) => {
    if (!meshGroup.current) return;

    // Smooth lift on hover or selection
    const targetY = position[1] + (hovered || isSelected ? 0.12 : 0);
    meshGroup.current.position.y = THREE.MathUtils.lerp(
      meshGroup.current.position.y,
      targetY,
      Math.min(delta * 12, 1)
    );
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    playSound('cartridge');
    setActiveCartridge(project.id);
    exploreStore.discover('cartridges');
    setActiveZone('workstation');
  };

  return (
    <group
      ref={meshGroup}
      position={[position[0], position[1], position[2]]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        exploreStore.setHover({ title: project.title, action: 'Open the case study' });
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        exploreStore.setHover(null);
      }}
    >
      {/* 1. Main Cartridge Plastic Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.36, 0.055]} />
        <meshStandardMaterial
          color={project.color}
          roughness={0.4}
          metalness={0.2}
          emissive={isSelected ? project.color : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* 2. Top Grip Ridges */}
      {[-0.03, 0, 0.03].map((yOffset, i) => (
        <mesh key={i} position={[0, 0.11 + yOffset, 0.029]}>
          <boxGeometry args={[0.20, 0.012, 0.008]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
      ))}

      {/* 3. Front Sticker Label */}
      <mesh position={[0, -0.04, 0.029]}>
        <planeGeometry args={[0.21, 0.17]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* 4. Mini Color Accent Bar on Sticker */}
      <mesh position={[0, 0.025, 0.030]}>
        <planeGeometry args={[0.18, 0.022]} />
        <meshStandardMaterial color={project.color} />
      </mesh>

    </group>
  );
}
