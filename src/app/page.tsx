import { TopHeader } from '@/components/overlay/TopHeader';
import { QuickNavBar } from '@/components/overlay/QuickNavBar';
import { CaseStudyModal } from '@/components/overlay/CaseStudyModal';
import { ContactModal } from '@/components/overlay/ContactModal';
import { ResumeDrawer } from '@/components/overlay/ResumeDrawer';
import { ExploreLayer } from '@/components/overlay/ExploreLayer';
import { LazyRoomCanvas } from '@/components/room/LazyRoomCanvas';

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B0F19]">
      {/* 1. Master 3D Room Diorama (client-only, loaded after the static shell) */}
      <LazyRoomCanvas />

      {/* 2. Top Navigation & Status HUD */}
      <TopHeader />

      {/* 2b. Discoveries, hover labels, toasts, first-visit hint */}
      <ExploreLayer />

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
