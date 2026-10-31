import type { AchievementItem, CartridgeProject, FlagItem, TechSkillItem } from '@/types/room';

export const personalInfo = {
  name: 'Abdelkarim Bettayeb',
  role: 'Full-stack Web Developer & Software Engineer',
  experienceYears: '9+',
  bio: 'Full-stack web developer and experienced software engineer with over 9 years of hands-on experience building performant, production-ready applications.',
  location: 'Relizane, Algeria',
  locationUrl: 'https://maps.app.goo.gl/PQ8h3dBKmHihEkR96',
  email: 'bettayebabdelkrime2055@gmail.com',
  whatsapp: '+213 540 606 959',
  whatsappUrl: 'https://wa.me/+213540606959',
  githubUrl: 'https://github.com/xnevz/',
  linkedinUrl: 'https://www.linkedin.com/in/karimbettayeb/',
  facebookUrl: 'https://facebook.com/mr.a.blizzard/',
  resumePdfUrl: '/Resume.pdf',
};

export const languages: FlagItem[] = [
  {
    name: 'Arabic',
    countryCode: 'dz',
    fluency: 'Native',
    nativeName: 'العربية',
  },
  {
    name: 'French',
    countryCode: 'fr',
    fluency: 'Fluent',
    nativeName: 'Français',
  },
  {
    name: 'English',
    countryCode: 'us',
    fluency: 'Professional Working',
    nativeName: 'English',
  },
];

export const techSkills: TechSkillItem[] = [
  {
    name: 'ReactJS',
    level: 95,
    color: '#61DAFB',
    iconPath: '/skills/react.png',
    category: 'frontend',
    description: 'Experienced UI / UX designer and frontend architect.',
  },
  {
    name: 'NextJS',
    level: 90,
    color: '#000000',
    iconPath: '/skills/nextjs.png',
    category: 'frontend',
    description: 'Fullstack development with SSR, ISR, and App Router.',
  },
  {
    name: 'NodeJS',
    level: 88,
    color: '#339933',
    iconPath: '/skills/nodejs.png',
    category: 'backend',
    description: 'Backend API design, services, and asynchronous runtimes.',
  },
  {
    name: 'PostgreSQL',
    level: 85,
    color: '#4169E1',
    iconPath: '/skills/pgsql.png',
    category: 'database',
    description: 'Relational data modeling, query optimization, and migrations.',
  },
  {
    name: 'Tailwind CSS',
    level: 95,
    color: '#06B6D4',
    iconPath: '/skills/tailwind.png',
    category: 'frontend',
    description: 'Responsive, accessible design systems and styling.',
  },
  {
    name: 'C# / C++',
    level: 80,
    color: '#239120',
    iconPath: '/skills/csharp.png',
    category: 'languages',
    description: 'High-performance app modules, search engines, and administrative tools.',
  },
  {
    name: 'Refine.dev',
    level: 85,
    color: '#1E40AF',
    iconPath: '/skills/refine.png',
    category: 'frontend',
    description: 'Enterprise internal tools and admin dashboard UI/UX design.',
  },
];

export const achievements: AchievementItem[] = [
  {
    title: 'Web Apps',
    number: '10+',
  },
  {
    title: 'Payment Gateways',
    number: '10+',
  },
  {
    title: 'Web Scraping Tools',
    number: '8+',
  },
  {
    title: 'Complex Optimisation Problems',
    number: '10+',
  },
  {
    title: 'Bots (Whatsapp, Telegram, ...)',
    number: '5+',
  },
];

export const cartridgeProjects: Record<'alnurayn' | 'freelance' | 'tastytracks', CartridgeProject> = {
  alnurayn: {
    id: 'alnurayn',
    title: 'Fullstack Website development',
    subtitle: 'alnurayn.org — Current occupation',
    description: [
      'Engineered an enterprise portal using Refine as the admin dashboard, React for client-facing frontend, and Node.js for microservices.',
      'Integrated native C++ search routines to reduce server latency and optimize query throughput under heavy load.',
      'Refined technical roadmaps, resource allocation, and cloud architecture for production reliability.',
    ],
    stack: ['react', 'nodejs', 'postgresql', 'refine', 'figma', 'c++', 'c#'],
    url: 'https://alnurayn.org',
    metrics: 'Production platform serving thousands of users with C++ accelerated search',
    color: '#0ea5e9',
    image: '/projects/fullstack.jpeg',
  },
  freelance: {
    id: 'freelance',
    title: 'Independent Contractor',
    subtitle: 'Mostaql Top-Rated Freelancer',
    description: [
      'Delivered over 30 verified client projects with a consistent 5.0 / 5.0 star rating.',
      'Developed custom fullstack web systems, automation bots, payment gateways, and data scrapers for regional clients.',
      'Ranked among elite software contractors with exemplary client retention and reviews.',
    ],
    stack: ['react', 'nodejs', 'mysql', 'c#', 'php', 'postgresql', 'figma'],
    url: 'https://mostaql.com/u/abdelkrime2055/reviews',
    metrics: '30+ projects completed with 100% 5-star client satisfaction',
    color: '#f59e0b',
    image: '/projects/freelancer.png',
  },
  tastytracks: {
    id: 'tastytracks',
    title: 'Restaurant Website Design',
    subtitle: 'TastyTracks — Design & Implementation',
    description: [
      'Designed and implemented interactive culinary website featuring smooth UX animations and streamlined ordering flows.',
      'Created component design tokens and UI mockups in Figma prior to high-fidelity React frontend implementation.',
    ],
    stack: ['react', 'figma'],
    url: 'https://github.com/xnevz/TastyTracks',
    metrics: 'Modern reactive menu and interactive booking interface',
    color: '#10b981',
    image: '/projects/tasty-tracks.jpeg',
  },
};
