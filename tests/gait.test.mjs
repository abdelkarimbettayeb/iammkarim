import test from 'node:test';
import assert from 'node:assert/strict';
import { GAIT, sampleGait } from '../src/components/room/character/gait.ts';

// Mirrors BOY in CharacterBoy.tsx
const DIMS = { hipY: 0.78, thigh: 0.37, shin: 0.33 };
const ANKLE = DIMS.hipY - DIMS.thigh - DIMS.shin;
const TAU = Math.PI * 2;

/** Ankle position relative to the hip pivot (z forward, y up) */
function ankle(leg) {
  const h = leg.hip;
  const k = leg.hip + leg.knee;
  return {
    z: -DIMS.thigh * Math.sin(h) - DIMS.shin * Math.sin(k),
    y: -DIMS.thigh * Math.cos(h) - DIMS.shin * Math.cos(k),
  };
}

const STEPS = 720;
const dGait = TAU / STEPS;
const dBody = (GAIT.cycle * dGait) / TAU; // body travel per sample

test('planted foot stays on the floor and does not slide', () => {
  let planted = 0;
  for (let i = 0; i < STEPS; i++) {
    const a = sampleGait(i * dGait, 1, DIMS);
    const b = sampleGait((i + 1) * dGait, 1, DIMS);
    const u = (i * dGait) / TAU;
    // left foot is in stance for the first part of the cycle
    if (u < 0.02 || u > GAIT.stance - 0.02) continue;
    planted++;
    const pa = ankle(a.left);
    const pb = ankle(b.left);
    // height of the ankle above ground (standing ankle height = ANKLE)
    const height = a.hipHeight + pa.y - ANKLE;
    assert.ok(Math.abs(height) < 0.012, `stance foot off the ground by ${height} at u=${u}`);
    // world-space foot velocity = body travel + foot-relative-to-hip movement
    const slide = dBody + (pb.z - pa.z);
    assert.ok(Math.abs(slide) < dBody * 0.12, `stance foot slides ${slide} (body step ${dBody}) at u=${u}`);
  }
  assert.ok(planted > 100);
});

test('swing foot clears the floor and the pelvis stays within a sensible bob', () => {
  let maxClear = 0;
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < STEPS; i++) {
    const s = sampleGait(i * dGait, 1, DIMS);
    for (const leg of [s.left, s.right]) {
      assert.ok(Number.isFinite(leg.hip) && Number.isFinite(leg.knee));
      assert.ok(leg.knee >= -1e-6, 'knee never hyper-extends');
      const clear = s.hipHeight + ankle(leg).y - ANKLE;
      assert.ok(clear > -0.012, `foot below the floor by ${clear}`);
      maxClear = Math.max(maxClear, clear);
    }
    lo = Math.min(lo, s.hipHeight);
    hi = Math.max(hi, s.hipHeight);
  }
  assert.ok(maxClear > 0.05, `swing foot should lift (got ${maxClear})`);
  assert.ok(hi - lo < 0.1, `pelvis bob too large: ${hi - lo}`);
  assert.ok(hi - lo > 0.02, `pelvis bob too small: ${hi - lo}`);
});

test('pelvis is highest at mid stance and lowest near double support', () => {
  const at = (u) => sampleGait(u * TAU, 1, DIMS).hipHeight;
  const midStance = at(GAIT.stance / 2);
  const doubleSupport = at(0.5 + 0.01);
  assert.ok(midStance > doubleSupport + 0.02);
});

test('turning on the spot only shuffles the feet', () => {
  for (let i = 0; i < STEPS; i++) {
    const s = sampleGait(i * dGait, 0.3, DIMS);
    for (const leg of [s.left, s.right]) {
      assert.ok(Math.abs(ankle(leg).z) < 0.14, 'small steps while pivoting');
    }
  }
});
