import { TopHeader } from '@/components/overlay/TopHeader';
import { QuickNavBar } from '@/components/overlay/QuickNavBar';
import { CaseStudyModal } from '@/components/overlay/CaseStudyModal';
import { ContactModal } from '@/components/overlay/ContactModal';
import { ResumeDrawer } from '@/components/overlay/ResumeDrawer';
import { ExploreLayer } from '@/components/overlay/ExploreLayer';
import { LazyRoomCanvas } from '@/components/room/LazyRoomCanvas';
import { cartridgeProjects, personalInfo, techSkills } from '@/data/resumeData';
import { SITE_URL } from '@/lib/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: personalInfo.name,
      jobTitle: personalInfo.role,
      description: personalInfo.bio,
      url: SITE_URL,
      image: `${SITE_URL}/opengraph-image`,
      address: { '@type': 'PostalAddress', addressLocality: 'Relizane', addressCountry: 'DZ' },
      knowsAbout: techSkills.map((s) => s.name),
      sameAs: [personalInfo.githubUrl, personalInfo.linkedinUrl],
    },
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: SITE_URL, name: personalInfo.name, inLanguage: 'en' },
  ],
};

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0B0F19]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      {/* The 3D scene is canvas-only; this gives crawlers and screen readers the same content as text */}
      <section className="sr-only">
        <h2>About {personalInfo.name}</h2>
        <p>{personalInfo.bio}</p>
        <p>{personalInfo.location} - {personalInfo.availability}</p>
        <h2>Skills</h2>
        <ul>
          {techSkills.map((s) => (
            <li key={s.name}>{s.name}: {s.description}</li>
          ))}
        </ul>
        <h2>Experience</h2>
        <ul>
          {Object.values(cartridgeProjects).map((p) => (
            <li key={p.id}>{p.title} - {p.subtitle}. {p.description.join(' ')}</li>
          ))}
        </ul>
      </section>
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
