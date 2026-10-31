import { useSyncExternalStore } from 'react';
import type { CartridgeId, RoomState, RoomZone } from '@/types/room';

type Listener = () => void;

interface RoomStoreValues {
  activeZone: RoomZone;
  activeCartridge: CartridgeId | null;
  isMuted: boolean;
  isDrawerOpen: boolean;
  isContactOpen: boolean;
  isNightMode: boolean;
}

let state: RoomStoreValues = {
  activeZone: 'overview',
  activeCartridge: null,
  isMuted: true,
  isDrawerOpen: false,
  isContactOpen: false,
  isNightMode: false,
};

const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setState(updater: Partial<RoomStoreValues> | ((prev: RoomStoreValues) => Partial<RoomStoreValues>)) {
  const next = typeof updater === 'function' ? updater(state) : updater;
  state = { ...state, ...next };
  emitChange();
}

export const roomStore = {
  getState: () => state,
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setActiveZone: (zone: RoomZone) => setState({ activeZone: zone }),
  setActiveCartridge: (id: CartridgeId | null) => setState({ activeCartridge: id }),
  toggleMute: () => setState((s) => ({ isMuted: !s.isMuted })),
  toggleDrawer: () => setState((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  toggleContact: () => setState((s) => ({ isContactOpen: !s.isContactOpen })),
  toggleNightMode: () => setState((s) => ({ isNightMode: !s.isNightMode })),
};

export function useRoomStore(): RoomState;
export function useRoomStore<T>(selector: (state: RoomState) => T): T;
export function useRoomStore<T>(selector?: (state: RoomState) => T): T | RoomState {
  const snapshot = useSyncExternalStore(
    roomStore.subscribe,
    roomStore.getState,
    roomStore.getState
  );

  const fullState: RoomState = {
    ...snapshot,
    setActiveZone: roomStore.setActiveZone,
    setActiveCartridge: roomStore.setActiveCartridge,
    toggleMute: roomStore.toggleMute,
    toggleDrawer: roomStore.toggleDrawer,
    toggleContact: roomStore.toggleContact,
    toggleNightMode: roomStore.toggleNightMode,
  };

  return selector ? selector(fullState) : fullState;
}
