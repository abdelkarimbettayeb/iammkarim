import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SLAT_CLOSED_ANGLE,
  SLAT_OPEN_ANGLE,
  blindAngle,
  projectedSlatHeight,
} from '../src/components/room/items/windowMotion.ts';
import {
  duckHeading,
  duckPosition,
  duckVelocity,
  puddleControlPoints,
} from '../src/components/room/puddleMath.ts';
import { ZOOM_MAX, ZOOM_MIN, clampZoom, zoomFromPinch, zoomFromWheel } from '../src/components/room/cameraMath.ts';
import { dayNight, lerp } from '../src/store/dayNight.ts';
import { CURB_Z, GUITAR_LEAN, OUTDOOR, PLACEMENTS, ROOM, WINDOW } from '../src/components/room/layout.ts';

const read = (p) => fs.readFileSync(p, 'utf-8');

test('window: closed slats stand up and overlap, open slats lie flat', () => {
  assert.ok(SLAT_CLOSED_ANGLE > 1.0, 'closed blind must be near vertical');
  assert.ok(SLAT_OPEN_ANGLE < 0.3, 'open blind must be near horizontal');
  assert.equal(blindAngle(0), SLAT_CLOSED_ANGLE);
  assert.ok(Math.abs(blindAngle(1) - SLAT_OPEN_ANGLE) < 1e-9);

  // geometry used by the component: slatWidth = pitch * 1.25
  const pitch = (WINDOW.height - 0.22) / 26;
  const slatWidth = pitch * 1.25;
  assert.ok(projectedSlatHeight(slatWidth, SLAT_CLOSED_ANGLE) > pitch, 'closed slats must overlap (no gaps)');
  assert.ok(projectedSlatHeight(slatWidth, SLAT_OPEN_ANGLE) < pitch * 0.4, 'open slats must let light through');
});

test('window: wall has a real opening and the window is clickable', () => {
  const room = read('src/components/room/RoomStructure.tsx');
  assert.ok(room.includes('above window') && room.includes('below window'), 'back wall is cut around the window');
  const win = read('src/components/room/items/VenetianWindow.tsx');
  assert.ok(win.includes('Invisible hit area'), 'window has a hit area covering the opening');
  assert.ok(win.includes('turnedNight') && win.includes('startedSnow'), 'auto-close only reacts to transitions');
});

test('puddle: irregular outline, off the road, duck faces its direction of travel', () => {
  const pts = puddleControlPoints();
  const radii = pts.map(([x, z]) => Math.hypot(x, z));
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.15, 'outline is not a circle');

  // fully inside the garden, clear of the road curb
  const farEdge = OUTDOOR.puddle.z + OUTDOOR.puddle.r;
  assert.ok(farEdge < CURB_Z - 0.2, 'puddle must not overlap the road');

  // duck stays inside the water outline (control polygon, with a body-sized margin)
  const inside = (px, pz) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, zi] = pts[i];
      const [xj, zj] = pts[j];
      if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  const edgeDist = (px, pz) => {
    let best = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const [ax, az] = pts[i];
      const [bx, bz] = pts[(i + 1) % pts.length];
      const abx = bx - ax;
      const abz = bz - az;
      const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / (abx * abx + abz * abz)));
      best = Math.min(best, Math.hypot(px - (ax + abx * t), pz - (az + abz * t)));
    }
    return best;
  };
  for (let t = 0; t < 60; t += 0.25) {
    const [x, z] = duckPosition(t);
    assert.ok(inside(x, z) && edgeDist(x, z) > 0.1, `duck leaves puddle at t=${t}`);
  }

  // beak (+z after yaw) lines up with velocity
  for (let t = 0; t < 30; t += 0.7) {
    const yaw = duckHeading(t);
    const [vx, vz] = duckVelocity(t);
    const beak = [Math.sin(yaw), Math.cos(yaw)];
    const len = Math.hypot(vx, vz);
    const dot = (beak[0] * vx + beak[1] * vz) / len;
    assert.ok(dot > 0.999, `duck heading off at t=${t}`);
  }
});

test('camera: wheel zoom is clamped and symmetric', () => {
  assert.equal(clampZoom(100), ZOOM_MAX);
  assert.equal(clampZoom(-1), ZOOM_MIN);
  assert.ok(zoomFromWheel(1, -100) < 1, 'wheel up zooms in');
  assert.ok(zoomFromWheel(1, 100) > 1, 'wheel down zooms out');
  assert.equal(zoomFromWheel(ZOOM_MAX, 5000), ZOOM_MAX);
  assert.equal(zoomFromWheel(ZOOM_MIN, -5000), ZOOM_MIN);
  assert.ok(zoomFromPinch(1, 100, 200) < 1, 'fingers apart zooms in');
  assert.ok(zoomFromPinch(1, 200, 100) > 1, 'fingers together zooms out');

  const rig = read('src/components/room/CameraRig.tsx');
  assert.ok(rig.includes("addEventListener('wheel'") && rig.includes('passive: false'), 'non-passive wheel listener');
  assert.ok(rig.includes('preventDefault'), 'page does not scroll while zooming');
});

test('day/night: blend eases instead of snapping', () => {
  assert.equal(dayNight.blend, 0);
  assert.equal(lerp(0, 10, 0.5), 5);
  const driver = read('src/components/room/DayNightDriver.tsx');
  assert.ok(driver.includes('MathUtils.damp'), 'driver eases the blend');
  for (const file of [
    'src/components/room/LightingRig.tsx',
    'src/components/room/DynamicSkyAndWeather.tsx',
    'src/components/room/DeskLamp.tsx',
    'src/components/room/PathwayLampPost.tsx',
    'src/components/room/TallHighwayLampPost.tsx',
    'src/components/room/items/VenetianWindow.tsx',
  ]) {
    const src = read(file);
    assert.ok(src.includes('dayNight.blend'), `${file} should read the shared blend`);
    assert.ok(!/isNightMode\s*\?/.test(src), `${file} must not hard-switch on isNightMode`);
  }
});

test('proportions are real-world metres', () => {
  const { desk, deskChair, bookcase, armchair, guitar } = PLACEMENTS;
  const s = (p) => (typeof p.scale === 'number' ? p.scale : p.scale[0]);
  assert.ok(ROOM.wallHeight >= 2.4 && ROOM.wallHeight <= 3, 'wall height ~2.5-3 m');
  assert.ok(1.4 * s(desk) > 0.7 && 1.4 * s(desk) < 0.78, 'desk height ~0.75 m');
  assert.ok(0.72 * s(deskChair) > 0.42 && 0.72 * s(deskChair) < 0.5, 'chair seat ~0.46 m');
  assert.ok(4.55 * s(bookcase) > 1.6 && 4.55 * s(bookcase) < 2.1, 'bookcase ~1.8-2 m tall');
  assert.ok(1.16 * s(armchair) > 0.8 && 1.16 * s(armchair) < 1.1, 'armchair ~0.8-1.1 m wide');
  assert.ok(1.9 * s(guitar) > 0.9 && 1.9 * s(guitar) < 1.1, 'guitar ~1 m long');
  assert.ok(GUITAR_LEAN > 0.08 && GUITAR_LEAN < 0.3, 'guitar leans back a sensible amount');

  const bookcaseSrc = read('src/components/room/Bookcase.tsx');
  assert.ok(bookcaseSrc.includes('-GUITAR_LEAN'), 'guitar is tilted against the wall');
});

test('UI: no corner radius larger than 4px', () => {
  const tw = read('tailwind.config.ts');
  const block = tw.match(/borderRadius: \{[\s\S]*?\}/)[0];
  const values = [...block.matchAll(/'(\d+)px'/g)].map((m) => Number(m[1]));
  assert.ok(values.length >= 8 && Math.max(...values) <= 4, 'tailwind radii capped at 4px');
  assert.ok(/full: '4px'/.test(block), 'rounded-full is capped too');

  const css = read('src/app/globals.css');
  const cssRadii = [...css.matchAll(/border-radius:\s*([\d.]+)(px|em|rem)/g)];
  for (const m of cssRadii) assert.ok(m[2] === 'px' && Number(m[1]) <= 4, `css radius ${m[0]}`);

  for (const file of fs.readdirSync('src/components/overlay')) {
    const src = read(`src/components/overlay/${file}`);
    assert.ok(!/rounded-(2xl|3xl|xl|full|\[\d+px\])/.test(src), `${file} uses a large radius`);
  }
});

test('weather has a control and no precipitation falls through the roofless house', () => {
  assert.ok(read('src/components/overlay/TopHeader.tsx').includes('setWeatherState'), 'weather selector exists');
  assert.ok(read('src/components/room/DynamicSkyAndWeather.tsx').includes('randomOutsideHouse'), 'particles avoid the house');
});

test('camera orbit: drag rotates around the room within limits', async () => {
  const { orbitFromDrag, viewDirection, ELEVATION_MIN, ELEVATION_MAX } = await import('../src/components/room/cameraMath.ts');
  const [az, el] = orbitFromDrag(0.5, 0.6, 100, 0);
  assert.ok(az < 0.5 && el === 0.6, 'horizontal drag only changes azimuth');
  assert.equal(orbitFromDrag(0, 0.6, 0, 1e6)[1], ELEVATION_MAX);
  assert.equal(orbitFromDrag(0, 0.6, 0, -1e6)[1], ELEVATION_MIN);
  const d = viewDirection(Math.PI / 4, 0.5);
  assert.ok(Math.abs(Math.hypot(...d) - 1) < 1e-9, 'unit vector');
  assert.ok(Math.abs(d[0] - d[2]) < 1e-9 && d[1] > 0, 'diagonal and above the floor');
});
