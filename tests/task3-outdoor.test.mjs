import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 3 outdoor components exist and export valid React components', () => {
  assert.ok(fs.existsSync('src/components/room/RoadsidePuddleWithDuck.tsx'), 'RoadsidePuddleWithDuck.tsx must exist');
  const duckFile = fs.readFileSync('src/components/room/RoadsidePuddleWithDuck.tsx', 'utf-8');
  assert.ok(duckFile.includes('export function RoadsidePuddleWithDuck'), 'Exports RoadsidePuddleWithDuck');

  const pathwayFile = fs.readFileSync('src/components/room/OutdoorPathway.tsx', 'utf-8');
  assert.ok(pathwayFile.includes('RoadsidePuddleWithDuck'), 'OutdoorPathway should mount RoadsidePuddleWithDuck');
  assert.ok(pathwayFile.includes('<Lawn'), 'OutdoorPathway should mount the Lawn that fades into the horizon');
  assert.ok(pathwayFile.includes('Highway') || pathwayFile.includes('highway') || pathwayFile.includes('Main Road') || pathwayFile.includes('main-road'), 'OutdoorPathway should include main road');
});

