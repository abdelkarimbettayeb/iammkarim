import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 5 Volleyball physics and store integration', () => {
  const vbFile = fs.readFileSync('src/components/room/items/Volleyball.tsx', 'utf-8');
  assert.ok(vbFile.includes('restitution'), 'Volleyball should have physics restitution');
  assert.ok(vbFile.includes('setActiveStation'), 'Volleyball should trigger setActiveStation');

  const outdoorFile = fs.readFileSync('src/components/room/OutdoorPathway.tsx', 'utf-8');
  assert.ok(outdoorFile.includes('Volleyball'), 'OutdoorPathway should mount Volleyball in the garden court');
});

