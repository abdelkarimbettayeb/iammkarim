'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { FlagItem } from '@/types/room';

interface WavingFlagProps {
  flag: FlagItem;
  position: [number, number, number];
}

// Generates crisp CanvasTexture for flag cloth
function createFlagTexture(code: string): THREE.Texture {
  if (typeof window === 'undefined') return new THREE.Texture();

  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    if (code === 'dz') {
      // Algeria: Half Green, Half White + Red Crescent & Star
      ctx.fillStyle = '#006233';
      ctx.fillRect(0, 0, 150, 200);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(150, 0, 150, 200);

      // Red Crescent
      ctx.fillStyle = '#D21034';
      ctx.beginPath();
      ctx.arc(150, 100, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(162, 100, 40, 0, Math.PI * 2);
      ctx.fill();

      // Red Star
      ctx.fillStyle = '#D21034';
      ctx.beginPath();
      const cx = 165, cy = 100, spikes = 5, outerRadius = 22, innerRadius = 9;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    } else if (code === 'fr') {
      // France: Blue, White, Red Tricolor
      ctx.fillStyle = '#002654';
      ctx.fillRect(0, 0, 100, 200);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(100, 0, 100, 200);
      ctx.fillStyle = '#ED2939';
      ctx.fillRect(200, 0, 100, 200);
    } else {
      // UK / English: Navy Blue, White, Red Crosses
      ctx.fillStyle = '#012169';
      ctx.fillRect(0, 0, 300, 200);

      // White diagonals
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(300, 200);
      ctx.moveTo(300, 0); ctx.lineTo(0, 200);
      ctx.stroke();

      // Red diagonals
      ctx.strokeStyle = '#C8102E';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(300, 200);
      ctx.moveTo(300, 0); ctx.lineTo(0, 200);
      ctx.stroke();

      // White cross
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(125, 0, 50, 200);
      ctx.fillRect(0, 75, 300, 50);

      // Red cross
      ctx.fillStyle = '#C8102E';
      ctx.fillRect(135, 0, 30, 200);
      ctx.fillRect(0, 85, 300, 30);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function WavingFlag({ flag, position }: WavingFlagProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  const texture = useMemo(() => createFlagTexture(flag.countryCode), [flag.countryCode]);

  // Clone initial vertex positions for harmonic wave formula
  const initialPositions = useMemo(() => {
    const geom = new THREE.PlaneGeometry(0.38, 0.24, 16, 8);
    return geom.attributes.position.clone();
  }, []);

  useFrame(({ clock }) => {
    if (!geomRef.current) return;

    const time = clock.getElapsedTime() * (hovered ? 5.5 : 3.2);
    const positionAttr = geomRef.current.attributes.position;
    const count = positionAttr.count;

    for (let i = 0; i < count; i++) {
      const origX = initialPositions.getX(i);
      const origY = initialPositions.getY(i);

      // Amplitude scales with distance from pole so the pole edge remains attached
      const distFromPole = origX + 0.19; // origX is in [-0.19, +0.19]
      const wave = Math.sin(time + origX * 14) * 0.035 * distFromPole;
      const secondaryWave = Math.cos(time * 0.8 + origY * 10) * 0.015 * distFromPole;

      positionAttr.setZ(i, wave + secondaryWave);
    }

    positionAttr.needsUpdate = true;
    geomRef.current.computeVertexNormals();
  });

  return (
    <group
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 1. Stand Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 16]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 2. Flagpole */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.66, 8]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* 3. Finial Top Ball */}
      <mesh position={[0, 0.69, 0]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* 4. Animated Cloth Flag */}
      <mesh
        ref={meshRef}
        position={[0.19, 0.52, 0]}
        castShadow
      >
        <planeGeometry ref={geomRef} args={[0.38, 0.24, 16, 8]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 5. Floating Hover Tooltip */}
      {hovered && (
        <Html
          position={[0.19, 0.78, 0]}
          center
          distanceFactor={7}
          pointerEvents="none"
        >
          <div className="bg-[#121620]/95 backdrop-blur-md border border-sky-500/40 shadow-xl shadow-black/60 px-3 py-1.5 rounded-lg flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white tracking-wide">{flag.name}</span>
              <span className="text-[10px] text-sky-400 font-semibold">{flag.nativeName}</span>
            </div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 mt-0.5">
              {flag.fluency}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
