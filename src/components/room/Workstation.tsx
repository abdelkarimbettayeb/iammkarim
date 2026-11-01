'use client';

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useRoomStore } from '@/store/useRoomStore';
import { cartridgeProjects } from '@/data/resumeData';
import { DeskLamp } from './DeskLamp';

export function Workstation() {
  // Positioned along the dark charcoal left wall (X = -4.0)
  const deskX = -2.1;
  const deskY = 1.4;
  const deskZ = -1.1;

  const [screenHovered, setScreenHovered] = useState(false);
  const activeCartridge = useRoomStore((state) => state.activeCartridge);
  const setActiveZone = useRoomStore((state) => state.setActiveZone);

  const activeProject = activeCartridge ? cartridgeProjects[activeCartridge] : null;

  React.useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  const handleMonitorClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveZone('workstation');
  };

  return (
    <group name="workstation">
      {/* =========================================
          1. Mid-Century Modern Teak Desk (Splayed Tapered Wooden Legs)
         ========================================= */}
      <group position={[deskX, deskY, deskZ]}>
        {/* Warm Teak Tabletop with Chamfered Edges */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.3, 0.07, 1.15]} />
          <meshStandardMaterial color="#CF6B2C" roughness={0.5} />
        </mesh>

        {/* 4 Mid-Century Tapered Round Wooden Legs (Splayed Outward) */}
        {[
          [-0.98, -0.68, -0.44, 0.14, -0.14],
          [0.98, -0.68, -0.44, 0.14, 0.14],
          [-0.98, -0.68, 0.44, -0.14, -0.14],
          [0.98, -0.68, 0.44, -0.14, 0.14],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.024, 0.016, 1.35, 12]} />
            <meshStandardMaterial color="#854D0E" roughness={0.6} />
          </mesh>
        ))}

        {/* Vertical Black Binder / Journal on Right Side ("W Premium Partner") */}
        <mesh position={[0.9, 0.28, -0.1]} castShadow>
          <boxGeometry args={[0.08, 0.52, 0.36]} />
          <meshStandardMaterial color="#0F172A" roughness={0.4} />
        </mesh>
        <mesh position={[0.942, 0.28, -0.1]}>
          <planeGeometry args={[0.3, 0.08]} />
          <meshStandardMaterial color="#38BDF8" roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================
          2. Under-Desk Gaming Console (White PS5 Vertical)
         ========================================= */}
      <group position={[deskX - 0.72, 0.4, deskZ + 0.12]} rotation={[0, -0.1, 0]}>
        {/* Dark Core Body */}
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.65, 0.36]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.5} />
        </mesh>
        {/* Left Curved White Wing */}
        <mesh position={[-0.07, 0, 0]} castShadow>
          <boxGeometry args={[0.018, 0.68, 0.38]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Right Curved White Wing */}
        <mesh position={[0.07, 0, 0]} castShadow>
          <boxGeometry args={[0.018, 0.68, 0.38]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
        {/* Power LED Slit */}
        <mesh position={[0, 0.28, 0.185]}>
          <planeGeometry args={[0.06, 0.012]} />
          <meshBasicMaterial color="#38BDF8" />
        </mesh>
      </group>

      {/* =========================================
          3. Sleek Ultrawide Interactive Display
         ========================================= */}
      <group
        position={[deskX, deskY + 0.78, deskZ - 0.18]}
        onClick={handleMonitorClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setScreenHovered(true);
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setScreenHovered(false);
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        {/* Minimal Metallic Stand Base */}
        <mesh position={[0, -0.74, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 0.02, 20]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Vertical Stand Column */}
        <mesh position={[0, -0.38, -0.04]} castShadow>
          <cylinderGeometry args={[0.028, 0.028, 0.72, 12]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Outer Monitor Enclosure (Slim Bezels) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.85, 0.05]} />
          <meshStandardMaterial color="#1E2024" roughness={0.35} metalness={0.6} />
        </mesh>

        {/* Active Emissive Display Screen */}
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[1.74, 0.79]} />
          <meshStandardMaterial
            color={activeProject ? activeProject.color : '#0F172A'}
            emissive={activeProject ? activeProject.color : '#0284C7'}
            emissiveIntensity={screenHovered ? 0.75 : 0.45}
            roughness={0.2}
          />
        </mesh>

        {/* Screen Overlay Label */}
        <Html position={[0, 0, 0.035]} center distanceFactor={6} pointerEvents="none">
          <div className="flex flex-col items-center justify-center p-2 text-center w-[190px] select-none">
            {activeProject ? (
              <div className="bg-black/85 backdrop-blur-md border border-white/20 p-2.5 rounded-lg shadow-2xl w-full">
                <div className="text-[10px] uppercase font-bold tracking-widest text-sky-400">
                  SYSTEM READY
                </div>
                <div className="text-xs font-black text-white mt-0.5 line-clamp-1">
                  {activeProject.title}
                </div>
                <div className="text-[9px] text-amber-300 font-semibold mt-1">
                  {activeProject.metrics}
                </div>
                <div className="text-[8px] text-slate-300 mt-1 uppercase tracking-wider">
                  Click to open full case study ▶
                </div>
              </div>
            ) : (
              <div className="bg-black/75 backdrop-blur-sm border border-slate-700/60 p-2 rounded-lg text-slate-400">
                <div className="text-[10px] font-mono text-emerald-400">
                  &gt; BETTAYEB_OS v9.2
                </div>
                <div className="text-[9px] text-slate-300 mt-1">
                  Insert a retro cartridge on the shelf to boot project
                </div>
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* =========================================
          4. Slim Keyboard & Mouse
         ========================================= */}
      {/* Keyboard */}
      <group position={[deskX, deskY + 0.05, deskZ + 0.16]}>
        <mesh castShadow>
          <boxGeometry args={[0.66, 0.025, 0.22]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.015, 0]}>
          <boxGeometry args={[0.62, 0.012, 0.18]} />
          <meshStandardMaterial color="#F1F5F9" roughness={0.5} />
        </mesh>
      </group>

      {/* White Wireless Mouse */}
      <group position={[deskX + 0.52, deskY + 0.045, deskZ + 0.16]}>
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[0.28, 0.005, 0.32]} />
          <meshStandardMaterial color="#0F172A" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.09, 0.028, 0.15]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
        </mesh>
      </group>

      {/* =========================================
          5. Green Water Flask
         ========================================= */}
      <group position={[deskX - 0.55, deskY + 0.18, deskZ + 0.14]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.28, 16]} />
          <meshStandardMaterial color="#15803D" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* =========================================
          6. Interactive Desk Lamp (Left Corner)
         ========================================= */}
      <DeskLamp position={[deskX - 0.95, deskY + 0.04, deskZ - 0.18]} />

      {/* =========================================
          7. Eames-Style Eiffel Desk Chair
         ========================================= */}
      <group position={[deskX, 0, deskZ + 0.95]} rotation={[0, Math.PI, 0]}>
        {/* Molded White Scoop Seat */}
        <mesh position={[0, 0.74, 0]} castShadow>
          <boxGeometry args={[0.62, 0.05, 0.55]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
        </mesh>
        {/* Ergonomic Curved Backrest */}
        <mesh position={[0, 1.05, 0.24]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.56, 0.58, 0.045]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.35} />
        </mesh>

        {/* 4 Wooden Dowel Legs (Angled Outward) */}
        {[
          [-0.22, 0.36, -0.2, 0.16, -0.16],
          [0.22, 0.36, -0.2, 0.16, 0.16],
          [-0.22, 0.36, 0.2, -0.16, -0.16],
          [0.22, 0.36, 0.2, -0.16, 0.16],
        ].map(([lx, ly, lz, rx, rz], i) => (
          <mesh key={i} position={[lx, ly, lz]} rotation={[rx, 0, rz]} castShadow>
            <cylinderGeometry args={[0.018, 0.013, 0.74, 10]} />
            <meshStandardMaterial color="#78350F" roughness={0.6} />
          </mesh>
        ))}

        {/* Black Metal Eiffel Wire Cross-Struts */}
        <mesh position={[0, 0.68, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.025, 8]} />
          <meshStandardMaterial color="#1E2024" roughness={0.5} metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
