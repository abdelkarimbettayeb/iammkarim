import type {
  AchievementItem,
  CartridgeProject,
  EducationItem,
  FlagItem,
  TechSkillItem,
  WorkExperienceItem,
} from '@/types/room';

export const personalInfo = {
  name: 'Abdelkarim Bettayeb',
  role: 'Full-Stack & Lead Software Engineer',
  experienceYears: '9+',
  bio: 'Full-Stack & Lead Software Engineer with a track record of delivering 30+ commercial projects and production platforms using TypeScript, React, Node.js, PostgreSQL, and C++. Proficient in AI-assisted developer workflows to accelerate shipping velocity without compromising architecture or code quality. Graduated in the top 5% of Master’s degree class in Computer Science.',
  location: 'Relizane, Algeria',
  availability: 'Open to Remote & Relocation',
  locationUrl: 'https://maps.app.goo.gl/PQ8h3dBKmHihEkR96',
  email: 'bettayebabdelkrime2055@gmail.com',
  phone: '+213 540 606 959',
  whatsapp: '+213 540 606 959',
  whatsappUrl: 'https://wa.me/+213540606959',
  websiteUrl: 'https://iamkarim.vercel.app',
  githubUrl: 'https://github.com/xnevz',
  linkedinUrl: 'https://www.linkedin.com/in/karimbettayeb',
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
    name: 'English',
    countryCode: 'us',
    fluency: 'Professional Working Proficiency',
    nativeName: 'English',
  },
  {
    name: 'French',
    countryCode: 'fr',
    fluency: 'Intermediate Proficiency',
    nativeName: 'Français',
  },
];

export const workExperience: WorkExperienceItem[] = [
  {
    role: 'Lead Software Engineer',
    company: 'Jud (Saudi Arabia)',
    location: 'Remote',
    period: 'Oct 2025 – Dec 2026',
    type: 'Full-time / Lead',
    highlights: [
      'Directed technical architecture and delivery of core software platforms using TypeScript, React, Node.js, and relational databases.',
      'Established engineering standards, instituted code reviews, and integrated modern AI-assisted coding and testing workflows to accelerate sprint velocity.',
      'Partnered with product leadership to scope technical specifications, system architecture, and milestone roadmaps.',
    ],
  },
  {
    role: 'Full-Stack Developer',
    company: 'Alnurayn / Bahmardi Digital Library Project',
    location: 'Remote',
    period: '2022 – Present',
    type: 'Long-term Contract',
    highlights: [
      'Engineered and maintained the end-to-end digital library platform (alnurayn.org) serving large-scale document archives.',
      'Built and integrated an embedded C++ search addon with Node.js to index and query thousands of documents in milliseconds.',
      'Developed backend REST services in Node.js/PostgreSQL and operational administrative dashboards using Refine.dev and React.',
    ],
  },
  {
    role: 'Independent Software Engineer',
    company: 'Mostaql Platform / Client Contracts',
    location: 'Remote',
    period: '2020 – 2024',
    type: 'Commercial Contracts',
    highlights: [
      'Completed 30+ commercial software solutions with a 100% completion rate and a 5.0/5.0 client review record across international clients.',
      'Dentist System: Architected a clinical management monorepo with GraphQL (Apollo Server), Prisma, PostgreSQL, Refine.dev, and Expo mobile.',
      'Care360: Built a multi-tenant telehealth ecosystem featuring NestJS, BullMQ queues, Radix UI, and video consultation integrations.',
      'Enterprise POS: Developed an offline-first desktop POS in C# / .NET (WPF) with an asymmetric RSA cryptographic licensing engine.',
      'Implemented 10+ payment gateway integrations, 8+ automated web scrapers, and custom automation bots (WhatsApp, Telegram).',
    ],
  },
];

export const education: EducationItem = {
  degree: 'Master of Science (M.Sc.) in Computer Science',
  institution: 'Ahmad Zabana University',
  location: 'Relizane, Algeria',
  period: '2017 – 2022',
  honors: 'Graduated in the Top 5% of the graduating cohort',
};

export const techSkills: TechSkillItem[] = [
  {
    name: 'TypeScript',
    level: 96,
    color: '#3178C6',
    iconPath: '/skills/typescript.svg',
    category: 'languages',
    description: 'Primary language for type-safe full-stack platforms and clean architectures.',
  },
  {
    name: 'React & Next.js',
    level: 95,
    color: '#61DAFB',
    iconPath: '/skills/react.png',
    category: 'frontend',
    description: 'SSR, ISR, App Router, responsive design systems, and rich client state.',
  },
  {
    name: 'Node.js & NestJS',
    level: 92,
    color: '#339933',
    iconPath: '/skills/nodejs.png',
    category: 'backend',
    description: 'Enterprise backend services, modular microservices, and asynchronous runtimes.',
  },
  {
    name: 'PostgreSQL & MySQL',
    level: 90,
    color: '#4169E1',
    iconPath: '/skills/pgsql.png',
    category: 'database',
    description: 'Relational data modeling, ACID transactions, complex queries, and Prisma ORM.',
  },
  {
    name: 'C++ & Native Addons',
    level: 86,
    color: '#00599C',
    iconPath: '/skills/cpp.svg',
    category: 'languages',
    description: 'High-performance embedded search engine modules and sub-millisecond document indexing.',
  },
  {
    name: 'C# / .NET (WPF)',
    level: 85,
    color: '#239120',
    iconPath: '/skills/csharp.png',
    category: 'languages',
    description: 'Offline-first desktop enterprise POS with asymmetric RSA cryptographic licensing.',
  },
  {
    name: 'GraphQL & Apollo',
    level: 88,
    color: '#E10098',
    iconPath: '/skills/graphql.svg',
    category: 'backend',
    description: 'Unified schema architecture, resolvers, mutations, and subgraphs.',
  },
  {
    name: 'React Native (Expo)',
    level: 88,
    color: '#61DAFB',
    iconPath: '/skills/react-native.svg',
    category: 'frontend',
    description: 'Cross-platform mobile applications for iOS & Android.',
  },
  {
    name: 'Refine.dev & Radix UI',
    level: 92,
    color: '#1E40AF',
    iconPath: '/skills/refine.png',
    category: 'frontend',
    description: 'Enterprise internal administration tools, headless UI primitives, and data grids.',
  },
  {
    name: 'Tailwind CSS',
    level: 95,
    color: '#06B6D4',
    iconPath: '/skills/tailwind.png',
    category: 'frontend',
    description: 'Responsive, accessible design systems, fluid layouts, and dark mode theming.',
  },
  {
    name: 'Redis & BullMQ',
    level: 87,
    color: '#DC382D',
    iconPath: '/skills/redis.svg',
    category: 'database',
    description: 'Distributed background job processing queues, rate-limiting, and caching.',
  },
  {
    name: 'AI-Assisted Workflows',
    level: 96,
    color: '#8B5CF6',
    iconPath: '/skills/ai.svg',
    category: 'ai',
    description: 'Agentic coding, synthesis, and rapid prototype-to-production engineering pipelines.',
  },
  {
    name: 'Docker & CI/CD',
    level: 88,
    color: '#2496ED',
    iconPath: '/skills/docker.svg',
    category: 'tools',
    description: 'Containerization, Linux administration, automated pipelines, and TDD.',
  },
];

export const achievements: AchievementItem[] = [
  {
    title: 'Commercial Projects',
    number: '30+',
  },
  {
    title: 'Client Satisfaction',
    number: '5.0/5.0',
  },
  {
    title: 'Completion Rate',
    number: '100%',
  },
  {
    title: 'Master’s Class Standing',
    number: 'Top 5%',
  },
  {
    title: 'Payment Gateways',
    number: '10+',
  },
  {
    title: 'Automated Web Scrapers',
    number: '8+',
  },
];

export const cartridgeProjects: Record<'jud' | 'alnurayn' | 'freelance' | 'tastytracks', CartridgeProject> = {
  jud: {
    id: 'jud',
    title: 'Lead Software Engineer',
    subtitle: 'Jud (Saudi Arabia) • Oct 2025 – Dec 2026',
    description: [
      'Directed technical architecture and delivery of core software platforms using TypeScript, React, Node.js, and relational databases.',
      'Established engineering standards, instituted code reviews, and integrated modern AI-assisted coding and testing workflows to accelerate sprint velocity.',
      'Partnered with product leadership to scope technical specifications, system architecture, and milestone roadmaps.',
    ],
    stack: ['typescript', 'react', 'nodejs', 'postgresql', 'ai-workflows', 'ci/cd'],
    url: 'https://iamkarim.vercel.app',
    metrics: 'Lead engineer delivering core production platforms with AI-accelerated velocity',
    color: '#8b5cf6',
    image: '/projects/fullstack.jpeg',
  },
  alnurayn: {
    id: 'alnurayn',
    title: 'Digital Library & C++ Search',
    subtitle: 'alnurayn.org • Bahmardi Project (2022 – Present)',
    description: [
      'Engineered and maintained the end-to-end digital library platform (alnurayn.org) serving large-scale document archives.',
      'Built and integrated an embedded C++ search addon with Node.js to index and query thousands of documents in milliseconds.',
      'Developed backend REST services in Node.js/PostgreSQL and operational administrative dashboards using Refine.dev and React.',
    ],
    stack: ['react', 'nodejs', 'c++', 'postgresql', 'refine', 'figma'],
    url: 'https://alnurayn.org',
    metrics: 'Production platform serving thousands of documents with C++ accelerated search in milliseconds',
    color: '#0ea5e9',
    image: '/projects/fullstack.jpeg',
  },
  freelance: {
    id: 'freelance',
    title: '30+ Commercial Platforms',
    subtitle: 'Mostaql Platform / Client Contracts (2020 – 2024)',
    description: [
      'Completed 30+ commercial software solutions with a 100% completion rate and a 5.0/5.0 client review record.',
      'Dentist System: Monorepo clinical platform with GraphQL (Apollo Server), Prisma, PostgreSQL, Refine.dev, and Expo mobile.',
      'Care360: Multi-tenant telehealth ecosystem featuring NestJS, BullMQ queues, Radix UI, and video consultations.',
      'Enterprise POS: Offline-first desktop POS in C# / .NET (WPF) with asymmetric RSA cryptographic licensing.',
      'Implemented 10+ payment gateway integrations, 8+ automated web scrapers, and custom automation bots.',
    ],
    stack: ['typescript', 'react', 'nestjs', 'c#', 'graphql', 'expo', 'prisma', 'bullmq'],
    url: 'https://mostaql.com/u/abdelkrime2055/reviews',
    metrics: '30+ commercial platforms shipped with 100% 5-star client satisfaction',
    color: '#f59e0b',
    image: '/projects/freelancer.png',
  },
  tastytracks: {
    id: 'tastytracks',
    title: 'Restaurant Website & UI/UX',
    subtitle: 'TastyTracks — Responsive Experience',
    description: [
      'Designed and implemented interactive culinary website featuring smooth animations and streamlined ordering flows.',
      'Created component design tokens and UI mockups in Figma prior to high-fidelity React frontend implementation.',
    ],
    stack: ['react', 'figma', 'tailwind'],
    url: 'https://github.com/xnevz/TastyTracks',
    metrics: 'Modern reactive menu and interactive booking interface',
    color: '#10b981',
    image: '/projects/tasty-tracks.jpeg',
  },
};
