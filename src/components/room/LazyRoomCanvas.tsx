'use client';

import dynamic from 'next/dynamic';

// ssr: false must live in a Client Component; the loading shell is still prerendered as static HTML
export const LazyRoomCanvas = dynamic(
  () => import('@/components/room/RoomCanvas').then((mod) => mod.RoomCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-[#0B0F19] flex flex-col items-center justify-center text-white select-none">
        <div className="w-14 h-14 rounded bg-amber-400 text-slate-950 font-primary font-bold text-2xl flex items-center justify-center animate-pulse">
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
