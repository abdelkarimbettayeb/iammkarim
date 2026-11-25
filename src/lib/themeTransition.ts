import { flushSync } from 'react-dom';

const DURATION_MS = 1000;

// shortcut: local typing, TS dom lib here predates View Transitions; drop when upgraded
type VTDocument = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> };
};

/**
 * Switches theme with a slanted wipe that sweeps left to right, revealing the new
 * theme. Falls back to an instant switch when the browser has no View Transitions
 * API, the user prefers reduced motion, or nothing changes.
 */
export function setThemeAnimated(setTheme: (theme: string) => void, next: 'light' | 'dark') {
  const doc = document as VTDocument;
  const root = doc.documentElement;
  const unchanged = root.classList.contains('dark') === (next === 'dark');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (unchanged || reduced || !doc.startViewTransition) {
    setTheme(next);
    return;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;
  const slant = H * 0.6;
  const poly = (t: number) =>
    `polygon(${-slant}px 0px, ${t}px 0px, ${t - slant}px ${H}px, ${-slant}px ${H}px)`;

  // flushSync so next-themes has already applied the class when the "new" snapshot is taken
  const transition = doc.startViewTransition(() => flushSync(() => setTheme(next)));

  transition.ready.then(() => {
    root.animate(
      { clipPath: [poly(0), poly(W + slant)] },
      {
        duration: DURATION_MS,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  });
}
