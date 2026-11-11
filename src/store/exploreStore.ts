import { useSyncExternalStore } from 'react';
import { roomStore } from './useRoomStore';

/**
 * The "exploration layer" on top of the room: what the visitor has found,
 * what the cursor is pointing at, what the boy is saying and doing.
 * Kept apart from the room store so the 3D scene state stays lean.
 */

export type DrawerSection = 'summary' | 'skills' | 'experience' | 'projects' | 'education' | 'achievements';

export interface ExploreState {
  /** Discovery ids the visitor has found (persisted per browser) */
  discovered: string[];
  /** Latest new discovery, shown as a toast */
  lastFind: { id: string; at: number } | null;
  /** Label for the object under the cursor */
  hover: { title: string; action: string } | null;
  /** Speech bubble over the boy's head */
  speech: { text: string; at: number } | null;
  /** What the boy is doing right now, for the header status */
  activity: string;
  /** Section the resume drawer should scroll to when it opens */
  drawerSection: DrawerSection | null;
}

const STORAGE_KEY = 'room.discovered.v1';

function loadDiscovered(): string[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

let state: ExploreState = {
  // Loaded after hydration (see hydrate) so server and client first render match
  discovered: [],
  lastFind: null,
  hover: null,
  speech: null,
  activity: 'Walking up to the house',
  drawerSection: null,
};

const listeners = new Set<() => void>();

function set(patch: Partial<ExploreState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const exploreStore = {
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  hydrate: () => {
    const discovered = loadDiscovered();
    if (discovered.length) set({ discovered: [...new Set([...discovered, ...state.discovered])] });
  },
  /** Mark something as found; only the first time counts and pops a toast */
  discover: (id: string) => {
    if (state.discovered.includes(id)) return;
    const discovered = [...state.discovered, id];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(discovered));
    } catch {
      // Private mode / blocked storage: progress just won't survive a reload
    }
    set({ discovered, lastFind: { id, at: Date.now() } });
  },
  resetDiscoveries: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ discovered: [], lastFind: null });
  },
  setHover: (hover: ExploreState['hover']) => {
    if (hover?.title === state.hover?.title && hover?.action === state.hover?.action) return;
    set({ hover });
  },
  say: (text: string) => set({ speech: { text, at: Date.now() } }),
  setActivity: (activity: string) => {
    if (activity !== state.activity) set({ activity });
  },
  clearDrawerSection: () => {
    if (state.drawerSection) set({ drawerSection: null });
  },
  /** Open the resume drawer at a given section */
  openDrawer: (section: DrawerSection | null = null) => {
    set({ drawerSection: section });
    if (!roomStore.getState().isDrawerOpen) roomStore.toggleDrawer();
  },
};

export function useExplore<T>(selector: (s: ExploreState) => T): T {
  return useSyncExternalStore(
    exploreStore.subscribe,
    () => selector(state),
    () => selector(state)
  );
}

/**
 * Pointer handlers for anything clickable in the room: pointer cursor plus
 * the floating label that says what it is and what clicking does.
 */
export function hoverable(title: string, action: string) {
  return {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
      exploreStore.setHover({ title, action });
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto';
      exploreStore.setHover(null);
    },
  };
}
