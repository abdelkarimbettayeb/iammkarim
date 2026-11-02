import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Code Review Fixes: Dartboard ref, Modal Escape/X sync, Autonomous timer cleanup, Walking limb reset, Station clicks', () => {
  // 1. Dartboard ref attached to root group
  const dartboard = fs.readFileSync('src/components/room/items/TournamentDartboard.tsx', 'utf-8');
  assert.ok(dartboard.includes('ref={boardGroupRef}'), 'Dartboard must attach ref={boardGroupRef}');

  // 2. Modals Escape handler and X button calling setActiveStation('none')
  const resumeDrawer = fs.readFileSync('src/components/overlay/ResumeDrawer.tsx', 'utf-8');
  assert.ok(resumeDrawer.includes("'Escape'"), 'ResumeDrawer should listen for Escape key');
  assert.ok(resumeDrawer.includes("setActiveStation('none')"), 'ResumeDrawer X button must reset station');

  const caseStudy = fs.readFileSync('src/components/overlay/CaseStudyModal.tsx', 'utf-8');
  assert.ok(caseStudy.includes("'Escape'"), 'CaseStudyModal should listen for Escape key');

  const contactModal = fs.readFileSync('src/components/overlay/ContactModal.tsx', 'utf-8');
  assert.ok(contactModal.includes("'Escape'"), 'ContactModal should listen for Escape key');

  // 3. Autonomous timers cleanup in useCharacterBrain
  const brain = fs.readFileSync('src/components/room/character/useCharacterBrain.ts', 'utf-8');
  // Autonomous routines now run on a frame-driven step queue, so there are no timers to leak
  assert.ok(!brain.includes('setTimeout') && !brain.includes('setInterval'), 'useCharacterBrain must not use free-running timers');
  assert.ok(brain.includes('setQueue'), 'useCharacterBrain must run behaviour through the step queue');

  // 4. Walking limb reset in CharacterManager
  const charMgr = fs.readFileSync('src/components/room/character/CharacterManager.tsx', 'utf-8');
  assert.ok(charMgr.includes('leftArm.rotation.set(0, 0, 0.06)'), 'CharacterManager must reset limb rotations every frame');

  // 5. Click handlers on Workstation, Couch, and Guitar
  const desk = fs.readFileSync('src/components/room/items/WorkstationDesk.tsx', 'utf-8');
  assert.ok(desk.includes("setActiveStation('workstation')"), 'Workstation must call setActiveStation');

  const armchair = fs.readFileSync('src/components/room/items/MustardArmchair.tsx', 'utf-8');
  assert.ok(armchair.includes("setActiveStation('couch')"), 'Armchair must call setActiveStation');

  const guitar = fs.readFileSync('src/components/room/items/AcousticGuitar.tsx', 'utf-8');
  assert.ok(guitar.includes("setActiveStation('guitar')"), 'Guitar must call setActiveStation');
});
