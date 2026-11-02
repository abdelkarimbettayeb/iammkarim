'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

// Slab outline (see RoomStructure): the ledge around the open sides of the house
const SLAB = { minX: -2.65, maxX: 2.8, minZ: -2.35, maxZ: 2.75 };

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
    </group>
  );
}
