'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { TopHeader } from '@/components/overlay/TopHeader';
import { QuickNavBar } from '@/components/overlay/QuickNavBar';
import { CaseStudyModal } from '@/components/overlay/CaseStudyModal';
import { ContactModal } from '@/components/overlay/ContactModal';
import { ResumeDrawer } from '@/components/overlay/ResumeDrawer';

// Dynamically import 3D Canvas with ssr: false to prevent WebGL/SSR hydration mismatch
const RoomCanvas = dynamic(
  () => import('@/components/room/RoomCanvas').then((mod) => mod.RoomCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white select-none">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-primary font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/20 animate-pulse">
          B
        </div>
        <div className="mt-4 text-xs uppercase tracking-widest font-secondary font-bold text-amber-400">
          Loading 3D Diorama...
        </div>
        <div className="text-[10px] text-slate-400 mt-1 font-paragraph">
          Abdelkarim Bettayeb • Interactive 3D Resume
        </div>
      </div>
    ),
  }
);

import { TopShelf } from '@/components/room/TopShelf';
import { WallDecor } from '@/components/room/WallDecor';
import { Bookcase } from '@/components/room/Bookcase';
import { Workstation } from '@/components/room/Workstation';
import { ForegroundLounge } from '@/components/room/ForegroundLounge';
import { OutdoorPathway } from '@/components/room/OutdoorPathway';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B0F19]">
      {/* 1. Master 3D Room Diorama */}
      <RoomCanvas>
        <TopShelf />
        <WallDecor />
        <Bookcase />
        <Workstation />
        <ForegroundLounge />
        <OutdoorPathway />
      </RoomCanvas>

      {/* 2. Top Navigation & Status HUD */}
      <TopHeader />

      {/* 3. Bottom Zone Camera Quick-Nav Bar */}
      <QuickNavBar />

      {/* 4. Active Cartridge Project Case Study Modal */}
      <CaseStudyModal />

      {/* 5. Direct Contact & Social Modal */}
      <ContactModal />

      {/* 6. Complete Traditional Resume Slide-Out Sheet */}
      <ResumeDrawer />
    </main>
  );
}
