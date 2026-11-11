'use client';

import React, { useMemo } from 'react';
import { VintageMailbox } from './VintageMailbox';
import { RoadsidePuddleWithDuck } from './RoadsidePuddleWithDuck';
import { TallHighwayLampPost } from './TallHighwayLampPost';
import { PathwayLampPost } from './PathwayLampPost';
import { Volleyball } from './items/Volleyball';
import { Lawn } from './Lawn';
import { Critters } from './Critters';
import { CURB_Z, OUTDOOR, PATH_X, ROAD, ROOM } from './layout';

interface OutdoorPathwayProps {
  position?: [number, number, number];
}

const PAVER_COLORS = ['#8B8F96', '#9CA3AF', '#A8A29E', '#94A3B8', '#868B94'];
const PATH_WIDTH = 1.0;
/** Front edge of the entrance step (see RoomStructure) */
const WALK_START = ROOM.maxZ + 0.59;

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

      {/* Flowers, butterflies by day, fireflies at night */}
      <Critters />

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

      {/* 5. Paved walkway (1 m wide) from the front of the entrance step to the curb.
          Starts where the step ends so the two top faces never overlap (z-fighting). */}
      <mesh position={[PATH_X, -0.024, (WALK_START + CURB_Z) / 2]} receiveShadow>
        <boxGeometry args={[PATH_WIDTH + 0.14, 0.04, CURB_Z - WALK_START]} />
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
        scale={0.62}
      />
    </group>
  );
}
