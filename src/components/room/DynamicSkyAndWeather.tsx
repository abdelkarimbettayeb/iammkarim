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

/** Weather only needs to fill what the camera sees around the house */
const WEATHER_SPAN = 26;
const WEATHER_TOP = 12;
/** Light wind pushes rain and snow towards -x, +z */
const WIND: [number, number] = [-1.2, 0.5];

const RAIN_DROPS = 1400;
const RAIN_SPEED = 9; // m/s, about terminal velocity for a raindrop
const RAIN_STREAK = 0.38; // metres of motion blur per drop
const SPLASHES = 90;
const SPLASH_LIFE = 0.32;

/** Falling streaks (motion-blurred drops) plus little rings where they land */
function Rain() {
  const splashRef = useRef<THREE.InstancedMesh>(null);
  const { geometry, drops } = useMemo(() => {
    const drops = new Float32Array(RAIN_DROPS * 3);
    for (let i = 0; i < RAIN_DROPS; i++) {
      const [x, z] = randomOutsideHouse(WEATHER_SPAN);
      drops[i * 3] = x;
      drops[i * 3 + 1] = Math.random() * WEATHER_TOP;
      drops[i * 3 + 2] = z;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAIN_DROPS * 6), 3));
    return { geometry, drops };
  }, []);
  const splashes = useMemo(() => Array.from({ length: SPLASHES }, () => ({ x: 0, z: 0, age: SPLASH_LIFE })), []);
  const nextSplash = useRef(0);
  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
      p: new THREE.Vector3(),
      s: new THREE.Vector3(),
    }),
    []
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const line = geometry.attributes.position.array as Float32Array;
    const speed = Math.hypot(WIND[0], RAIN_SPEED, WIND[1]);
    const dx = WIND[0] / speed;
    const dy = -RAIN_SPEED / speed;
    const dz = WIND[1] / speed;
    for (let i = 0; i < RAIN_DROPS; i++) {
      const o = i * 3;
      drops[o] += WIND[0] * dt;
      drops[o + 1] -= RAIN_SPEED * dt;
      drops[o + 2] += WIND[1] * dt;
      const landed = drops[o + 1] < 0;
      if (landed || isOverHouse(drops[o], drops[o + 2])) {
        // Splash where it landed (every 4th drop is plenty)
        if (landed && i % 4 === 0) {
          const sp = splashes[nextSplash.current];
          sp.x = drops[o];
          sp.z = drops[o + 2];
          sp.age = 0;
          nextSplash.current = (nextSplash.current + 1) % SPLASHES;
        }
        const [x, z] = randomOutsideHouse(WEATHER_SPAN);
        drops[o] = x;
        drops[o + 1] = WEATHER_TOP + Math.random() * 2;
        drops[o + 2] = z;
      }
      // Streak from the drop back along its path
      const l = i * 6;
      line[l] = drops[o];
      line[l + 1] = drops[o + 1];
      line[l + 2] = drops[o + 2];
      line[l + 3] = drops[o] - dx * RAIN_STREAK;
      line[l + 4] = drops[o + 1] - dy * RAIN_STREAK;
      line[l + 5] = drops[o + 2] - dz * RAIN_STREAK;
    }
    geometry.attributes.position.needsUpdate = true;

    const mesh = splashRef.current;
    if (!mesh) return;
    splashes.forEach((sp, i) => {
      sp.age += dt;
      const k = sp.age / SPLASH_LIFE;
      const r = k < 1 ? 0.02 + k * 0.11 : 0;
      tmp.p.set(sp.x, 0.01, sp.z);
      tmp.s.set(r, r, r);
      mesh.setMatrixAt(i, tmp.m.compose(tmp.p, tmp.q, tmp.s));
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="rain">
      <lineSegments geometry={geometry} frustumCulled={false}>
        <lineBasicMaterial color="#B6CCE0" transparent opacity={0.55} depthWrite={false} />
      </lineSegments>
      <instancedMesh ref={splashRef} args={[undefined, undefined, SPLASHES]} frustumCulled={false}>
        <ringGeometry args={[0.8, 1, 16]} />
        <meshBasicMaterial color="#DCEBFA" transparent opacity={0.45} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

/** Soft round flake sprite */
function createFlakeTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.45, 'rgba(255,255,255,0.85)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Two layers of flakes (fine and fat) */
const FLAKE_LAYERS = [
  { count: 1100, size: 0.09, fall: 0.9 },
  { count: 320, size: 0.17, fall: 1.3 },
];

/** Flakes that flutter on their own little loops while drifting downwind */
function Snow() {
  const texture = useMemo(() => createFlakeTexture(), []);
  const layers = useMemo(
    () =>
      FLAKE_LAYERS.map(({ count, size, fall }) => {
        const positions = new Float32Array(count * 3);
        const phase = new Float32Array(count);
        for (let i = 0; i < count; i++) {
          const [x, z] = randomOutsideHouse(WEATHER_SPAN);
          positions[i * 3] = x;
          positions[i * 3 + 1] = Math.random() * WEATHER_TOP;
          positions[i * 3 + 2] = z;
          phase[i] = Math.random() * Math.PI * 2;
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return { geometry, phase, size, fall };
      }),
    []
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    for (const { geometry, phase, fall } of layers) {
      const p = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < phase.length; i++) {
        const o = i * 3;
        const ph = phase[i];
        p[o] += (WIND[0] * 0.35 + Math.sin(t * 1.3 + ph) * 0.35) * dt;
        p[o + 1] -= fall * (0.8 + 0.4 * Math.sin(ph * 3.1)) * dt;
        p[o + 2] += (WIND[1] * 0.35 + Math.cos(t * 1.1 + ph * 1.7) * 0.3) * dt;
        if (p[o + 1] < 0 || isOverHouse(p[o], p[o + 2])) {
          const [x, z] = randomOutsideHouse(WEATHER_SPAN);
          p[o] = x;
          p[o + 1] = WEATHER_TOP + Math.random();
          p[o + 2] = z;
        }
      }
      geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group name="snow">
      {layers.map(({ geometry, size }, i) => (
        <points key={i} geometry={geometry} frustumCulled={false}>
          <pointsMaterial map={texture} size={size} sizeAttenuation transparent depthWrite={false} opacity={0.95} />
        </points>
      ))}
    </group>
  );
}

/** Snow settles on the lawn while it snows and melts away afterwards */
function SnowCover({ snowing }: { snowing: boolean }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const cover = useRef(0);
  useFrame((_, delta) => {
    cover.current = THREE.MathUtils.clamp(cover.current + (snowing ? delta / 25 : -delta / 12), 0, 1);
    if (matRef.current) {
      matRef.current.opacity = cover.current * 0.85;
      matRef.current.visible = cover.current > 0.001;
    }
  });
  return (
    <mesh position={[0, -0.03, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-1}>
      <circleGeometry args={[30, 48]} />
      <meshStandardMaterial ref={matRef} color="#F1F5F9" roughness={0.9} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export function DynamicSkyAndWeather() {
  const weatherState = useRoomStore((state) => state.weatherState);

  const cloudsRef = useRef<THREE.Group>(null);

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

  useFrame((state) => {
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

      {/* 5. Rain: wind-slanted streaks and splashes on the ground */}
      {weatherState === 'rain' && <Rain />}

      {/* 6. Snow: fluttering flakes, and a white cover that builds up on the lawn */}
      {weatherState === 'snow' && <Snow />}
      <SnowCover snowing={weatherState === 'snow'} />
    </group>
  );
}
