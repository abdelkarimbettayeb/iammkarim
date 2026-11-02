'use client';

import React, { useMemo } from 'react';
import { VintageMailbox } from './VintageMailbox';
import { RoadsidePuddleWithDuck } from './RoadsidePuddleWithDuck';
import { TallHighwayLampPost } from './TallHighwayLampPost';
import { PathwayLampPost } from './PathwayLampPost';
import { Volleyball } from './items/Volleyball';
import { Lawn } from './Lawn';
import { CURB_Z, OUTDOOR, PATH_X, ROAD, ROOM } from './layout';

interface OutdoorPathwayProps {
  position?: [number, number, number];
}

const PAVER_COLORS = ['#8B8F96', '#9CA3AF', '#A8A29E', '#94A3B8', '#868B94'];
const PATH_WIDTH = 1.0;

/** Flagstones from the doorstep to the curb, with small per-stone jitter */
const PAVERS = Array.from({ length: 8 }, (_, i) => ({
  x: PATH_X + (((i * 37) % 7) - 3) * 0.008,
  z: ROOM.maxZ + 0.75 + i * 0.5,
  w: 0.9 - (i % 3) * 0.03,
  l: 0.42,
  rot: (((i * 53) % 9) - 4) * 0.008,
  color: PAVER_COLORS[i % PAVER_COLORS.length],
}));

function hash(i: number, salt: number): number {
  const s = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

export function OutdoorPathway({ position = [0, 0, 0] }: OutdoorPathwayProps) {
  // Grass tufts scattered on the lawn, kept clear of the path, puddle, house and road
  const tufts = useMemo(() => {
    const out: { x: number; z: number; scale: number; rot: number }[] = [];
    for (let i = 0; i < 120 && out.length < 46; i++) {
      const x = -9 + hash(i, 1) * 18;
      const z = 0.5 + hash(i, 2) * (CURB_Z - 0.9);
      const insideHouse = x > ROOM.minX - 0.4 && x < ROOM.maxX + 0.5 && z < ROOM.maxZ + 0.7;
      const onPath = Math.abs(x - PATH_X) < PATH_WIDTH / 2 + 0.25;
      const inPuddle = Math.hypot(x - OUTDOOR.puddle.x, z - OUTDOOR.puddle.z) < OUTDOOR.puddle.r + 0.25;
      const nearProp =
        Math.hypot(x - OUTDOOR.mailbox.x, z - OUTDOOR.mailbox.z) < 0.6 ||
        Math.hypot(x - OUTDOOR.bush.x, z - OUTDOOR.bush.z) < 0.6 ||
        Math.hypot(x - OUTDOOR.volleyball.x, z - OUTDOOR.volleyball.z) < 0.5;
      if (insideHouse || onPath || inPuddle || nearProp) continue;
      out.push({ x, z, scale: 0.8 + hash(i, 3) * 0.6, rot: hash(i, 4) * Math.PI });
    }
    return out;
  }, []);

  // River pebbles hugging both sides of the walkway
  const pebbles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return {
          x: PATH_X + side * (PATH_WIDTH / 2 + 0.08 + hash(i, 5) * 0.1),
          z: ROOM.maxZ + 0.6 + (i / 14) * (CURB_Z - ROOM.maxZ - 0.8) + hash(i, 6) * 0.2,
          r: 0.025 + hash(i, 7) * 0.025,
        };
      }),
    []
  );

  return (
    <group name="outdoor-pathway" position={position}>
      {/* 1. Lawn that fades into the horizon haze */}
      <Lawn />

      {/* 2. Road with curb in front of the garden */}
      <group position={[0, 0.01, ROAD.centerZ]} name="main-road">
        <mesh receiveShadow>
          <boxGeometry args={[80, 0.04, ROAD.width]} />
          <meshStandardMaterial color="#334155" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.028, -ROAD.width / 2 - 0.06]} receiveShadow castShadow>
          <boxGeometry args={[80, 0.07, 0.14]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.7} />
        </mesh>
        {/* Dashed centre line */}
        {[-14, -10, -6, -2, 2, 6, 10, 14].map((dashX) => (
          <mesh key={dashX} position={[dashX, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.8, 0.12]} />
            <meshStandardMaterial color="#F8FAFC" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Street lamps beside the road, arms reaching over it */}
      {OUTDOOR.highwayLamps.map((l, i) => (
        <group key={i} position={[l.x, 0.02, l.z]} rotation={[0, l.yaw, 0]} scale={1.3}>
          <TallHighwayLampPost />
        </group>
      ))}

      {/* 3. Irregular puddle with a duck, out on the lawn */}
      <RoadsidePuddleWithDuck position={[OUTDOOR.puddle.x, 0, OUTDOOR.puddle.z]} />

      {/* 4. Doorway weatherstrip */}
      <mesh position={[PATH_X, 0.014, ROOM.maxZ + 0.01]}>
        <boxGeometry args={[1.0, 0.012, 0.03]} />
        <meshStandardMaterial color="#F59E0B" metalness={0.92} roughness={0.15} />
      </mesh>

      {/* 5. Paved walkway (1 m wide) from the doorstep to the curb */}
      <mesh position={[PATH_X, -0.02, (ROOM.maxZ + CURB_Z) / 2 + 0.2]} receiveShadow>
        <boxGeometry args={[PATH_WIDTH + 0.14, 0.04, CURB_Z - ROOM.maxZ - 0.2]} />
        <meshStandardMaterial color="#57534E" roughness={0.94} />
      </mesh>
      {PAVERS.map((p, i) => (
        <mesh key={i} position={[p.x, 0.0, p.z]} rotation={[0, p.rot, 0]} receiveShadow castShadow>
          <boxGeometry args={[p.w, 0.035, p.l]} />
          <meshStandardMaterial color={p.color} roughness={0.8} metalness={0.05} />
        </mesh>
      ))}

      {/* 6. Garden lantern posts flanking the walkway */}
      {OUTDOOR.pathLamps.map((l, i) => (
        <group key={i} position={[l.x, 0, l.z]} scale={0.8}>
          <PathwayLampPost />
        </group>
      ))}

      {/* 7. Grass tufts */}
      {tufts.map((g, i) => (
        <group key={i} position={[g.x, -0.03, g.z]} rotation={[0, g.rot, 0]} scale={g.scale}>
          <mesh position={[-0.03, 0.08, 0]} rotation={[0, 0, 0.22]} castShadow>
            <coneGeometry args={[0.02, 0.16, 4]} />
            <meshStandardMaterial color="#4ADE80" roughness={0.7} />
          </mesh>
          <mesh position={[0.03, 0.09, 0]} rotation={[0, 0, -0.24]} castShadow>
            <coneGeometry args={[0.022, 0.18, 4]} />
            <meshStandardMaterial color="#22C55E" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0.02]} rotation={[0.2, 0, 0]} castShadow>
            <coneGeometry args={[0.018, 0.2, 4]} />
            <meshStandardMaterial color="#16A34A" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Pebbles along the walkway border */}
      {pebbles.map((p, i) => (
        <mesh key={i} position={[p.x, -0.01, p.z]} scale={[1, 0.65, 1]} castShadow receiveShadow>
          <sphereGeometry args={[p.r, 8, 6]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.65} />
        </mesh>
      ))}

      {/* 8. Shrub with blossoms in the left corner */}
      <group position={[OUTDOOR.bush.x, -0.03, OUTDOOR.bush.z]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <dodecahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial color="#15803D" roughness={0.8} />
        </mesh>
        <mesh position={[0.2, 0.15, 0.15]} castShadow>
          <dodecahedronGeometry args={[0.2, 1]} />
          <meshStandardMaterial color="#16A34A" roughness={0.8} />
        </mesh>
        <mesh position={[0.06, 0.4, 0.08]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[-0.15, 0.3, 0.12]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#FEF08A" roughness={0.4} />
        </mesh>
      </group>

      {/* 9. Volleyball (regulation size) on the lawn */}
      <Volleyball position={[OUTDOOR.volleyball.x, 0, OUTDOOR.volleyball.z]} />

      {/* 10. Vintage mailbox beside the walkway */}
      <VintageMailbox
        position={[OUTDOOR.mailbox.x, 0, OUTDOOR.mailbox.z]}
        rotation={[0, OUTDOOR.mailbox.yaw, 0]}
      />
    </group>
  );
}
