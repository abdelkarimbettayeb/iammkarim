import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 6 TournamentDartboard raycasting and retrieval loop', () => {
  const dartFile = fs.readFileSync('src/components/room/items/TournamentDartboard.tsx', 'utf-8');
  assert.ok(dartFile.includes('worldToLocal'), 'Dartboard should use worldToLocal for cursor raycasting');
  assert.ok(!dartFile.includes('(Math.random() - 0.5) * 0.14'), 'Should remove random dart offset');
  assert.ok(dartFile.includes('useRoomStore'), 'Dartboard should integrate with useRoomStore');
  assert.ok(dartFile.includes('setActiveStation'), 'Dartboard should set active station');
  assert.ok(fs.readFileSync('src/components/room/character/useCharacterBrain.ts', 'utf-8').includes('resetDarts'), 'Retrieval should reset the darts once he has pulled them out');
});

