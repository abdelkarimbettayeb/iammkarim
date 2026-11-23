import { HybridCV } from '@/components/cv/HybridCV';
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
    <main className="relative w-screen h-[100dvh] overflow-hidden bg-white dark:bg-[#18181C]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
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

      <HybridCV />
    </main>
  );
}
