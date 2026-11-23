'use client';

import type { ReactNode } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface HeroTooltipProps {
  label: string;
  description: string;
  accent?: string;
  side?: 'top' | 'bottom';
  children: ReactNode;
}

export function HeroTooltip({
  label,
  description,
  accent,
  side = 'top',
  children,
}: HeroTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        className="z-[90] max-w-[260px] rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#26262D] px-3.5 py-2.5 text-left text-[#111113] dark:text-[#EDEDF0] shadow-xl"
      >
        <div className="flex items-center gap-1.5 mb-1">
          {accent && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            />
          )}
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[#7A7A86] dark:text-[#92929F]">
            {label}
          </span>
        </div>
        <p className="font-sans text-[12px] leading-[1.45] text-[#27272E] dark:text-[#EDEDF0] font-normal">
          {description}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
