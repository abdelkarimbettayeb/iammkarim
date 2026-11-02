/**
 * Single source of truth for the room layout.
 *
 * 1 unit = 1 metre. Pure data + geometry helpers: no React, no path aliases,
 * so it can be imported directly by `node --test`.
 *
 * Axes: +x right, +y up, +z towards the camera. A yaw of 0 faces +z and
 * `forward(yaw) = (sin yaw, cos yaw)`.
 */

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type Footprint =
  | { shape: 'rect'; w: number; d: number }
  | { shape: 'circle'; r: number };

export interface Placement {
  id: string;
  x: number;
  z: number;
  yaw: number;
  /** Uniform scale or [x, y, z] */
  scale: number | Vec3;
  /** Floor footprint used for walking obstacles (null = does not block) */
  footprint: Footprint | null;
}

// ---------------------------------------------------------------------------
// Room shell
// ---------------------------------------------------------------------------

export const ROOM = {
  minX: -2.5,
  maxX: 2.5,
  minZ: -2.2,
  maxZ: 2.2,
  wallHeight: 2.7,
  wallThickness: 0.12,
} as const;

/** Window opening cut into the back wall */
export const WINDOW = {
  cx: 1.85,
  sill: 0.9,
  width: 1.14,
  height: 1.4,
} as const;

/** Centre-line x of the stone walkway that leads from the road to the door */
export const PATH_X = 1.8;
/** Where the garden ends and the road curb starts */
export const CURB_Z = 6.0;
export const ROAD = { centerZ: 7.8, width: 3.6 } as const;

// ---------------------------------------------------------------------------
// Real-world heights used by the character (metres)
// ---------------------------------------------------------------------------

export const SEAT_HEIGHT = {
  deskChair: 0.46,
  armchair: 0.38,
} as const;

// ---------------------------------------------------------------------------
// Furniture placements
// ---------------------------------------------------------------------------

const DESK_SCALE = 0.52;
const CHAIR_SCALE = 0.64;
const BOOKCASE_SCALE = 0.4;
const ARMCHAIR_SCALE = 0.9;
const GUITAR_SCALE = 0.52;

export const PLACEMENTS = {
  /** Teak desk against the back wall, left corner */
  desk: {
    id: 'desk',
    x: -1.45,
    z: -1.84,
    yaw: 0,
    scale: DESK_SCALE,
    footprint: { shape: 'rect', w: 1.98, d: 0.68 },
  },
  /** Eames chair pulled out from the desk, facing -z (towards the monitor) */
  deskChair: {
    id: 'deskChair',
    x: -1.55,
    z: -1.3,
    yaw: Math.PI,
    scale: CHAIR_SCALE,
    footprint: { shape: 'circle', r: 0.27 },
  },
  /** 2x4 cube bookcase against the back wall */
  bookcase: {
    id: 'bookcase',
    x: 0.45,
    z: -2.05,
    yaw: 0,
    scale: BOOKCASE_SCALE,
    footprint: { shape: 'rect', w: 0.93, d: 0.29 },
  },
  /** Guitar leaning on the back wall, right of the bookcase */
  guitar: {
    id: 'guitar',
    x: 1.2,
    z: -2.0,
    yaw: 0,
    scale: GUITAR_SCALE,
    footprint: { shape: 'rect', w: 0.4, d: 0.2 },
  },
  /** Mid-century mustard armchair, turned towards the coffee table */
  armchair: {
    id: 'armchair',
    x: 1.7,
    z: 0.15,
    yaw: -1.25,
    scale: ARMCHAIR_SCALE,
    footprint: { shape: 'rect', w: 1.05, d: 0.72 },
  },
  /** Low round coffee table, 0.3 m in front of the armchair */
  coffeeTable: {
    id: 'coffeeTable',
    x: 0.675,
    z: 0.49,
    yaw: 0,
    scale: [0.78, 1.05, 0.78],
    footprint: { shape: 'circle', r: 0.42 },
  },
  cactus: {
    id: 'cactus',
    x: -2.1,
    z: 1.75,
    yaw: 0,
    scale: 1,
    footprint: { shape: 'circle', r: 0.23 },
  },
  /** Welcome mat just inside the doorway */
  mat: {
    id: 'mat',
    x: 1.95,
    z: 1.8,
    yaw: 0,
    scale: 0.65,
    footprint: null,
  },
} satisfies Record<string, Placement>;

/** Wall mounted items (do not block floor space) */
export const WALL_ITEMS = {
  dartboard: { z: 0.6, y: 1.73, scale: 0.47 },
  sconce: { z: 0.6, y: 2.3, scale: 0.8 },
  shelf: { z: -1.0, y: 1.75, scale: 0.3 },
  brand: { z: -1.0, y: 2.35, fontSize: 0.16 },
} as const;

/** Guitar lean angle (radians, top tilts towards the back wall) */
export const GUITAR_LEAN = 0.16;

// ---------------------------------------------------------------------------
// Outdoor props
// ---------------------------------------------------------------------------

export const OUTDOOR = {
  pathLamps: [
    { x: PATH_X - 0.7, z: 2.9 },
    { x: PATH_X + 0.7, z: 3.7 },
    { x: PATH_X - 0.7, z: 4.5 },
    { x: PATH_X + 0.7, z: 5.3 },
  ],
  mailbox: { x: 3.0, z: 4.6, yaw: -Math.PI * 0.25, r: 0.32 },
  volleyball: { x: 3.3, z: 3.0, scale: 0.66 },
  puddle: { x: -0.5, z: 4.5, r: 1.0 },
  bush: { x: -2.9, z: 3.0, r: 0.35 },
  highwayLamps: [
    { x: -4.5, z: CURB_Z + 0.25, yaw: -Math.PI / 2 },
    { x: 6.5, z: CURB_Z + 0.25, yaw: -Math.PI / 2 },
  ],
} as const;

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

export function forward(yaw: number): Vec2 {
  return [Math.sin(yaw), Math.cos(yaw)];
}

/** Local +x axis of an item after rotating by `yaw` about y */
export function rightOf(yaw: number): Vec2 {
  return [Math.cos(yaw), -Math.sin(yaw)];
}

/** Convert a position in an item's local floor frame to world x/z */
export function localToWorld(p: Placement, lx: number, lz: number): Vec2 {
  const f = forward(p.yaw);
  const r = rightOf(p.yaw);
  return [p.x + r[0] * lx + f[0] * lz, p.z + r[1] * lx + f[1] * lz];
}

/** Yaw that makes something at `from` look at `to` */
export function faceToward(from: Vec2, to: Vec2): number {
  return Math.atan2(to[0] - from[0], to[1] - from[1]);
}

export function scaleToNumber(s: number | Vec3): number {
  return typeof s === 'number' ? s : s[0];
}

// ---------------------------------------------------------------------------
// Obstacles (inflate by the walker's radius when testing)
// ---------------------------------------------------------------------------

export type Obstacle =
  | { id: string; shape: 'rect'; x: number; z: number; yaw: number; w: number; d: number }
  | { id: string; shape: 'circle'; x: number; z: number; r: number };

function fromPlacement(p: Placement): Obstacle | null {
  if (!p.footprint) return null;
  if (p.footprint.shape === 'rect') {
    return { id: p.id, shape: 'rect', x: p.x, z: p.z, yaw: p.yaw, w: p.footprint.w, d: p.footprint.d };
  }
  return { id: p.id, shape: 'circle', x: p.x, z: p.z, r: p.footprint.r };
}

const T = ROOM.wallThickness;
const WALL_LEN = 12;

export const OBSTACLES: Obstacle[] = [
  // Walls (left and back only; the right and front are the open cut-away)
  {
    id: 'wall-left',
    shape: 'rect',
    x: ROOM.minX - T / 2,
    z: 0,
    yaw: 0,
    w: T,
    d: WALL_LEN,
  },
  {
    id: 'wall-back',
    shape: 'rect',
    x: 0,
    z: ROOM.minZ - T / 2,
    yaw: 0,
    w: WALL_LEN,
    d: T,
  },
  ...Object.values(PLACEMENTS)
    .map(fromPlacement)
    .filter((o): o is Obstacle => o !== null),
  ...OUTDOOR.pathLamps.map(
    (l, i): Obstacle => ({ id: `pathLamp${i}`, shape: 'circle', x: l.x, z: l.z, r: 0.1 })
  ),
  { id: 'mailbox', shape: 'circle', x: OUTDOOR.mailbox.x, z: OUTDOOR.mailbox.z, r: OUTDOOR.mailbox.r },
  { id: 'puddle', shape: 'circle', x: OUTDOOR.puddle.x, z: OUTDOOR.puddle.z, r: OUTDOOR.puddle.r },
  { id: 'bush', shape: 'circle', x: OUTDOOR.bush.x, z: OUTDOOR.bush.z, r: OUTDOOR.bush.r },
  ...OUTDOOR.highwayLamps.map(
    (l, i): Obstacle => ({ id: `highwayLamp${i}`, shape: 'circle', x: l.x, z: l.z, r: 0.2 })
  ),
];

/** Squared distance from point to segment ab */
function pointSegDist(px: number, pz: number, a: Vec2, b: Vec2): number {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const len2 = abx * abx + abz * abz;
  let t = len2 === 0 ? 0 : ((px - a[0]) * abx + (pz - a[1]) * abz) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + abx * t), pz - (a[1] + abz * t));
}

/** Does the segment a→b come within `inflate` of the obstacle? */
export function segmentHitsObstacle(a: Vec2, b: Vec2, o: Obstacle, inflate: number): boolean {
  if (o.shape === 'circle') {
    return pointSegDist(o.x, o.z, a, b) < o.r + inflate;
  }
  // Rotate the segment into the rect's local frame, then slab-test vs expanded AABB
  const c = Math.cos(o.yaw);
  const s = Math.sin(o.yaw);
  const toLocal = (p: Vec2): Vec2 => {
    const dx = p[0] - o.x;
    const dz = p[1] - o.z;
    // inverse of localToWorld: local x = dot(r), local z = dot(f)
    return [dx * c - dz * s, dx * s + dz * c];
  };
  const la = toLocal(a);
  const lb = toLocal(b);
  const hx = o.w / 2 + inflate;
  const hz = o.d / 2 + inflate;
  let tMin = 0;
  let tMax = 1;
  const d = [lb[0] - la[0], lb[1] - la[1]];
  const lo = [-hx, -hz];
  const hi = [hx, hz];
  for (let i = 0; i < 2; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (la[i] < lo[i] || la[i] > hi[i]) return false;
    } else {
      let t1 = (lo[i] - la[i]) / d[i];
      let t2 = (hi[i] - la[i]) / d[i];
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return false;
    }
  }
  return true;
}

/** Do two footprints overlap (optionally with an extra gap)? */
export function obstaclesOverlap(a: Obstacle, b: Obstacle, gap = 0): boolean {
  const corners = (o: Obstacle): Vec2[] => {
    if (o.shape !== 'rect') return [];
    const hw = o.w / 2;
    const hd = o.d / 2;
    const r = rightOf(o.yaw);
    const f = forward(o.yaw);
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd],
    ].map(([lx, lz]) => [o.x + r[0] * lx + f[0] * lz, o.z + r[1] * lx + f[1] * lz] as Vec2);
  };
  const edges = (cs: Vec2[]): [Vec2, Vec2][] => cs.map((c, i) => [c, cs[(i + 1) % cs.length]]);

  const distPointRect = (px: number, pz: number, r: Obstacle): number => {
    if (r.shape !== 'rect') return Infinity;
    const c = Math.cos(r.yaw);
    const s = Math.sin(r.yaw);
    const dx = px - r.x;
    const dz = pz - r.z;
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    const ox = Math.max(Math.abs(lx) - r.w / 2, 0);
    const oz = Math.max(Math.abs(lz) - r.d / 2, 0);
    return Math.hypot(ox, oz);
  };

  if (a.shape === 'circle' && b.shape === 'circle') {
    return Math.hypot(a.x - b.x, a.z - b.z) < a.r + b.r + gap;
  }
  if (a.shape === 'circle' && b.shape === 'rect') {
    return distPointRect(a.x, a.z, b) < a.r + gap;
  }
  if (a.shape === 'rect' && b.shape === 'circle') {
    return distPointRect(b.x, b.z, a) < b.r + gap;
  }
  // rect vs rect: segment-vs-rect test on edges of each, plus containment of centres
  const ra = a as Extract<Obstacle, { shape: 'rect' }>;
  const rb = b as Extract<Obstacle, { shape: 'rect' }>;
  for (const [p, q] of edges(corners(ra))) {
    if (segmentHitsObstacle(p, q, rb, gap)) return true;
  }
  for (const [p, q] of edges(corners(rb))) {
    if (segmentHitsObstacle(p, q, ra, gap)) return true;
  }
  return false;
}
