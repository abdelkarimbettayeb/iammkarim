'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import { useRoomStore } from '@/store/useRoomStore';

export function DynamicSkyAndWeather() {
  const isNightMode = useRoomStore((state) => state.isNightMode);
  const weatherState = useRoomStore((state) => state.weatherState);

  const cloudsRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);

  // Generate 200 rain streak particles
  const rainGeo = useMemo(() => {
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // Generate 180 snow flake particles
  const snowGeo = useMemo(() => {
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 36;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Gentle cloud drift across horizon
    if (cloudsRef.current) {
      cloudsRef.current.position.x = Math.sin(t * 0.04) * 3.5;
    }

    // 2. Animate falling rain streaks
    if (rainRef.current && weatherState === 'rain') {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * 24; // Fast rain velocity
        if (positions[i + 1] < 0) {
          positions[i + 1] = 16 + Math.random() * 2;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate tumbling snow flakes
    if (snowRef.current && weatherState === 'snow') {
      const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * 3.2; // Gentle drifting snow
        positions[i] += Math.sin(t * 2 + i) * 0.015; // Flutter drift
        if (positions[i + 1] < 0) {
          positions[i + 1] = 15 + Math.random() * 2;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="dynamic-sky-and-weather">
      {/* =========================================
          1. Expansive Realistic Sky Dome
         ========================================= */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[44, 32, 24]} />
        <meshBasicMaterial
          side={THREE.BackSide}
          color={isNightMode ? '#030712' : '#7DD3FC'}
        />
      </mesh>

      {/* Horizon Soft Haze Band */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[43.5, 43.5, 12, 32, 1, true]} />
        <meshBasicMaterial
          side={THREE.BackSide}
          color={isNightMode ? '#0F172A' : '#E0F2FE'}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* =========================================
          2. Celestial Sun / Moon
         ========================================= */}
      {!isNightMode ? (
        /* Golden Low-Poly Sun with Halo */
        <group position={[16, 24, -18]}>
          <mesh>
            <dodecahedronGeometry args={[2.4, 1]} />
            <meshBasicMaterial color="#FDE047" />
          </mesh>
          <mesh>
            <dodecahedronGeometry args={[3.2, 1]} />
            <meshBasicMaterial color="#FEF08A" transparent opacity={0.35} />
          </mesh>
        </group>
      ) : (
        /* Glowing Stylized Moon */
        <group position={[14, 22, -18]}>
          <mesh>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshBasicMaterial color="#F8FAFC" />
          </mesh>
          <mesh>
            <sphereGeometry args={[2.4, 16, 16]} />
            <meshBasicMaterial color="#94A3B8" transparent opacity={0.25} />
          </mesh>
        </group>
      )}

      {/* =========================================
          3. Starfield in Night Mode
         ========================================= */}
      {isNightMode && (
        <Sparkles
          count={120}
          scale={[40, 24, 40]}
          size={3.5}
          speed={0.4}
          opacity={0.8}
          color="#BAE6FD"
        />
      )}

      {/* =========================================
          4. Drifting Low-Poly Puffy Clouds (Day Mode)
         ========================================= */}
      {!isNightMode && (
        <group ref={cloudsRef} position={[0, 15, -12]}>
          {[
            [-12, 0, -4, 1.2],
            [-2, 2.5, -6, 1.0],
            [10, 1.2, -5, 1.4],
            [18, -1.0, -8, 0.9],
          ].map(([cx, cy, cz, cs], idx) => (
            <group key={idx} position={[cx, cy, cz]} scale={cs}>
              <mesh position={[0, 0, 0]}>
                <dodecahedronGeometry args={[1.5, 1]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
              <mesh position={[1.2, -0.2, 0.2]}>
                <dodecahedronGeometry args={[1.1, 1]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
              <mesh position={[-1.1, -0.3, -0.1]}>
                <dodecahedronGeometry args={[1.0, 1]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* =========================================
          5. Dynamic Rain Streaks System
         ========================================= */}
      {weatherState === 'rain' && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial
            size={0.12}
            color="#93C5FD"
            transparent
            opacity={0.65}
          />
        </points>
      )}

      {/* =========================================
          6. Dynamic Falling Snow Particles
         ========================================= */}
      {weatherState === 'snow' && (
        <points ref={snowRef} geometry={snowGeo}>
          <pointsMaterial
            size={0.18}
            color="#FFFFFF"
            transparent
            opacity={0.85}
          />
        </points>
      )}
    </group>
  );
}
