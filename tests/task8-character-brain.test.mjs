import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 8 character brain and integration components exist', () => {
  assert.ok(fs.existsSync('src/components/room/character/useCharacterBrain.ts'), 'useCharacterBrain.ts must exist');
  assert.ok(fs.existsSync('src/components/room/character/CharacterManager.tsx'), 'CharacterManager.tsx must exist');

  const brainFile = fs.readFileSync('src/components/room/character/useCharacterBrain.ts', 'utf-8');
  assert.ok(brainFile.includes('useCharacterBrain'), 'Exports useCharacterBrain');
  assert.ok(brainFile.includes('autonomous'), 'Implements autonomous idle routines');

  const canvasFile = fs.readFileSync('src/components/room/RoomCanvas.tsx', 'utf-8');
  assert.ok(canvasFile.includes('CharacterManager'), 'RoomCanvas should mount CharacterManager');

  const cameraFile = fs.readFileSync('src/components/room/CameraRig.tsx', 'utf-8');
  assert.ok(cameraFile.includes('activeStation') || cameraFile.includes('target'), 'CameraRig should damp toward active station');
});

