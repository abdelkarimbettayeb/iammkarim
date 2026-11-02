/**
 * Predefined walk map for the boy.
 *
 * A hand-authored graph of lanes between named nodes. Every edge is verified
 * (see tests/walkmap.test.mjs) to stay clear of all furniture/props once they
 * are inflated by the walker's radius, so following the graph can never clip
 * through anything. Docking segments (sit down, step to the flags) are the only
 * moves allowed to touch the furniture of their own station.
 */

import {
  OBSTACLES,
  OUTDOOR,
  PATH_X,
  PLACEMENTS,
  ROOM,
  CURB_Z,
  ROAD,
  faceToward,
  forward,
  localToWorld,
  segmentHitsObstacle,
  type Vec2,
} from './layout.ts';

export const WALKER_RADIUS = 0.22;

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

const armchairApproach = localToWorld(PLACEMENTS.armchair, 1.05, 0.05);
const armchairFwd = forward(PLACEMENTS.armchair.yaw);
const armchairSeat: Vec2 = [
  PLACEMENTS.armchair.x - armchairFwd[0] * 0.04,
  PLACEMENTS.armchair.z - armchairFwd[1] * 0.04,
];

const deskSeat: Vec2 = [PLACEMENTS.deskChair.x, PLACEMENTS.deskChair.z];

export const NODES = {
  // Outdoors
  road: [PATH_X, ROAD.centerZ - 0.4],
  curb: [PATH_X, CURB_Z - 0.2],
  path1: [PATH_X, 4.8],
  path2: [PATH_X, 3.8],
  path3: [PATH_X, 2.9],
  doorstep: [PATH_X, ROOM.maxZ + 0.2],
  lawnThink: [0.6, 3.6],
  lawnVolley: [OUTDOOR.volleyball.x - 0.55, OUTDOOR.volleyball.z],

  // Indoors
  entry: [PATH_X, 1.65],
  front1: [0.9, 1.5],
  front2: [-0.4, 1.5],
  front3: [-1.4, 1.5],
  dartLine: [-1.15, 0.6],
  dartBoard: [-2.0, 0.6],
  mid0: [-1.0, -0.4],
  mid1: [0.4, -0.4],
  deskApproach: [PLACEMENTS.deskChair.x, -0.45],
  flagsFront: [-0.9, -1.2],
  guitarFront: [1.2, -1.3],
  windowFront: [1.9, -1.55],
  couchApproach: armchairApproach,
} as const satisfies Record<string, Vec2>;

export type NodeId = keyof typeof NODES;

// ---------------------------------------------------------------------------
// Lanes
// ---------------------------------------------------------------------------

export const EDGES: [NodeId, NodeId][] = [
  ['road', 'curb'],
  ['curb', 'path1'],
  ['path1', 'path2'],
  ['path2', 'path3'],
  ['path3', 'doorstep'],
  ['doorstep', 'entry'],
  ['path2', 'lawnThink'],
  ['path3', 'lawnVolley'],

  ['entry', 'front1'],
  ['entry', 'couchApproach'],
  ['front1', 'couchApproach'],
  ['front1', 'front2'],
  ['front2', 'front3'],
  ['front3', 'dartLine'],
  ['dartLine', 'mid0'],
  ['dartLine', 'dartBoard'],
  ['mid0', 'mid1'],
  ['mid0', 'deskApproach'],
  ['mid0', 'flagsFront'],
  ['mid1', 'guitarFront'],
  ['guitarFront', 'windowFront'],
];

// ---------------------------------------------------------------------------
// Stops: where each station ends up
// ---------------------------------------------------------------------------

export type StopKey =
  | 'spawn'
  | 'rest'
  | 'workstation'
  | 'couch'
  | 'guitar'
  | 'window'
  | 'dartboard'
  | 'dartRetrieve'
  | 'volleyball'
  | 'flags'
  | 'thinking_outdoor';

export interface Stop {
  node: NodeId;
  /** Optional last move after the node, allowed to touch `dockIgnores` */
  dock?: Vec2;
  dockIgnores?: string[];
  /** Facing when the walk finishes */
  yaw: number;
}

export const STOPS: Record<StopKey, Stop> = {
  spawn: { node: 'road', yaw: Math.PI },
  // Arrival / rest spot: just inside the door, facing the camera-ish
  rest: { node: 'entry', yaw: Math.PI * 0.25 },
  workstation: {
    node: 'deskApproach',
    dock: deskSeat,
    dockIgnores: ['deskChair', 'desk'],
    yaw: Math.PI,
  },
  couch: {
    node: 'couchApproach',
    dock: armchairSeat,
    dockIgnores: ['armchair'],
    yaw: PLACEMENTS.armchair.yaw,
  },
  guitar: { node: 'guitarFront', yaw: 0.5 },
  window: { node: 'windowFront', yaw: Math.PI },
  dartboard: { node: 'dartLine', yaw: -Math.PI / 2 },
  dartRetrieve: { node: 'dartBoard', yaw: -Math.PI / 2 },
  volleyball: {
    node: 'lawnVolley',
    yaw: faceToward(NODES.lawnVolley, [OUTDOOR.volleyball.x, OUTDOOR.volleyball.z]),
  },
  flags: { node: 'flagsFront', yaw: Math.PI },
  thinking_outdoor: { node: 'lawnThink', yaw: -0.8 },
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

const dist = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Is the straight segment a→b free of all (inflated) obstacles? */
export function segmentClear(a: Vec2, b: Vec2, ignore: string[] = []): boolean {
  for (const o of OBSTACLES) {
    if (ignore.includes(o.id)) continue;
    if (segmentHitsObstacle(a, b, o, WALKER_RADIUS)) return false;
  }
  return true;
}

const ADJ: Record<string, { to: NodeId; w: number }[]> = {};
for (const id of Object.keys(NODES)) ADJ[id] = [];
for (const [a, b] of EDGES) {
  const w = dist(NODES[a], NODES[b]);
  ADJ[a].push({ to: b, w });
  ADJ[b].push({ to: a, w });
}

/** Shortest node route between two nodes (inclusive), or null if disconnected */
export function nodeRoute(from: NodeId, to: NodeId): NodeId[] | null {
  const best: Record<string, number> = { [from]: 0 };
  const prev: Record<string, NodeId | undefined> = {};
  const open = new Set<NodeId>([from]);
  while (open.size) {
    let cur: NodeId | null = null;
    for (const n of open) if (cur === null || best[n] < best[cur]) cur = n;
    if (cur === null) break;
    open.delete(cur);
    if (cur === to) break;
    for (const { to: nb, w } of ADJ[cur]) {
      const alt = best[cur] + w;
      if (best[nb] === undefined || alt < best[nb]) {
        best[nb] = alt;
        prev[nb] = cur;
        open.add(nb);
      }
    }
  }
  if (best[to] === undefined) return null;
  const route: NodeId[] = [to];
  while (route[0] !== from) route.unshift(prev[route[0]] as NodeId);
  return route;
}

/**
 * Plan a polyline from an arbitrary position (usually mid-lane) to a stop.
 * The start joins the graph at whichever node gives the shortest total trip
 * among those reachable by a clear straight segment, so changing your mind
 * mid-walk never cuts a corner through furniture.
 */
export function planPath(from: Vec2, stopKey: StopKey, leaveIgnores: string[] = []): Vec2[] {
  const stop = STOPS[stopKey];
  let bestCost = Infinity;
  let bestPath: Vec2[] | null = null;

  for (const id of Object.keys(NODES) as NodeId[]) {
    const p = NODES[id];
    // Joining the graph must be clear (except when standing up from a seat)
    if (!segmentClear(from, p, leaveIgnores)) continue;
    const route = nodeRoute(id, stop.node);
    if (!route) continue;
    let cost = dist(from, p);
    for (let i = 1; i < route.length; i++) cost += dist(NODES[route[i - 1]], NODES[route[i]]);
    if (cost < bestCost) {
      bestCost = cost;
      bestPath = [from, ...route.map((n) => NODES[n] as Vec2)];
    }
  }

  if (!bestPath) return [from];
  // Drop a duplicate first point if we already stand on the first node
  if (bestPath.length > 1 && dist(bestPath[0], bestPath[1]) < 0.02) bestPath.shift();
  if (stop.dock) bestPath.push(stop.dock);
  return bestPath;
}

export function pathLength(path: Vec2[]): number {
  let l = 0;
  for (let i = 1; i < path.length; i++) l += dist(path[i - 1], path[i]);
  return l;
}
