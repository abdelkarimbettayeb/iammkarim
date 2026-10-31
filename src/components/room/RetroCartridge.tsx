'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { CartridgeProject } from '@/types/room';
import { useRoomStore } from '@/store/useRoomStore';
import { playSound } from '@/lib/audioEngine';

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
    };
  }, []);

  useFrame((_, delta) => {
    if (!meshGroup.current) return;

    // Smooth lift on hover or selection
    const targetY = position[1] + (hovered || isSelected ? 0.16 : 0);
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
      }}
      onPointerOut={() => {
        setHovered(false);
        if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
      }}
    >
      {/* 1. Main Cartridge Plastic Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.34, 0.44, 0.08]} />
        <meshStandardMaterial
          color={project.color}
          roughness={0.4}
          metalness={0.2}
          emissive={isSelected ? project.color : '#000000'}
          emissiveIntensity={isSelected ? 0.35 : 0}
        />
      </mesh>

      {/* 2. Top Grip Ridges */}
      {[-0.04, 0, 0.04].map((yOffset, i) => (
        <mesh key={i} position={[0, 0.15 + yOffset, 0.042]}>
          <boxGeometry args={[0.26, 0.015, 0.01]} />
          <meshStandardMaterial color="#1E293B" roughness={0.6} />
        </mesh>
      ))}

      {/* 3. Front Sticker Label */}
      <mesh position={[0, -0.05, 0.042]}>
        <planeGeometry args={[0.28, 0.22]} />
        <meshStandardMaterial color="#0F172A" roughness={0.5} />
      </mesh>

      {/* 4. Mini Color Accent Bar on Sticker */}
      <mesh position={[0, 0.04, 0.044]}>
        <planeGeometry args={[0.24, 0.03]} />
        <meshStandardMaterial color={project.color} />
      </mesh>

      {/* 5. Tooltip Preview on Hover */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.42, 0.06]} center distanceFactor={7} pointerEvents="none">
          <div className="bg-[#0F172A]/95 backdrop-blur-md border border-sky-400/50 shadow-2xl px-3 py-2 rounded-lg text-left whitespace-nowrap min-w-[190px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-white tracking-wide">
                {project.title}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold uppercase">
                Cartridge
              </span>
            </div>
            <p className="text-[10px] text-slate-300 mt-1 line-clamp-1">{project.subtitle}</p>
            <div className="mt-1.5 pt-1 border-t border-slate-700/60 flex items-center gap-1 text-[9px] text-amber-300 font-bold">
              <span>▶</span> Click to slot into console & view
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
