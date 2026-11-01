'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import BackgroundScene from './Background';
import Sidebar from './Sidebar';
import GoToTopButtonContainer from './GoToTopButtonContainer';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 3D Room and Studio are full-bleed standalone immersive experiences
  const is3DExperience = pathname === '/' || pathname?.startsWith('/studio');

  if (is3DExperience) {
    return (
      <div className="w-screen h-screen overflow-hidden p-0 m-0 bg-[#0B0F19]">
        {children}
      </div>
    );
  }

  return (
    <GoToTopButtonContainer id="scrollContainer" className="h-screen overflow-y-auto overflow-x-hidden">
      <Header />
      <BackgroundScene />
      <Sidebar />
      <main className="m-5 sm:m-10">{children}</main>
    </GoToTopButtonContainer>
  );
}

