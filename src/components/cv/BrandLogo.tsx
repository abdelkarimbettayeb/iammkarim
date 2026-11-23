'use client';

import React from 'react';

interface BrandLogoProps {
  className?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

/**
 * Folded Prism (Mark 07): Overlapping dual-tone ribbon apex enclosing a Signal Vermilion prism core.
 */
export function BrandLogo({
  className = 'w-8 h-8',
  accentColor = 'var(--cv-accent, #E0441B)',
  style,
}: BrandLogoProps) {
  return (
    <svg
      viewBox="10 10 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M11 52L27.5 11H36.5L21 52H11Z" fill="currentColor" />
      <path d="M27.5 11H36.5L53 52H43L27.5 11Z" fill="currentColor" opacity="0.72" />
      <path d="M32 27.5L39.56 47.5H24.44L32 27.5Z" fill={accentColor} />
    </svg>
  );
}
