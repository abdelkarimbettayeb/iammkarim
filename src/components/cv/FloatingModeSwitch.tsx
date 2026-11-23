'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Layers } from 'lucide-react';

export function FloatingModeSwitch() {
  const pathname = usePathname();
  const isRoom = pathname?.startsWith('/room') ?? false;

  return (
    <nav
      aria-label="Switch portfolio experience"
      className="fixed bottom-[78px] right-3 md:bottom-5 md:right-auto md:left-5 lg:bottom-6 lg:left-6 z-30 pointer-events-auto"
    >
      <div className="cv-floating-switcher p-1 inline-flex items-center gap-1">
        <Link
          href="/"
          data-active={!isRoom ? 'true' : 'false'}
          aria-current={!isRoom ? 'page' : undefined}
          title="Switch to Hybrid 3D + Snap CV"
          className="cv-mode-tab"
        >
          <Layers
            size={13}
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
          className="cv-mode-tab"
        >
          <Box
            size={13}
            style={{ color: isRoom ? 'var(--cv-accent)' : 'currentColor' }}
          />
          <span className="sm:hidden">3D</span>
          <span className="hidden sm:inline">3D Room</span>
        </Link>
      </div>
    </nav>
  );
}
