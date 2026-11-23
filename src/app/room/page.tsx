import { TopHeader } from '@/components/overlay/TopHeader';
import { QuickNavBar } from '@/components/overlay/QuickNavBar';
import { CaseStudyModal } from '@/components/overlay/CaseStudyModal';
import { ContactModal } from '@/components/overlay/ContactModal';
import { ResumeDrawer } from '@/components/overlay/ResumeDrawer';
import { ExploreLayer } from '@/components/overlay/ExploreLayer';
import { LazyRoomCanvas } from '@/components/room/LazyRoomCanvas';
import { FloatingModeSwitch } from '@/components/cv/FloatingModeSwitch';
import '@/components/cv/cv.css';

export default function RoomPage() {
  return (
    <main className="cv-shell relative w-screen h-[100dvh] overflow-hidden bg-white dark:bg-[#18181C]">
      <LazyRoomCanvas />
      <TopHeader />
      <ExploreLayer />
      <QuickNavBar />
      <CaseStudyModal />
      <ContactModal />
      <ResumeDrawer />
      <FloatingModeSwitch />
    </main>
  );
}
