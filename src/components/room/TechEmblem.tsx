'use client';

import React, { useState } from 'react';
import { Float, Html } from '@react-three/drei';
import type { TechSkillItem } from '@/types/room';

interface TechEmblemProps {
  skill: TechSkillItem;
  position: [number, number, number];
}

export function TechEmblem({ skill, position }: TechEmblemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Float
        speed={hovered ? 4 : 2}
        rotationIntensity={hovered ? 0.6 : 0.25}
        floatIntensity={0.3}
      >
        <group
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
        >
          {/* 1. Outer Hexagonal Badge Body */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.22, 0.06, 6]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>

          {/* 2. Glowing Front Emblem Inset */}
          <mesh position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.015, 6]} />
            <meshStandardMaterial
              color={skill.color}
              emissive={skill.color}
              emissiveIntensity={hovered ? 0.7 : 0.3}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>

          {/* 3. Center Metallic Core */}
          <mesh position={[0, 0, 0.045]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={hovered ? 0.6 : 0.2}
              roughness={0.2}
            />
          </mesh>

          {/* 4. Hover Tooltip Badge */}
          {hovered && (
            <Html position={[0, 0.38, 0.06]} center distanceFactor={7} pointerEvents="none">
              <div className="bg-[#0B0F19]/95 backdrop-blur-md border border-slate-700 shadow-xl px-3 py-1.5 rounded-lg text-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center gap-2 justify-center">
                  <span className="font-bold text-xs text-white tracking-wide">
                    {skill.name}
                  </span>
                  <span
                    className="text-[10px] font-black px-1.5 py-0.2 rounded"
                    style={{ backgroundColor: `${skill.color}25`, color: skill.color }}
                  >
                    {skill.level}%
                  </span>
                </div>
                {skill.description && (
                  <p className="text-[9px] text-slate-400 mt-0.5 max-w-[150px] line-clamp-1">
                    {skill.description}
                  </p>
                )}
              </div>
            </Html>
          )}
        </group>
      </Float>
    </group>
  );
}
