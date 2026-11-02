'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { playSound, playVolleyballBounceSound } from '@/lib/audioEngine';
import { useRoomStore } from '@/store/useRoomStore';

interface VolleyballProps {
  position?: [number, number, number];
  scale?: number;
  onBounce?: () => void;
}

/**
 * Procedural texture for authentic 18-panel tournament volleyball
 * (Mikasa / AVP classic blue, yellow, and white curved panels with stitching)
 */
function createVolleyballTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Crisp white base coat
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Leather pebble noise
    const imgData = ctx.getImageData(0, 0, 1024, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Iconic curved panel stripes (V200W royal blue and vibrant gold)
    const blue = '#1D4ED8';
    const gold = '#F59E0B';

    // Panel sections along equirectangular coordinates
    const drawSwirl = (startX: number, color: string, flip: boolean) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      const offset = flip ? -60 : 60;
      ctx.moveTo(startX, 60);
      ctx.bezierCurveTo(startX + offset, 160, startX - offset, 340, startX, 450);
      ctx.lineTo(startX + 120, 450);
      ctx.bezierCurveTo(startX + 120 - offset, 340, startX + 120 + offset, 160, startX + 120, 60);
      ctx.closePath();
      ctx.fill();
    };

    drawSwirl(100, blue, false);
    drawSwirl(240, gold, true);
    drawSwirl(440, blue, true);
    drawSwirl(580, gold, false);
    drawSwirl(780, blue, false);
    drawSwirl(920, gold, true);

    // 4. Seam lines and stitching
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Horizontal equator seam
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(1024, 256);
    ctx.stroke();

    // Meridian seams
    for (let x = 0; x <= 1024; x += 170) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + 35, 170, x - 35, 340, x, 512);
      ctx.stroke();
    }

    // 5. Black air inflation valve dot
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(512, 128, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Gold tournament stamp "VOLLEYBALL PRO"
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PRO TOUCH', 512, 285);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('OFFICIAL SIZE & WEIGHT', 512, 305);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural radial gradient texture for the dynamic floor contact shadow
 */
function createShadowTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.CanvasTexture({} as any);

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(15, 23, 42, 0.75)');
    gradient.addColorStop(0.45, 'rgba(15, 23, 42, 0.40)');
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function Volleyball({
  position = [0, 0, 0],
  scale = 1,
  onBounce,
}: VolleyballProps) {
  const ballRadius = 0.105; // regulation volleyball (Ø21 cm)
  const floorY = position[1]; // baseline floor height
  const homeX = position[0];
  const homeZ = position[2];

  // Visual texture
  const ballTexture = useMemo(() => createVolleyballTexture(), []);
  const shadowTexture = useMemo(() => createShadowTexture(), []);

  // 3D Scene Refs
  const groupRef = useRef<THREE.Group>(null);
  const ballMeshRef = useRef<THREE.Mesh>(null);
  const shadowMeshRef = useRef<THREE.Mesh>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  // Physics Simulation State
  const pos = useRef(new THREE.Vector3(homeX, floorY + ballRadius, homeZ));
  const vel = useRef(new THREE.Vector3(0, 0, 0));
  const angVel = useRef(new THREE.Vector3(0, 0, 0));
  const ballRot = useRef(new THREE.Euler(0.3, 0.4, 0.2));
  const squashScale = useRef(new THREE.Vector3(1, 1, 1));
  const isSimulating = useRef(false);

  // Hover state
  const isHovered = useRef(false);
  const activeStation = useRoomStore((state) => state.activeStation);
  const setActiveStation = useRoomStore((state) => state.setActiveStation);

  useEffect(() => {
    if (activeStation === 'volleyball') {
      const timer = setTimeout(() => {
        triggerHitImpulse();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeStation]);

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
    };
  }, []);

  // Physics impulse trigger when clicked directly or clicked near
  const triggerHitImpulse = (clickPoint?: THREE.Vector3) => {
    playSound('volleyball');
    if (onBounce) onBounce();

    // Calculate hit vector
    let pushX = (Math.random() - 0.5) * 0.4;
    let pushZ = (Math.random() - 0.5) * 0.4;

    if (clickPoint) {
      // Push ball away from click point for natural deflection
      const dx = pos.current.x - clickPoint.x;
      const dz = pos.current.z - clickPoint.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.01) {
        pushX += (dx / dist) * 0.7;
        pushZ += (dz / dist) * 0.7;
      }
    }

    // High vertical bounce impulse (reaches ~0.95m - 1.15m height)
    vel.current.set(pushX, 4.2 + Math.random() * 0.5, pushZ);

    // Energetic spin (topspin / side-spin)
    angVel.current.set(
      (pushZ / ballRadius) * 2.2 + (Math.random() - 0.5) * 8.0,
      (Math.random() - 0.5) * 10.0,
      -(pushX / ballRadius) * 2.2 + (Math.random() - 0.5) * 8.0
    );

    // Initial upward stretch deformation
    squashScale.current.set(0.92, 1.14, 0.92);
    isSimulating.current = true;
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveStation('volleyball');
    triggerHitImpulse(e.point);
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.035);

    if (isSimulating.current) {
      const g = 15.2; // Realistic gravity in room scale
      const restitution = 0.74; // High elasticity for pressurized volleyball

      // 1. Vertical acceleration & velocity
      vel.current.y -= g * dt;

      // 2. Air resistance
      vel.current.x *= Math.max(0, 1.0 - 0.3 * dt);
      vel.current.z *= Math.max(0, 1.0 - 0.3 * dt);

      // 3. Integrate position
      pos.current.x += vel.current.x * dt;
      pos.current.y += vel.current.y * dt;
      pos.current.z += vel.current.z * dt;

      // 4. Soft boundary spring pull back towards home area
      // Prevents clipping into bookcase (x < homeX - 0.3) or back wall (z < homeZ - 0.3)
      const distFromHome = Math.hypot(pos.current.x - homeX, pos.current.z - homeZ);
      if (distFromHome > 0.35) {
        vel.current.x += (homeX - pos.current.x) * 2.5 * dt;
        vel.current.z += (homeZ - pos.current.z) * 2.5 * dt;
      }

      // 5. Integrate 3D ball rotation
      ballRot.current.x += angVel.current.x * dt;
      ballRot.current.y += angVel.current.y * dt;
      ballRot.current.z += angVel.current.z * dt;

      // Air spin damping
      angVel.current.multiplyScalar(Math.max(0, 1.0 - 0.5 * dt));

      // 6. Ground Floor Collision (Y = floorY + ballRadius)
      const groundY = floorY + ballRadius;
      if (pos.current.y <= groundY) {
        pos.current.y = groundY;

        // Ground impact velocity
        const impactSpeed = Math.abs(vel.current.y);

        if (impactSpeed > 0.35) {
          // Play floor bounce thud sound with intensity scaled to impact velocity
          playVolleyballBounceSound(Math.min(impactSpeed / 3.5, 1.0));

          // Squash deformation on floor impact (compress Y, expand X and Z)
          const squashAmt = Math.min(impactSpeed * 0.055, 0.22);
          squashScale.current.set(1.0 + squashAmt * 0.6, 1.0 - squashAmt, 1.0 + squashAmt * 0.6);
        }

        // Rebound with elasticity
        vel.current.y = impactSpeed * restitution;

        // Ground rolling friction
        vel.current.x *= 0.86;
        vel.current.z *= 0.86;

        // Couple rotation with ground rolling
        angVel.current.x = (-vel.current.z / ballRadius) * 1.2;
        angVel.current.z = (vel.current.x / ballRadius) * 1.2;

        // Rest / Settling condition
        if (impactSpeed < 0.18 && Math.hypot(vel.current.x, vel.current.z) < 0.05) {
          vel.current.set(0, 0, 0);
          pos.current.y = groundY;
          angVel.current.multiplyScalar(0.7);

          if (angVel.current.length() < 0.04) {
            isSimulating.current = false;
          }
        }
      }

      // 7. Elastic spring recovery of ball shape
      squashScale.current.lerp(new THREE.Vector3(1, 1, 1), dt * 14);

      // 8. Update Three.js transforms
      if (ballMeshRef.current) {
        ballMeshRef.current.position.copy(pos.current);
        ballMeshRef.current.rotation.copy(ballRot.current);
        ballMeshRef.current.scale.copy(squashScale.current);
      }

      // 9. Update Dynamic Contact Shadow
      if (shadowMeshRef.current && shadowMatRef.current) {
        const heightAboveGround = Math.max(0, pos.current.y - groundY);
        shadowMeshRef.current.position.set(pos.current.x, floorY + 0.005, pos.current.z);

        // Shadow expands and fades as ball ascends
        const shadowScale = 1.0 + heightAboveGround * 1.2;
        shadowMeshRef.current.scale.set(shadowScale, shadowScale, shadowScale);

        const shadowOpacity = Math.max(0.08, 0.65 - heightAboveGround * 0.6);
        shadowMatRef.current.opacity = shadowOpacity;
      }
    } else {
      // Idle breathing / resting state
      if (ballMeshRef.current) {
        ballMeshRef.current.position.set(pos.current.x, floorY + ballRadius, pos.current.z);
        ballMeshRef.current.rotation.copy(ballRot.current);
        ballMeshRef.current.scale.set(1, 1, 1);
      }
      if (shadowMeshRef.current && shadowMatRef.current) {
        shadowMeshRef.current.position.set(pos.current.x, floorY + 0.005, pos.current.z);
        shadowMeshRef.current.scale.set(1, 1, 1);
        shadowMatRef.current.opacity = 0.62;
      }
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* 1. Dynamic Contact Shadow on Floor */}
      <mesh
        ref={shadowMeshRef}
        position={[homeX, floorY + 0.005, homeZ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ballRadius * 2.6, ballRadius * 2.6]} />
        <meshBasicMaterial
          ref={shadowMatRef}
          map={shadowTexture}
          transparent
          opacity={0.62}
          depthWrite={false}
        />
      </mesh>

      {/* 2. 3D Textured Volleyball Mesh */}
      <mesh
        ref={ballMeshRef}
        position={[homeX, floorY + ballRadius, homeZ]}
        castShadow
        receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          isHovered.current = true;
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          isHovered.current = false;
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[ballRadius, 32, 32]} />
        <meshStandardMaterial
          map={ballTexture}
          roughness={0.52}
          metalness={0.06}
        />
      </mesh>

      {/* 3. Generous Proximity Hit Bubble ("when clicked near") */}
      <mesh
        position={[homeX, floorY + ballRadius + 0.05, homeZ]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          if (typeof document !== 'undefined') document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 4. Floor Proximity Click Circle */}
      <mesh
        position={[homeX, floorY + 0.008, homeZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
      >
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
