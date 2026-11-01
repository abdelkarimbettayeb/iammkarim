import test from 'node:test';
import assert from 'node:assert/strict';
import { roomStore } from '../src/store/useRoomStore.ts';

test('roomStore provides character and weather state management', () => {
  const initial = roomStore.getState();
  assert.equal(initial.activeStation, 'none');
  assert.equal(initial.characterState, 'spawning');
  assert.equal(initial.weatherState, 'clear');
  assert.equal(initial.dartsLeft, 3);
  assert.equal(initial.isWindowOpen, true);

  // Transitions
  roomStore.setActiveStation('guitar');
  assert.equal(roomStore.getState().activeStation, 'guitar');

  roomStore.setCharacterState('walking');
  assert.equal(roomStore.getState().characterState, 'walking');

  roomStore.setWeatherState('snow');
  assert.equal(roomStore.getState().weatherState, 'snow');

  roomStore.decrementDarts();
  assert.equal(roomStore.getState().dartsLeft, 2);

  roomStore.resetDarts();
  assert.equal(roomStore.getState().dartsLeft, 3);

  roomStore.toggleWindow(false);
  assert.equal(roomStore.getState().isWindowOpen, false);
});
