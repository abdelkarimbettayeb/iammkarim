import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PLACEMENTS, WINDOW } from '../src/components/room/layout.ts';

test('Task 2 architectural fixes in files', () => {
  const roomStructure = fs.readFileSync('src/components/room/RoomStructure.tsx', 'utf-8');
  assert.ok(roomStructure.includes('#FFFFFF'), 'Walls should be pure white');
  const bookcaseRight = PLACEMENTS.bookcase.x + PLACEMENTS.bookcase.footprint.w / 2;
  assert.ok(WINDOW.cx - WINDOW.width / 2 > bookcaseRight, 'Window must clear the bookcase');

  const bookcase = fs.readFileSync('src/components/room/Bookcase.tsx', 'utf-8');
  assert.ok(!bookcase.includes('TennisRacket'), 'Tennis racket should be removed');

  const workstation = fs.readFileSync('src/components/room/items/WorkstationDesk.tsx', 'utf-8');
  assert.ok(workstation.includes('WavingFlag'), 'Workstation desk should mount WavingFlag');
  assert.ok(workstation.includes('3.8'), 'Desk model keeps its 3.8 unit design width');
  const deskWidth = 3.8 * PLACEMENTS.desk.scale;
  assert.ok(deskWidth > 1.8 && deskWidth < 2.2, 'Placed desk should be a realistic ~2 m wide');
});
