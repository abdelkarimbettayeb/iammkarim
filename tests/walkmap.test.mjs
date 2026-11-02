import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OBSTACLES,
  PLACEMENTS,
  ROOM,
  obstaclesOverlap,
} from '../src/components/room/layout.ts';
import {
  NODES,
  EDGES,
  STOPS,
  WALKER_RADIUS,
  segmentClear,
  nodeRoute,
  planPath,
} from '../src/components/room/walkmap.ts';
import { segmentHitsObstacle } from '../src/components/room/layout.ts';

test('every lane stays clear of all inflated obstacles', () => {
  for (const [a, b] of EDGES) {
    for (const o of OBSTACLES) {
      assert.ok(
        !segmentHitsObstacle(NODES[a], NODES[b], o, WALKER_RADIUS),
        `edge ${a}->${b} hits ${o.id}`
      );
    }
  }
});

test('every node is free standing space', () => {
  for (const [id, p] of Object.entries(NODES)) {
    for (const o of OBSTACLES) {
      assert.ok(
        !segmentHitsObstacle(p, p, o, WALKER_RADIUS),
        `node ${id} is inside ${o.id}`
      );
    }
  }
});

test('every stop is reachable from the road', () => {
  for (const [key, stop] of Object.entries(STOPS)) {
    assert.ok(nodeRoute('road', stop.node), `stop ${key} unreachable`);
  }
});

test('docking moves only touch their own furniture', () => {
  for (const [key, stop] of Object.entries(STOPS)) {
    if (!stop.dock) continue;
    assert.ok(
      segmentClear(NODES[stop.node], stop.dock, stop.dockIgnores ?? []),
      `dock of ${key} hits other furniture`
    );
  }
});

test('planned paths from any node and mid-lane stay clear', () => {
  const starts = [...Object.values(NODES)];
  // mid-lane points
  for (const [a, b] of EDGES) {
    starts.push([(NODES[a][0] + NODES[b][0]) / 2, (NODES[a][1] + NODES[b][1]) / 2]);
  }
  for (const from of starts) {
    for (const [key, stop] of Object.entries(STOPS)) {
      const path = planPath(from, key);
      assert.ok(path.length >= 1);
      for (let i = 1; i < path.length; i++) {
        const isDock = stop.dock && i === path.length - 1;
        assert.ok(
          segmentClear(path[i - 1], path[i], isDock ? stop.dockIgnores ?? [] : []),
          `path to ${key} from ${from} clips on segment ${i}`
        );
      }
    }
  }
});

test('furniture does not overlap and keeps a gap', () => {
  const items = Object.values(PLACEMENTS)
    .filter((p) => p.footprint)
    .map((p) => OBSTACLES.find((o) => o.id === p.id));
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      // the chair is intentionally tucked close to its desk
      const pair = [items[i].id, items[j].id].sort().join('+');
      if (pair === 'desk+deskChair' || pair === 'bookcase+guitar') continue;
      assert.ok(
        !obstaclesOverlap(items[i], items[j], 0.25),
        `${items[i].id} too close to ${items[j].id}`
      );
    }
  }
});

test('furniture is inside the room', () => {
  for (const p of Object.values(PLACEMENTS)) {
    assert.ok(p.x > ROOM.minX && p.x < ROOM.maxX, `${p.id} x out of room`);
    assert.ok(p.z > ROOM.minZ && p.z < ROOM.maxZ, `${p.id} z out of room`);
  }
});
