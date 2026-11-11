'use client';

import React, { useState, Suspense } from 'react';
import { Float, useTexture } from '@react-three/drei';
import { exploreStore } from '@/store/exploreStore';
import { playSound } from '@/lib/audioEngine';
import type { TechSkillItem } from '@/types/room';

interface TechEmblemProps {
  skill: TechSkillItem;
  position: [number, number, number];
}

// A failed texture load throws during render; contain it so the badge renders without an icon.
class IconBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function EmblemIcon({ iconPath }: { iconPath: string }) {
  const texture = useTexture(iconPath);
  return (
    <mesh position={[0, 0, 0.031]}>
      <planeGeometry args={[0.16, 0.16]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function TechEmblem({ skill, position }: TechEmblemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      <Float
        speed={hovered ? 3 : 1.5}
        rotationIntensity={0}
        floatIntensity={hovered ? 0.15 : 0.05}
      >
        <group
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
            exploreStore.setHover({ title: `${skill.name} · ${skill.level}%`, action: skill.description ?? 'See my skills' });
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
            exploreStore.setHover(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            playSound('cartridge');
            exploreStore.discover('skills');
            exploreStore.openDrawer('skills');
          }}
        >
          {/* 1. Outer Hexagonal Badge Body */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.14, 0.045, 6]} />
            <meshStandardMaterial
              color="#0F172A"
              roughness={0.4}
              metalness={0.7}
            />
          </mesh>

          {/* 2. Glowing Hexagonal Accent Rim */}
          <mesh position={[0, 0, 0.024]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.115, 0.115, 0.008, 6]} />
            <meshStandardMaterial
              color={skill.color}
              emissive={skill.color}
              emissiveIntensity={hovered ? 0.8 : 0.4}
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>

          {/* 3. Dark Contrast Inset Face */}
          <mesh position={[0, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.100, 0.100, 0.005, 6]} />
            <meshStandardMaterial
              color="#0B0F19"
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>

          {/* 4. Official Skill Brand Icon (replacing placeholder dot) */}
          <IconBoundary>
            <Suspense fallback={null}>
              <EmblemIcon iconPath={skill.iconPath} />
            </Suspense>
          </IconBoundary>

        </group>
      </Float>
    </group>
  );
}
