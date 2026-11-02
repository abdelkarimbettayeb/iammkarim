import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Flags and enlarged desk refinement verification', () => {
  // 1. Desk enlargement in WorkstationDesk.tsx
  const desk = fs.readFileSync('src/components/room/items/WorkstationDesk.tsx', 'utf-8');
  assert.ok(desk.includes('3.8'), 'Desk tabletop should be enlarged to 3.8m width');
  assert.ok(desk.includes('1.65') || desk.includes('1.6'), 'Desk legs should be spaced wider for the enlarged desk');

  // 2. Flag spacing: flags should have generous spacing (>= 0.42m) to prevent 0.38m cloth overlap
  assert.ok(desk.includes('0.46') || desk.includes('0.44'), 'Flag spacing should be at least 0.44m so cloths do not clip');

  // 3. Black partner book must NOT be on the right side blocking the flags (X > 0.5)
  // Ensure partner book is moved away from right side flags
  const rightPartnerBookMatch = desk.match(/group\s+position=\{\[([0-9.]+),\s*0\.3/);
  if (rightPartnerBookMatch) {
    const bookX = parseFloat(rightPartnerBookMatch[1]);
    assert.ok(bookX <= 0, `Partner book at X=${bookX} must not be on the right side blocking flags`);
  }

  // 4. ActionPose includes 'fiddling_flags'
  const brain = fs.readFileSync('src/components/room/character/useCharacterBrain.ts', 'utf-8');
  assert.ok(brain.includes("'fiddling_flags'"), "ActionPose must include 'fiddling_flags'");

  // 5. Flags waypoint uses 'fiddling_flags' pose and stands in front of desk
  assert.ok(
    brain.includes("flags: { stop: 'flags', pose: 'fiddling_flags' }"),
    "Flags station must use 'fiddling_flags' pose"
  );

  // 6. CharacterManager.tsx implements 'fiddling_flags' choreography
  const charMgr = fs.readFileSync('src/components/room/character/CharacterManager.tsx', 'utf-8');
  assert.ok(charMgr.includes("case 'fiddling_flags':"), "CharacterManager must handle 'fiddling_flags'");
});

