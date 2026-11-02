'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useRoomStore } from '@/store/useRoomStore';
import { dayNight, lerp } from '@/store/dayNight';

const SKY_DAY = new THREE.Color('#7DD3FC');
const SKY_NIGHT = new THREE.Color('#030712');
const HAZE_DAY = new THREE.Color('#E0F2FE');
const HAZE_NIGHT = new THREE.Color('#0F172A');
const CLOUD_DAY = new THREE.Color('#FFFFFF');
const CLOUD_NIGHT = new THREE.Color('#334155');

/** Footprint of the house (plus margin); no rain or snow falls through the open roof */
const HOUSE = { minX: -2.9, maxX: 3.1, minZ: -2.6, maxZ: 3.0 };
const isOverHouse = (x: number, z: number) =>
  x > HOUSE.minX && x < HOUSE.maxX && z > HOUSE.minZ && z < HOUSE.maxZ;

/** Random x/z across the weather area, never over the house */
function randomOutsideHouse(span: number): [number, number] {
  for (let tries = 0; tries < 20; tries++) {
    const x = (Math.random() - 0.5) * span;
    const z = (Math.random() - 0.5) * span;
    if (!isOverHouse(x, z)) return [x, z];
  }
  return [span / 2, span / 2];
}

function makeParticleGeometry(count: number, height: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, z] = randomOutsideHouse(36);
    positions[i * 3] = x;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function DynamicSkyAndWeather() {
  const weatherState = useRoomStore((state) => state.weatherState);

  const cloudsRef = useRef<THREE.Group>(null);
  const rainRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);

  const skyMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const hazeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const starsRef = useRef<THREE.Points>(null);
  const starMatRef = useRef<THREE.PointsMaterial>(null);

  // One material shared by every cloud puff so they fade together
  const cloudMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4, transparent: true }),
    []
  );

  const rainGeo = useMemo(() => makeParticleGeometry(220, 18), []);
  const snowGeo = useMemo(() => makeParticleGeometry(180, 16), []);

  // Stars scattered over the upper hemisphere of the sky dome
  const starGeo = useMemo(() => {
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.15 + Math.random() * 0.85); // keep above the horizon
      const r = 40;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const n = dayNight.blend;

    // --- Day / night crossfade (all driven by one shared blend value) ---
    if (skyMatRef.current) skyMatRef.current.color.copy(SKY_DAY).lerp(SKY_NIGHT, n);
    if (hazeMatRef.current) hazeMatRef.current.color.copy(HAZE_DAY).lerp(HAZE_NIGHT, n);
    if (sunRef.current) {
      // Sun sinks below the horizon while the moon climbs up
      sunRef.current.position.set(16, lerp(24, -14, n), -18);
      sunRef.current.visible = n < 0.98;
    }
    if (moonRef.current) {
      moonRef.current.position.set(14, lerp(-14, 22, n), -18);
      moonRef.current.visible = n > 0.02;
    }
    if (starsRef.current && starMatRef.current) {
      starMatRef.current.opacity = Math.max(0, (n - 0.35) / 0.65) * 0.9;
      starsRef.current.visible = n > 0.36;
    }
    cloudMaterial.color.copy(CLOUD_DAY).lerp(CLOUD_NIGHT, n);
    cloudMaterial.opacity = 1 - n * 0.85;

    // --- Cloud drift ---
    if (cloudsRef.current) cloudsRef.current.position.x = Math.sin(t * 0.04) * 3.5;

    // --- Rain ---
    if (rainRef.current && weatherState === 'rain') {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * 24;
        if (positions[i + 1] < 0) {
          const [x, z] = randomOutsideHouse(36);
          positions[i] = x;
          positions[i + 1] = 16 + Math.random() * 2;
          positions[i + 2] = z;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // --- Snow ---
    if (snowRef.current && weatherState === 'snow') {
      const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] -= delta * 3.2;
        positions[i] += Math.sin(t * 2 + i) * 0.015;
        if (positions[i + 1] < 0 || isOverHouse(positions[i], positions[i + 2])) {
          const [x, z] = randomOutsideHouse(36);
          positions[i] = x;
          positions[i + 1] = 15 + Math.random() * 2;
          positions[i + 2] = z;
        }
      }
      snowRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="dynamic-sky-and-weather">
      {/* 1. Sky dome */}
      <mesh>
        <sphereGeometry args={[44, 32, 24]} />
        <meshBasicMaterial ref={skyMatRef} side={THREE.BackSide} color="#7DD3FC" fog={false} />
      </mesh>

      {/* Horizon haze band */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[43.5, 43.5, 12, 32, 1, true]} />
        <meshBasicMaterial
          ref={hazeMatRef}
          side={THREE.BackSide}
          color="#E0F2FE"
          transparent
          opacity={0.65}
          fog={false}
        />
      </mesh>

      {/* 2. Sun (golden low-poly) */}
      <group ref={sunRef} position={[16, 24, -18]}>
        <mesh>
          <dodecahedronGeometry args={[2.4, 1]} />
          <meshBasicMaterial color="#FDE047" />
        </mesh>
        <mesh>
          <dodecahedronGeometry args={[3.2, 1]} />
          <meshBasicMaterial color="#FEF08A" transparent opacity={0.35} />
        </mesh>
      </group>

      {/* Moon */}
      <group ref={moonRef} position={[14, -14, -18]} visible={false}>
        <mesh>
          <sphereGeometry args={[1.8, 16, 16]} />
          <meshBasicMaterial color="#F8FAFC" />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.4, 16, 16]} />
          <meshBasicMaterial color="#94A3B8" transparent opacity={0.25} />
        </mesh>
      </group>

      {/* 3. Stars fade in as night falls */}
      <points ref={starsRef} geometry={starGeo} visible={false}>
        <pointsMaterial
          ref={starMatRef}
          size={0.35}
          color="#BAE6FD"
          transparent
          opacity={0}
          depthWrite={false}
          sizeAttenuation
          fog={false}
        />
      </points>

      {/* 4. Drifting low-poly clouds (fade to dim silhouettes at night) */}
      <group ref={cloudsRef} position={[0, 15, -12]}>
        {[
          [-12, 0, -4, 1.2],
          [-2, 2.5, -6, 1.0],
          [10, 1.2, -5, 1.4],
          [18, -1.0, -8, 0.9],
        ].map(([cx, cy, cz, cs], idx) => (
          <group key={idx} position={[cx, cy, cz]} scale={cs}>
            <mesh material={cloudMaterial}>
              <dodecahedronGeometry args={[1.5, 1]} />
            </mesh>
            <mesh position={[1.2, -0.2, 0.2]} material={cloudMaterial}>
              <dodecahedronGeometry args={[1.1, 1]} />
            </mesh>
            <mesh position={[-1.1, -0.3, -0.1]} material={cloudMaterial}>
              <dodecahedronGeometry args={[1.0, 1]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 5. Rain */}
      {weatherState === 'rain' && (
        <points ref={rainRef} geometry={rainGeo}>
          <pointsMaterial size={0.12} color="#93C5FD" transparent opacity={0.65} />
        </points>
      )}

      {/* 6. Snow */}
      {weatherState === 'snow' && (
        <points ref={snowRef} geometry={snowGeo}>
          <pointsMaterial size={0.18} color="#FFFFFF" transparent opacity={0.85} />
        </points>
      )}
    </group>
  );
}
