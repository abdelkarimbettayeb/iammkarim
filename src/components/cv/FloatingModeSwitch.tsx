'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Layers } from 'lucide-react';

export function FloatingModeSwitch({ inline = false }: { inline?: boolean }) {
  const pathname = usePathname();
  const isRoom = pathname?.startsWith('/room') ?? false;
  const tabClass = inline ? 'cv-mode-tab cv-mode-tab-compact' : 'cv-mode-tab';

  const switcher = (
    <div className="cv-floating-switcher p-1 inline-flex items-center gap-0.5 sm:gap-1 shrink-0">
      <Link
        href="/"
        data-active={!isRoom ? 'true' : 'false'}
        aria-current={!isRoom ? 'page' : undefined}
        title="Switch to Hybrid 3D + Snap CV"
        className={tabClass}
      >
        <Layers
          size={inline ? 12 : 13}
          style={{ color: !isRoom ? 'var(--cv-accent)' : 'currentColor' }}
        />
        <span className="sm:hidden">CV</span>
        <span className="hidden sm:inline">Hybrid CV</span>
      </Link>

      <Link
        href="/room"
        data-active={isRoom ? 'true' : 'false'}
        aria-current={isRoom ? 'page' : undefined}
        title="Switch to Interactive 3D Room World"
        className={tabClass}
      >
        <Box
          size={inline ? 12 : 13}
          style={{ color: isRoom ? 'var(--cv-accent)' : 'currentColor' }}
        />
        <span className="sm:hidden">3D</span>
        <span className="hidden sm:inline">3D Room</span>
      </Link>
    </div>
  );

  if (inline) {
    return (
      <nav aria-label="Switch portfolio experience" className="shrink-0">
        {switcher}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Switch portfolio experience"
      className="hidden md:block fixed md:bottom-5 md:left-5 lg:bottom-6 lg:left-6 z-30 pointer-events-auto"
    >
      {switcher}
    </nav>
  );
}
