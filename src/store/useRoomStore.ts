import { useSyncExternalStore } from 'react';
import type {
  ActiveStation,
  CartridgeId,
  CharacterState,
  RoomState,
  RoomZone,
  WeatherState,
} from '@/types/room';

type Listener = () => void;

interface RoomStoreValues {
  activeZone: RoomZone;
  activeCartridge: CartridgeId | null;
  activeStation: ActiveStation;
  characterState: CharacterState;
  weatherState: WeatherState;
  dartsLeft: number;
  isWindowOpen: boolean;
  isMuted: boolean;
  isDrawerOpen: boolean;
  isContactOpen: boolean;
  isNightMode: boolean;
}

let state: RoomStoreValues = {
  activeZone: 'overview',
  activeCartridge: null,
  activeStation: 'none',
  characterState: 'spawning',
  weatherState: 'clear',
  dartsLeft: 3,
  isWindowOpen: true,
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

if (typeof window !== 'undefined') {
  (window as any).__roomStore = () => roomStore;
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
  setActiveStation: (station: ActiveStation) => setState({ activeStation: station }),
  setCharacterState: (charState: CharacterState) => setState({ characterState: charState }),
  setWeatherState: (weather: WeatherState) => setState({ weatherState: weather }),
  decrementDarts: () => setState((s) => ({ dartsLeft: Math.max(0, s.dartsLeft - 1) })),
  resetDarts: () => setState({ dartsLeft: 3 }),
  toggleWindow: (forceOpen?: boolean) =>
    setState((s) => ({ isWindowOpen: typeof forceOpen === 'boolean' ? forceOpen : !s.isWindowOpen })),
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
    setActiveStation: roomStore.setActiveStation,
    setCharacterState: roomStore.setCharacterState,
    setWeatherState: roomStore.setWeatherState,
    decrementDarts: roomStore.decrementDarts,
    resetDarts: roomStore.resetDarts,
    toggleWindow: roomStore.toggleWindow,
    toggleMute: roomStore.toggleMute,
    toggleDrawer: roomStore.toggleDrawer,
    toggleContact: roomStore.toggleContact,
    toggleNightMode: roomStore.toggleNightMode,
  };

  return selector ? selector(fullState) : fullState;
}
