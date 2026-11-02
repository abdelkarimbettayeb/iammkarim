'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { OBSTACLES } from './layout';
import { EDGES, NODES, WALKER_RADIUS } from './walkmap';

/**
 * Debug overlay for tuning the walk map. Enable with `?debug=walkmap`.
 * Draws lanes (green), nodes (yellow) and keep-out zones (red, already inflated
 * by the walker's radius) on top of the scene.
 */
export function WalkMapDebug() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setEnabled(new URLSearchParams(window.location.search).get('debug') === 'walkmap');
  }, []);

  const laneGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of EDGES) {
      pts.push(NODES[a][0], 0.06, NODES[a][1], NODES[b][0], 0.06, NODES[b][1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  if (!enabled) return null;

  return (
    <group name="walkmap-debug" renderOrder={999}>
      <lineSegments geometry={laneGeometry}>
        <lineBasicMaterial color="#22C55E" depthTest={false} />
      </lineSegments>

      {Object.values(NODES).map((p, i) => (
        <mesh key={i} position={[p[0], 0.07, p[1]]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#FACC15" depthTest={false} />
        </mesh>
      ))}

      {OBSTACLES.map((o) =>
        o.shape === 'circle' ? (
          <mesh key={o.id} position={[o.x, 0.05, o.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[o.r + WALKER_RADIUS - 0.01, o.r + WALKER_RADIUS, 40]} />
            <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} depthTest={false} />
          </mesh>
        ) : (
          <mesh key={o.id} position={[o.x, 0.05, o.z]} rotation={[-Math.PI / 2, 0, o.yaw]}>
            <planeGeometry args={[o.w + WALKER_RADIUS * 2, o.d + WALKER_RADIUS * 2]} />
            <meshBasicMaterial color="#EF4444" transparent opacity={0.25} side={THREE.DoubleSide} depthTest={false} />
          </mesh>
        )
      )}
    </group>
  );
}
