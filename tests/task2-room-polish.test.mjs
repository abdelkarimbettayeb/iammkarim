import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 2 architectural fixes in files', () => {
  const roomStructure = fs.readFileSync('src/components/room/RoomStructure.tsx', 'utf-8');
  assert.ok(roomStructure.includes('#FFFFFF'), 'Walls should be pure white');
  assert.ok(roomStructure.includes('2.8'), 'Window should be shifted to x >= 2.8 to clear bookcase');

  const bookcase = fs.readFileSync('src/components/room/Bookcase.tsx', 'utf-8');
  assert.ok(!bookcase.includes('TennisRacket'), 'Tennis racket should be removed');

  const workstation = fs.readFileSync('src/components/room/items/WorkstationDesk.tsx', 'utf-8');
  assert.ok(workstation.includes('WavingFlag'), 'Workstation desk should mount WavingFlag');
  assert.ok(workstation.includes('3.8'), 'Desk should be enlarged to 3.8');
});
