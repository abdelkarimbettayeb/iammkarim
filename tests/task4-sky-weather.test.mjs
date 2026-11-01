import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 4 sky dome and weather system exist and integrate properly', () => {
  assert.ok(fs.existsSync('src/components/room/DynamicSkyAndWeather.tsx'), 'DynamicSkyAndWeather.tsx must exist');
  const skyFile = fs.readFileSync('src/components/room/DynamicSkyAndWeather.tsx', 'utf-8');
  assert.ok(skyFile.includes('export function DynamicSkyAndWeather'), 'Exports DynamicSkyAndWeather');
  assert.ok(skyFile.includes('isNightMode'), 'Reacts to night mode');
  assert.ok(skyFile.includes('weatherState'), 'Reacts to weather state');

  const canvasFile = fs.readFileSync('src/components/room/RoomCanvas.tsx', 'utf-8');
  assert.ok(canvasFile.includes('DynamicSkyAndWeather'), 'RoomCanvas should mount DynamicSkyAndWeather');
});
