'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CURB_Z, OUTDOOR, PATH_X } from './layout';

// Slab outline (see RoomStructure): the ledge around the open sides of the house
const SLAB = { minX: -2.65, maxX: 2.8, minZ: -2.35, maxZ: 2.75 };

const CLUMPS = 18000;
const BLADES_PER_CLUMP = 3;

/** A clump of three tapered, slightly curved blades; y runs 0 (root) .. 1 (tip) */
function createClumpGeometry(): THREE.BufferGeometry {
  const SEG = 3;
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  // Brightness gradient only; the per-clump instance colour carries the hue
  const root = new THREE.Color(0.55, 0.6, 0.5);
  const tip = new THREE.Color(1, 1, 0.9);
  const c = new THREE.Color();
  for (let b = 0; b < BLADES_PER_CLUMP; b++) {
    const yaw = (b / BLADES_PER_CLUMP) * Math.PI * 2 + b * 0.4;
    const lean = 0.18 + b * 0.08;
    const ox = Math.cos(yaw) * 0.012;
    const oz = Math.sin(yaw) * 0.012;
    const base = positions.length / 3;
    for (let i = 0; i <= SEG; i++) {
      const y = i / SEG;
      const half = 0.5 * (1 - y * 0.92);
      // Curves outwards as it rises
      const bend = lean * y * y;
      for (const side of [-1, 1]) {
        const px = side * half;
        positions.push(
          ox + Math.cos(yaw + Math.PI / 2) * px * 0.014 + Math.cos(yaw) * bend * 0.3,
          y,
          oz + Math.sin(yaw + Math.PI / 2) * px * 0.014 + Math.sin(yaw) * bend * 0.3
        );
        c.copy(root).lerp(tip, Math.pow(y, 0.8));
        colors.push(c.r, c.g, c.b);
      }
      if (i < SEG) {
        const a = base + i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Keep grass off the house slab, the walkway, the pond, the props and the road */
function grassAllowed(x: number, z: number): boolean {
  if (distToSlab(x, z) < 0.08) return false;
  if (z > CURB_Z - 0.12) return false;
  if (Math.abs(x - PATH_X) < 0.62 && z > SLAB.maxZ - 0.2) return false;
  if (Math.hypot((x - OUTDOOR.puddle.x) / 1.15, (z - OUTDOOR.puddle.z) / 0.85) < 1) return false;
  if (Math.hypot(x - OUTDOOR.mailbox.x, z - OUTDOOR.mailbox.z) < 0.25) return false;
  if (Math.hypot(x - OUTDOOR.bush.x, z - OUTDOOR.bush.z) < 0.3) return false;
  return true;
}

/**
 * Dense instanced grass around the house: thousands of blade clumps with
 * colour variation, denser near the house and thinning out with distance,
 * swaying in a slow wind (vertex shader, so it costs nothing on the CPU).
 */
function GrassField() {
  const { mesh, material } = useMemo(() => {
    const geometry = createClumpGeometry();
    const material = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const uniforms = { uTime: { value: 0 } };
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTime;')
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vec4 rootW = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          float gust = sin(uTime * 1.6 + rootW.x * 0.45 + rootW.z * 0.3) * 0.6 + sin(uTime * 3.3 + rootW.x * 1.7) * 0.25;
          float k = transformed.y * transformed.y;
          transformed.x += gust * 0.12 * k;
          transformed.z += gust * 0.06 * k;`
        );
    };
    material.userData.uniforms = uniforms;

    const mesh = new THREE.InstancedMesh(geometry, material, CLUMPS);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const col = new THREE.Color();
    let n = 0;
    let seed = 0;
    while (n < CLUMPS && seed < CLUMPS * 6) {
      seed++;
      // Denser near the house: radius biased towards the centre
      const r = 1.5 + Math.pow(hash(seed, 1.3), 1.6) * 13;
      const a = hash(seed, 7.7) * Math.PI * 2;
      const x = Math.cos(a) * r * 1.2;
      const z = 1.5 + Math.sin(a) * r;
      if (!grassAllowed(x, z)) continue;
      // Short mown lawn: 3-8 cm blades, a bit longer in the shaggier patches
      const height = 0.03 + hash(seed, 3.1) * 0.035 + fbm(x * 0.8, z * 0.8) * 0.02;
      const width = 0.7 + hash(seed, 5.3) * 0.7;
      p.set(x, -0.05, z);
      e.set((hash(seed, 2.2) - 0.5) * 0.25, hash(seed, 4.4) * Math.PI * 2, (hash(seed, 6.6) - 0.5) * 0.25);
      q.setFromEuler(e);
      s.set(width, height, width);
      mesh.setMatrixAt(n, m.compose(p, q, s));
      // Patchy colour: lush and dry patches plus per-clump jitter
      const patch = fbm(x * 0.5 + 3, z * 0.5);
      col.setHSL(0.27 + (patch - 0.5) * 0.05 + (hash(seed, 8.8) - 0.5) * 0.02, 0.55, 0.44 + (hash(seed, 9.9) - 0.5) * 0.08);
      mesh.setColorAt(n, col);
      n++;
    }
    mesh.count = n;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    return { mesh, material };
  }, []);

  useFrame((state) => {
    material.userData.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return <primitive object={mesh} />;
}

const GRASS_A = new THREE.Color('#3E8E3B');
const GRASS_B = new THREE.Color('#4FA346');
const GRASS_C = new THREE.Color('#2F7A33');
const GRAVEL = new THREE.Color('#A8A29E');
const SOIL = new THREE.Color('#7A6A58');

function hash(x: number, z: number): number {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, z: number): number {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, z: number): number {
  return valueNoise(x, z) * 0.55 + valueNoise(x * 2.3, z * 2.3) * 0.3 + valueNoise(x * 5.1, z * 5.1) * 0.15;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Distance from a point to the slab rectangle (0 inside) */
function distToSlab(x: number, z: number): number {
  const dx = Math.max(SLAB.minX - x, 0, x - SLAB.maxX);
  const dz = Math.max(SLAB.minZ - z, 0, z - SLAB.maxZ);
  return Math.hypot(dx, dz);
}

/**
 * Large lawn made of one subdivided plane. Vertex colours give mowed patches,
 * a gravel/soil margin where the house slab meets the grass, and an alpha fade
 * towards the edge so the grass dissolves into the sky haze instead of ending
 * in a hard square.
 */
export function Lawn() {
  const geometry = useMemo(() => {
    const size = 90;
    const segs = 150;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 4);
    const c = new THREE.Color();
    const centerZ = 2;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Gentle undulation; flat around the house so nothing floats
      const near = 1 - smoothstep(4, 9, distToSlab(x, z));
      const bump = (fbm(x * 0.35, z * 0.35) - 0.5) * 0.08 * (1 - near);
      pos.setY(i, -0.05 + bump);

      // Mowing stripes + soft patches
      const patch = fbm(x * 0.6 + 10, z * 0.6 - 4);
      const stripe = 0.5 + 0.5 * Math.sin(z * 2.2 + fbm(x * 0.3, z * 0.3) * 4);
      c.copy(GRASS_A).lerp(GRASS_B, patch).lerp(GRASS_C, stripe * 0.25);

      // Gravel margin around the slab, fading into soil then lawn
      const d = distToSlab(x, z);
      const gravel = 1 - smoothstep(0.12, 0.55, d);
      const soil = (1 - smoothstep(0.35, 1.1, d)) * 0.7;
      c.lerp(SOIL, soil).lerp(GRAVEL, gravel);

      // Fade out towards the horizon
      const r = Math.hypot(x, z - centerZ);
      const alpha = 1 - smoothstep(22, 40, r);

      colors[i * 4] = c.r;
      colors[i * 4 + 1] = c.g;
      colors[i * 4 + 2] = c.b;
      colors[i * 4 + 3] = alpha;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group name="lawn">
      <mesh geometry={geometry} receiveShadow renderOrder={-2}>
        <meshStandardMaterial vertexColors transparent roughness={0.95} metalness={0} />
      </mesh>
      <GrassField />
    </group>
  );
}
