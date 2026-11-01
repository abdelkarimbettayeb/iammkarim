import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Task 7 Character boy model and breath puff components exist', () => {
  assert.ok(fs.existsSync('src/components/room/character/CharacterBoy.tsx'), 'CharacterBoy.tsx must exist');
  assert.ok(fs.existsSync('src/components/room/character/ChillyBreathPuff.tsx'), 'ChillyBreathPuff.tsx must exist');

  const charFile = fs.readFileSync('src/components/room/character/CharacterBoy.tsx', 'utf-8');
  assert.ok(charFile.includes('CharacterBoy'), 'Exports CharacterBoy');
  assert.ok(charFile.includes('leftArm') || charFile.includes('leftArmRef'), 'Has left arm joint');
  assert.ok(charFile.includes('rightArm') || charFile.includes('rightArmRef'), 'Has right arm joint');

  const puffFile = fs.readFileSync('src/components/room/character/ChillyBreathPuff.tsx', 'utf-8');
  assert.ok(puffFile.includes('export function ChillyBreathPuff'), 'Exports ChillyBreathPuff');
});
