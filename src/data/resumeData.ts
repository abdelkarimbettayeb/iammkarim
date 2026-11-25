import type {
  AchievementItem,
  CartridgeId,
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
    period: 'Oct 2025 – Present',
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
      'Dentist System (Bahmardi Dental): Architected a 4-app multi-clinic clinical monorepo (31 modules, 191 Prisma models, 8,800+ tests) with Apollo GraphQL, pg-boss outbox worker, SeaweedFS S3, Refine 5, Expo mobile, Astro 7, and Docker/Caddy/Restic CI/CD.',
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
    name: 'Node.js, Express & NestJS',
    level: 93,
    color: '#339933',
    iconPath: '/skills/nodejs.png',
    category: 'backend',
    description: 'Enterprise REST & GraphQL backends, Express 5, NestJS 11, Stripe webhooks, and TOTP MFA.',
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
    level: 92,
    color: '#E10098',
    iconPath: '/skills/graphql.svg',
    category: 'backend',
    description: 'Apollo Server 5, GraphQL Codegen, DataLoaders, GraphQL Armor, and typed client operations.',
  },
  {
    name: 'React Native (Expo)',
    level: 90,
    color: '#61DAFB',
    iconPath: '/skills/react-native.svg',
    category: 'frontend',
    description: 'Expo SDK 57, Expo Router, biometric auth, FCM/APNs push, Stripe RN, and Fastlane releases.',
  },
  {
    name: 'Refine.dev, Ant Design & Radix',
    level: 93,
    color: '#1E40AF',
    iconPath: '/skills/refine.png',
    category: 'frontend',
    description: 'Multi-role clinical & admin portals, Ant Design 5, Radix UI primitives, and dnd-kit.',
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
    name: 'Astro & Static Web',
    level: 86,
    color: '#FF5D01',
    iconPath: '/skills/astro.svg',
    category: 'frontend',
    description: 'Zero-JS static sites, strict CSP compliance, synced documentation pipelines, and SEO delivery.',
  },
  {
    name: 'Prisma ORM',
    level: 94,
    color: '#5A67D8',
    iconPath: '/skills/prisma.svg',
    category: 'database',
    description: 'Type-safe PostgreSQL schemas (191+ models), migrations, driver adapters, and transactional outboxes.',
  },
  {
    name: 'Redis, BullMQ & pg-boss',
    level: 89,
    color: '#DC382D',
    iconPath: '/skills/redis.svg',
    category: 'database',
    description: 'Distributed job queues, PostgreSQL transactional outbox workers, rate-limiting, and caching.',
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
    name: 'Docker, Caddy & CI/CD',
    level: 90,
    color: '#2496ED',
    iconPath: '/skills/docker.svg',
    category: 'tools',
    description: 'Docker Compose, Caddy auto-HTTPS, SeaweedFS S3, Restic encrypted backups, and GitHub Actions.',
  },
  {
    name: 'Vitest, Jest & Playwright',
    level: 91,
    color: '#6E9F18',
    iconPath: '/skills/vitest.svg',
    category: 'tools',
    description: 'Large-scale automated testing (8,800+ unit, integration, contract, and E2E suites) with TDD.',
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

export const cartridgeProjects: Record<CartridgeId, CartridgeProject> = {
  jud: {
    id: 'jud',
    title: 'Lead Software Engineer',
    subtitle: 'Jud (Saudi Arabia) • Oct 2025 – Present',
    description: [
      'Directed technical architecture and delivery of Jud’s enterprise NestJS 11 + Prisma 7 + React 19 platforms in Saudi Arabia.',
      'Architected a 15-module HR & operations suite (geo-attendance, shifts, leave refunds, violation matrices, payroll pre-processing, and RBAC).',
      'Engineered multi-brand analytics dashboards (ECharts, Socket.IO real-time updates) with automated Slack alerts and Puppeteer/RTL PDF & Excel exports.',
      'Maintained a canonical 61-module AI-readable registry (M-001..M-061), code review standards, and AI-assisted delivery pipelines.',
    ],
    stack: [
      'typescript',
      'nestjs 11',
      'react 19',
      'prisma 7',
      'postgresql',
      'socket.io',
      'refine',
      'echarts',
      'ai-workflows',
      'ci/cd',
    ],
    url: 'https://iamkarim.vercel.app',
    metrics: 'Lead engineer delivering Jud’s NestJS/React HR & brand analytics platforms',
    color: '#8b5cf6',
    visualType: 'jud-platform',
    caseStudy: {
      overview:
        'Led technical architecture and delivery of Jud’s internal enterprise business management platform in Saudi Arabia — unifying multi-brand marketing analytics, real-time Socket.IO operations, granular RBAC, and a 15-module HR & workforce management suite built on NestJS 11, Prisma 7, React 19, and Refine.dev.',
      problem:
        'Scaling fast across multi-brand operations, regional HR compliance (shifts, geo-attendance, leave balances, discipline matrices, payroll pre-processing), and cross-functional engineering squads required cohesive architecture, strict role isolation, and faster sprint velocity without accumulating tech debt.',
      solution:
        'Architected a modular NestJS 11 + Prisma 7 API and React 19 + Refine.dev RTL/LTR frontend backed by a machine-readable module registry (M-001–M-061), strict RBAC & BrandUserGuard isolation, automated cron/report pipelines, and standardized AI-assisted coding and review workflows.',
      stats: [
        {
          value: '15 Modules',
          label: 'HR & Ops Suite',
          detail: 'Attendance, Leave, Payroll & RBAC',
        },
        {
          value: '61 Modules',
          label: 'AI Registry',
          detail: 'Canonical M-001..M-061 specs',
        },
        {
          value: 'NestJS 11',
          label: 'Realtime Core',
          detail: 'Prisma 7 + Socket.IO + Cron',
        },
        {
          value: 'AR · EN',
          label: 'Enterprise UI',
          detail: 'React 19 + Refine + RTL PDF',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'NestJS 11 Core API, RBAC & Real-Time Engine',
          badge: 'NestJS 11 · Prisma 7 · PostgreSQL · Socket.IO',
          summary:
            'Modular REST & WebSocket backend enforcing strict tenant scoping, granular role permissions, and scheduled operational jobs.',
          bullets: [
            'Granular RBAC + BrandUserGuard isolation across Employee, Team Leader, and HR Admin surfaces.',
            'Scheduled cron automation (@nestjs/schedule), Winston daily-rotating logs, Swagger docs, and throttled security middleware.',
          ],
        },
        {
          code: '02',
          title: '15-Module HR, Geo-Attendance & Payroll Suite',
          badge: 'Prisma 7 · Leaflet · ECharts · PDFMake RTL',
          summary:
            'End-to-end workforce platform covering geo-located attendance, leave balances, configurable violation matrices, and payroll prep.',
          bullets: [
            'Geo-located clock-in/out, shift templates, company holiday calendars with retroactive leave refunds, and automated violation state machines.',
            'Payroll pre-processing (Net = Base − Deduction Days + Bonuses), 3-stage performance reviews, org charts, and immutable audit logs.',
          ],
        },
        {
          code: '03',
          title: 'Brand Analytics & Automated Reporting Pipelines',
          badge: 'ECharts · Puppeteer · Slack · Gemini AI',
          summary:
            'Multi-brand performance intelligence with real-time notifications and automated RTL document generation.',
          bullets: [
            'Interactive ECharts dashboards, Windsor data connectors, automated Slack notifications, and Google/Gemini AI workflows.',
            'Headless Puppeteer + RTL pdfmake & Excel (xlsx) automated report exports across Arabic and English interfaces.',
          ],
        },
        {
          code: '04',
          title: 'Engineering Leadership & AI-Accelerated Workflows',
          badge: 'ARCHITECTURE.md · Code Reviews · CI/CD',
          summary:
            'Standardized engineering architecture, code review rigor, and AI-assisted sprint velocity across backend and frontend squads.',
          bullets: [
            'Authored a canonical 61-module AI-readable registry (M-001–M-061) enabling deterministic feature scoping and agentic implementation.',
            'Instituted typed DTO/Prisma standards, structured code reviews, and milestone roadmaps with product leadership.',
          ],
        },
      ],
    },
  },
  alnurayn: {
    id: 'alnurayn',
    title: 'Digital Library & C++ Search',
    subtitle: 'alnurayn.org • Bahmardi Project (2022 – Present)',
    description: [
      'Architected the alnurayn.org digital library ecosystem spanning a React reader app, Refine.dev CMS, Node.js/PostgreSQL API, and a compiled C++ N-API search engine.',
      'Built @bahmardi/search-native in C++ with libpqxx, hiredis, and UTF-32 canonicalization (folding Arabic/Persian variants & stripping diacritics) for 10–50× faster full-text search.',
      'Implemented a 500 MB thread-safe L1 LRU + L2 Redis page cache, 3-level match-cursor pagination, and exact prefix/highlight/suffix snippet extraction with page & paragraph indexes.',
      'Engineered a Hybrid AI Research Agent (pgvector, Gemini, Cohere, LangChain) combining semantic similarity with Arabic root/stop-word normalization and automatic page-level citations.',
      'Developed WordPuppeteer (.NET 8 / WPF) over WebSockets to automate Microsoft Word .docx-to-PDF conversion and page asset ingestion.',
    ],
    stack: [
      'c++',
      'nodejs',
      'typescript',
      'postgresql',
      'redis',
      'react',
      'refine',
      'pgvector',
      'langchain',
      '.net wpf',
    ],
    url: 'https://alnurayn.org',
    metrics: '10–50× faster C++ full-text search + Hybrid AI RAG across multilingual archives',
    color: '#0ea5e9',
    visualType: 'cpp-search',
    caseStudy: {
      overview:
        'An end-to-end multilingual scholarly digital library (alnurayn.org) unifying a public reader application, a Refine.dev editorial CMS, a Node.js/PostgreSQL API, a pgvector hybrid AI research agent, a Windows .NET document-conversion worker, and a custom compiled C++ search engine serving Arabic, Persian, and English archives.',
      problem:
        'Full-text search across thousands of multi-volume Arabic and Persian manuscripts in pure JavaScript hit multi-second latencies (~2.3s+), high memory churn, and missed matches caused by Arabic diacritics (tashkeel), Persian/Arabic character variants, and deeply nested author, folder, book, and fragment hierarchies.',
      solution:
        'Engineered @bahmardi/search-native — a compiled C++ V8 N-API addon wired directly to libpqxx and hiredis with UTF-32 canonicalization, L1 in-process LRU + L2 Redis page caching, 3-level cursor pagination, and a companion pgvector hybrid AI RAG pipeline for citation-grounded Q&A.',
      stats: [
        {
          value: '10–50×',
          label: 'Search Speedup',
          detail: '~18–45ms C++ vs ~2.3s JS',
        },
        {
          value: '500 MB + L2',
          label: 'Tiered Cache',
          detail: 'In-process LRU + Redis',
        },
        {
          value: 'AR · FA · EN',
          label: 'UTF-32 Engine',
          detail: 'Diacritic & variant folding',
        },
        {
          value: '4 Apps',
          label: 'Full Ecosystem',
          detail: 'Reader, CMS, API, .NET Worker',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'Native C++ Search Engine (@bahmardi/search-native)',
          badge: 'C++ · V8 N-API · libpqxx',
          summary:
            'Cross-platform Linux/Windows x64 native addon with semaphore-bounded libpqxx connection pooling and zero-regex UTF-32 matching.',
          bullets: [
            'Pre-compacts book pages into canonical UTF-32 buffers folding Alef variants (أ إ آ ٱ → ا), Persian/Arabic Kaf & Ya (ک → ك, ی ى → ي), Teh Marbuta (ة → ه), and stripping diacritics/ZWNJ.',
            'Thread-safe std::shared_mutex 500 MB L1 LRU + optional hiredis L2 cache with atomic reloadFiles invalidation on content updates.',
            '3-level match-cursor pagination with summary mode (highlightCount), 5-minute sessionToken highlight paging, and exact prefix [highlight] suffix context with pageIndex & paragraphNumber.',
          ],
        },
        {
          code: '02',
          title: 'Hybrid AI Research Agent & RAG Pipeline',
          badge: 'pgvector · Gemini · Cohere · LangChain',
          summary:
            'Combines dense pgvector semantic similarity with Arabic-aware lexical retrieval and recursive chunking for grounded scholarly answers.',
          bullets: [
            'Arabic text normalization pipeline with stop-word removal and root extraction alongside 1024-d multilingual embeddings.',
            'Streaming agentic Q&A with scoped conversations, automatic page-level citations, entity reconciliation, and Quran/Bible quotation matching.',
          ],
        },
        {
          code: '03',
          title: 'Reader Web App & Editorial Admin CMS',
          badge: 'React · TypeScript · Refine.dev · Ant Design',
          summary:
            'Dual web interfaces for public scholarship reading and high-volume editorial curation across multilingual book trees.',
          bullets: [
            'Public alnurayn.org reader built with Vite, TanStack Query, Zustand, i18next RTL/LTR switching, virtual Arabic/Persian keyboard, and synchronized match highlighting.',
            'Refine.dev CMS featuring CKEditor 5 & TipTap rich editors, @dnd-kit drag-and-drop book/folder trees, text diffing, and DOCX export.',
          ],
        },
        {
          code: '04',
          title: 'Document Ingestion Worker (WordPuppeteer)',
          badge: '.NET 8 · WPF · WebSockets',
          summary:
            'Dedicated Windows desktop automation service bridging legacy Microsoft Word manuscripts into the web archive pipeline.',
          bullets: [
            'Communicates with the Express backend over real-time WebSockets to convert .docx files to PDF and extract page-level assets for indexing.',
          ],
        },
      ],
    },
  },
  dentist: {
    id: 'dentist',
    title: 'Bahmardi Dental — Dentist System',
    subtitle: 'Multi-Clinic Clinical Monorepo • GraphQL, Refine 5, Expo & Astro',
    description: [
      'Architected a 4-app clinical practice monorepo unifying an Apollo Server 5 + Express 5 + Prisma 7 backend/worker, a Refine 5 + Ant Design 5 staff admin portal, an Expo SDK 57 patient mobile app, and an Astro 7 public site.',
      'Designed 31 backend domain modules and 191 PostgreSQL 17 models backed by a pg-boss transactional outbox worker (FOR UPDATE SKIP LOCKED) and SeaweedFS S3 presigned uploads with SHA-256 verification and quarantine.',
      'Delivered end-to-end clinical workflows: odontogram tooth charting, periodontal gum charting, frozen-fee treatment plans with e-signing, automated 15m waitlist chair recovery, split-payment checkout & blind cash drawer with dual-manager MFA approvals, imaging annotations, sterilization loads, and lot recalls.',
      'Engineered HIPAA-oriented security with Argon2id + mandatory TOTP MFA, AES-256-GCM secret sealing, GraphQL Armor, hash-chained append-only audit logs, break-glass emergency access reporting, and Stripe online payments (card, Apple Pay, Google Pay).',
      'Backed by 8,800+ automated tests across 880 suites (Vitest + Jest), 34+ synced user guides, GitHub Actions CI/CD deploying Docker Compose + Caddy auto-HTTPS + nightly Restic encrypted backups, and Fastlane/R8 mobile release automation.',
    ],
    stack: [
      'typescript',
      'graphql',
      'apollo 5',
      'prisma 7',
      'postgresql 17',
      'pg-boss',
      'refine 5',
      'ant design',
      'expo',
      'astro 7',
      'stripe',
      'seaweedfs',
      'docker',
      'caddy',
    ],
    url: '',
    metrics: '4-app clinical monorepo (31 modules, 191 Prisma models, 8,800+ tests) unifying web, mobile & ops',
    color: '#0d9488',
    visualType: 'dentist-system',
    caseStudy: {
      overview:
        'A production-grade multi-clinic dental practice management system (Bahmardi Dental) uniting four independent applications — a GraphQL API & outbox worker, a multi-role staff admin portal, a patient mobile app, and a zero-JS static public site — around one shared patient record from online booking and QR/GPS check-in to chairside charting, checkout, and post-op care.',
      problem:
        'Dental groups struggle with fragmented tools where patient intake, scheduling, clinical odontogram charting, sterilization compliance, billing, and follow-ups live in disconnected silos — causing missed medical alerts, unbooked accepted treatment plans, lost chair hours from late cancellations, and weak audit controls.',
      solution:
        'Built a tightly typed 4-app monorepo anchored by 31 GraphQL domain modules and 191 Prisma 7 models, a transactional pg-boss outbox worker, presigned SeaweedFS S3 object storage, 7-role RBAC with mandatory TOTP MFA, hash-chained audit logs, and automated Docker/Caddy/Restic and Fastlane delivery pipelines.',
      stats: [
        {
          value: '4 Apps',
          label: 'Clinical Monorepo',
          detail: 'API/Worker, Admin, Expo, Astro',
        },
        {
          value: '31 · 191',
          label: 'Modules · Models',
          detail: 'Apollo 5 + Prisma 7 + pg-boss',
        },
        {
          value: '8,800+',
          label: 'Auto Tests',
          detail: 'Vitest + Jest across 880 suites',
        },
        {
          value: '7 Roles',
          label: 'Clinic RBAC + MFA',
          detail: 'Hash-chained HIPAA audit trail',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'GraphQL API, Transactional Outbox & Object Storage',
          badge: 'Apollo 5 · Prisma 7 · pg-boss · SeaweedFS S3',
          summary:
            'One codebase running both the HTTP GraphQL server and a background worker across 31 clinical and operational modules.',
          bullets: [
            'Apollo Server 5 + Express 5 guarded by GraphQL Armor (depth, cost, alias & token limits), per-request DataLoaders, and Zod 4 validation.',
            'pg-boss outbox dispatcher polling outbox_events (FOR UPDATE SKIP LOCKED) for idempotent reminders, waitlist offers, pushes, and pdfmake PDFs (invoices, receipts, consents, prescriptions, perio & sterilization reports).',
            'Direct-to-SeaweedFS S3 presigned uploads verified via worker SHA-256 re-hashing and automated quarantine.',
          ],
        },
        {
          code: '02',
          title: 'Multi-Role Clinical & Operations Admin Portal',
          badge: 'Refine 5 · React 19 · Ant Design 5 · dnd-kit',
          summary:
            '54 milestones across 7 roles (Super Admin, Clinic Manager, Dentist, Hygienist, Assistant, Receptionist) sharing one Periwinkle design system.',
          bullets: [
            'Interactive odontogram tooth charting, rapid keyboard periodontal gum charting, frozen-fee treatment plans, imaging viewer with versioned drawing annotations & ZIP export, and drug/allergy-checked prescriptions.',
            'Day/week drag-to-resize scheduler, live waiting-room display, split-payment checkout, blind cash drawer counts, dual-manager step-up approvals, inventory lot recall ("Who had it"), sterilization spore tracking, and CSV data import.',
          ],
        },
        {
          code: '03',
          title: 'Patient Mobile App & Automated Store Release Pipeline',
          badge: 'Expo SDK 57 · Apollo Client 4 · Stripe RN · Fastlane',
          summary:
            'Cross-platform patient app sharing GraphQL types directly from backend SDL via codegen, plus family/guardian linking.',
          bullets: [
            'Slot-held appointment booking with red-flag triage, automated 15-minute waitlist chair-fill offers, QR/GPS/6-digit check-in, digital plan acceptance, post-op pain checks, and NPS surveys.',
            'Stripe payment sheet (Card, Apple Pay, Google Pay), biometric unlock (expo-local-authentication), Apple & Google Sign-In, direct FCM/APNs pushes, and Fastlane + R8/ProGuard release automation.',
          ],
        },
        {
          code: '04',
          title: 'HIPAA-Oriented Security, Static Site & Zero-Downtime Ops',
          badge: 'TOTP MFA · Astro 7 · Docker · Caddy · Restic',
          summary:
            'Defense-in-depth access control, tamper-evident auditing, zero-third-party public website, and automated encrypted server operations.',
          bullets: [
            'Argon2id hashing, mandatory staff TOTP MFA + AES-256-GCM secret sealing, break-glass emergency chart access, patient "Who viewed your record", and an append-only hash-chained audit log.',
            'Astro 7 public site with strict script-src self CSP and 34+ synced how-to guides (/docs), deployed via GitHub Actions to Docker Compose + Caddy HTTPS with nightly pg_dump + Restic encrypted off-server backups.',
          ],
        },
      ],
    },
  },
  freelance: {
    id: 'freelance',
    title: '30+ Commercial Platforms',
    subtitle: 'Mostaql Platform / Client Contracts (2020 – 2024)',
    description: [
      'Delivered 32 commercial software platforms on Mostaql with a 5.0/5.0 rating across 30 verified client reviews and repeat enterprise retainers.',
      'Dentist System: Monorepo clinical platform with GraphQL (Apollo Server), Prisma, PostgreSQL, Refine.dev, and Expo mobile.',
      'Care360: Multi-tenant telehealth ecosystem featuring NestJS, BullMQ queues, Radix UI, and video consultations.',
      'Enterprise POS: Offline-first desktop POS in C# / .NET (WPF) with asymmetric RSA cryptographic licensing.',
      'Implemented 10+ payment gateway integrations, 8+ automated web scrapers, and custom automation bots.',
    ],
    stack: [
      'typescript',
      'react',
      'nestjs',
      'graphql',
      'c#',
      'postgresql',
      'expo',
      'prisma',
      'bullmq',
      'docker',
      'woocommerce',
    ],
    url: 'https://mostaql.com/u/abdelkrime2055/reviews',
    metrics: '32 commercial projects shipped on Mostaql with 5.0/5.0 across 30 client reviews',
    color: '#f59e0b',
    visualType: 'mostaql-reviews',
    caseStudy: {
      overview:
        'Independent commercial software engineering through Mostaql (Hsoub) and direct retainers across Saudi Arabia, Egypt, Yemen, and Europe — delivering 32 production platforms spanning clinical monorepos, multi-tenant telehealth, offline desktop POS with RSA licensing, regional fintech payment gateways, and automation pipelines.',
      problem:
        'Businesses and technical founders often struggled with fragmented freelance deliverables — undocumented architectures, missing local MENA payment integrations, unreliable scrapers/bots, and operational software that failed offline or under real clinical and retail load.',
      solution:
        'Shipped end-to-end, production-hardened systems (typed GraphQL/NestJS monorepos, Docker + Caddy CI/CD with nightly encrypted backups, offline-first .NET WPF apps, and standalone WooCommerce fintech plugins) achieving a perfect 5.0/5.0 score across all 6 Mostaql evaluation criteria and repeat multi-project retainers.',
      stats: [
        {
          value: '5.0 / 5.0',
          label: 'Client Rating',
          detail: '30 verified 5★ reviews',
        },
        {
          value: '32',
          label: 'Completed Apps',
          detail: 'Mostaql & repeat retainers',
        },
        {
          value: '10+',
          label: 'Payment Gateways',
          detail: 'Floosak, Kuraimi, Jawal & more',
        },
        {
          value: '6 / 6',
          label: 'Perfect Metrics',
          detail: 'Quality, Delivery & Rehire',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'Dentist System (Bahmardi Dental) — Clinical Monorepo',
          badge: 'Apollo 5 · Prisma 7 · Refine 5 · Expo · Astro 7',
          summary:
            '4-app multi-clinic clinical suite (31 modules, 191 Prisma models, 8,800+ tests) unifying scheduling, chairside charting, mobile patient care, and automated ops.',
          bullets: [
            'Apollo GraphQL 5 + Prisma 7 + PostgreSQL 17 with a pg-boss transactional outbox worker, SeaweedFS S3 storage, and a Refine 5 + Ant Design 5 staff portal.',
            'Expo SDK 57 patient mobile app with GraphQL codegen, Stripe payments, biometric unlock, and Fastlane release automation, paired with an Astro 7 public site.',
            'Automated GitHub Actions CI/CD deploying via Docker Compose, Caddy HTTPS, and nightly Restic encrypted backups.',
          ],
        },
        {
          code: '02',
          title: 'Care360 — Multi-Tenant Telehealth Platform',
          badge: 'NestJS · BullMQ · Redis · Radix UI',
          summary:
            'Multi-clinic remote-care ecosystem built for reliable asynchronous workflows, scheduling, and real-time consultations.',
          bullets: [
            'Modular NestJS services backed by BullMQ + Redis queues for appointment reminders, billing events, and background jobs.',
            'Accessible Radix UI clinical portals integrated with real-time video consultation sessions.',
          ],
        },
        {
          code: '03',
          title: 'Enterprise Desktop POS & RSA Licensing',
          badge: 'C# · .NET WPF · RSA Crypto',
          summary:
            'Offline-first Windows desktop point-of-sale application engineered for zero-downtime retail operations and protected software distribution.',
          bullets: [
            'Asymmetric RSA cryptographic licensing engine with offline public-key signature verification and packaged Windows installer.',
            'Structured BDD test suite covering checkout, inventory, and license validation flows.',
          ],
        },
        {
          code: '04',
          title: 'Regional Payment Gateways, Scrapers & Bots',
          badge: 'WooCommerce · PHP · Node.js · Bots',
          summary:
            'High-reliability fintech plugins and data-automation tooling tailored for MENA commerce and operational workflows.',
          bullets: [
            'Built 10+ standalone payment gateway integrations — including regional wallets & banks (Floosak, Kuraimi, Jawal, Mihfadati, Shamil) for WooCommerce/WordPress.',
            'Engineered 8+ resilient web scrapers and custom WhatsApp/Telegram automation bots for real-time order and lead workflows.',
          ],
        },
      ],
    },
  },
  mouser: {
    id: 'mouser',
    title: 'Mouser — Open-Source KVM',
    subtitle: 'github.com/xnevz/mouser • Open Source (MIT / Community)',
    description: [
      'Open-source, local-network software KVM built in .NET 8, Avalonia, C++, and Kotlin to share mouse, keyboard, clipboard, and files across devices.',
      'VirtualKvmManager state machine drives seamless screen-edge crossing with absolute cursor coordinates, held-key release, and a 2-second watchdog failsafe.',
      'Protocol v2 security layer pairs devices via ephemeral ECDH P-256 + 6-digit SAS and encrypts 51-byte UDP input packets and TCP transfers with AES-256-GCM.',
      'Includes an Android Jetpack Compose companion (trackpad, gyroscope air mouse, media/numpad) and SQLCipher + FTS5 encrypted clipboard history (Win+Alt+V).',
    ],
    stack: [
      'c#',
      '.net 8',
      'avalonia',
      'c++',
      'kotlin',
      'aes-256-gcm',
      'sqlcipher',
      'ecdh p-256',
      'jetpack compose',
      'nextjs',
    ],
    url: 'https://github.com/xnevz/mouser',
    isOpenSource: true,
    metrics: 'Local-first software KVM sharing mouse, keyboard & clipboard with AES-256-GCM',
    color: '#10b981',
    visualType: 'mouser-kvm',
    caseStudy: {
      overview:
        'An open-source, community-built software KVM and multi-device control suite. Push your cursor past any screen edge to control another computer with zero drift, use your Android phone as a trackpad or gyroscope air mouse, search an encrypted clipboard history, and send files over your local network — with no accounts, no telemetry, and no cloud.',
      problem:
        'Multi-computer setups typically rely on bulky hardware KVM switches or cloud-tethered proprietary tools that introduce input lag, send clipboard data off-network, or lack mobile remote control and verifiable open-source cryptography.',
      solution:
        'Engineered a local-first .NET 8 + Avalonia desktop engine with a C++/CMake macOS native backend, a Kotlin/Jetpack Compose Android companion, and Protocol v2 cryptography (ephemeral P-256 ECDH pairing with 6-digit SAS + 51-byte AES-256-GCM UDP datagrams and 64-bit replay protection).',
      stats: [
        {
          value: '51 B UDP',
          label: 'AEAD Input',
          detail: 'Sub-ms AES-256-GCM packets',
        },
        {
          value: 'P-256 ECDH',
          label: 'Zero-Trust Pair',
          detail: '6-digit SAS + DPAPI keys',
        },
        {
          value: '0 Cloud',
          label: '100% Local LAN',
          detail: 'No accounts or telemetry',
        },
        {
          value: '4 Targets',
          label: 'Cross-Platform',
          detail: 'Win, macOS, Linux & Android',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'Virtual KVM & Low-Latency Input Engine',
          badge: 'C# · .NET 8 · Avalonia · C++ CMake',
          summary:
            'Deterministic screen-edge state machine driving absolute cursor positions across paired machines with zero input hooks active when idle.',
          bullets: [
            'VirtualKvmManager handles edge detection, directional return crossing, held-key/button release on switch, and a 2-second watchdog + Ctrl+Alt+Esc instant reclaim.',
            'Windows low-level hooks + SendInput paired with a custom C++/CMake macOS native library (libmouser_native) for cross-platform capture and injection.',
          ],
        },
        {
          code: '02',
          title: 'Protocol v2 Cryptography & LAN Networking',
          badge: 'ECDH P-256 · AES-256-GCM · UDP / TCP',
          summary:
            'Zero-trust local pairing and authenticated network transport designed to resist passive sniffing, MITM tampering, and packet replay.',
          bullets: [
            'Ephemeral NIST P-256 ECDH key exchange with out-of-band 6-digit Short Authentication String (SAS) verification and a 2-minute pairing window.',
            'Directional session keys (k_ab / k_ba) with 64-bit monotonic sequence counters, Windows DPAPI key storage at rest, and dedicated chaos/fuzz test suites.',
          ],
        },
        {
          code: '03',
          title: 'Encrypted Clipboard & File Streaming',
          badge: 'SQLCipher · FTS5 · TCP Streams',
          summary:
            'Searchable, privacy-filtered clipboard history and hardened peer-to-peer file transfers across paired workstations.',
          bullets: [
            'SQLCipher-encrypted SQLite FTS5 history with Win+Alt+V quick-paste popup, plus ClipboardPrivacyFilter skipping passwords, API keys, private keys, and cards.',
            'Master passphrase AppLock (PBKDF2/AES-GCM + Base32 recovery keys) and AES-256-GCM TCP file streaming with traversal sanitization and Mark-of-the-Web tagging.',
          ],
        },
        {
          code: '04',
          title: 'Android Companion & Open-Source Release CI',
          badge: 'Kotlin · Jetpack Compose · Next.js',
          summary:
            'Mobile remote control app paired with automated testing, multi-platform packaging, and a Next.js community download portal.',
          bullets: [
            'Android app provides multi-touch trackpad gestures, gyroscope air-mouse pointing, media/numpad controls, and UDP auto-discovery.',
            'Backed by Avalonia Headless UI tests, soak/perf benchmarks, GitHub Actions release packaging, and a Next.js download & interactive KVM demo site.',
          ],
        },
      ],
    },
  },
  meuble: {
    id: 'meuble',
    title: 'Meuble Platform — SaaS Commerce',
    subtitle: 'Multi-Market Furniture Store & Provisioning Platform',
    description: [
      'Architected a dual-repo SaaS furniture e-commerce platform (meuble-platform control plane + meuble-store storefront) supporting Arabic RTL, French, and English.',
      'Built a 10-step idempotent store provisioning engine (Neon/PostgreSQL, DigitalOcean droplets, Caddy HTTPS, signed internal bootstrap) driven by a DB job queue.',
      'Implemented automated custom domain verification with DNS/HTTPS probing, 2-minute droplet sync, zero-downtime Caddy reloads with rollback, and SSO handoff.',
      'Engineered server-computed whole-dinar billing, gapless yearly receipt numbers, AES-256-GCM encrypted SlickPay/CCP payment flows, and nightly reconciliation.',
      'Delivered Better Auth with 15-minute step-up auth, keyed-hash audit logs, and 8,700+ automated Vitest & Playwright tests across both repositories.',
    ],
    stack: [
      'nextjs 16',
      'react 19',
      'typescript',
      'prisma 7',
      'postgresql',
      'tailwind',
      'better-auth',
      'next-intl',
      'gsap',
      'playwright',
    ],
    url: '',
    metrics: 'Self-service SaaS furniture store platform with 10-step automated provisioning',
    color: '#e11d48',
    visualType: 'meuble-store',
    caseStudy: {
      overview:
        'A complete self-service SaaS platform for furniture merchants combining a public storefront product (meuble-store) with a control-plane business platform (meuble-platform). Merchants preview an interactive storefront, configure their brand in a 5-step onboarding wizard, pay via local CCP/SlickPay rails, and receive an isolated live furniture store with custom domain SSL automatically provisioned.',
      problem:
        'Local furniture retailers lacked an affordable, Arabic-first e-commerce solution with localized pricing, custom domain routing, and automated infrastructure — while manual store setup per client did not scale reliably or safely.',
      solution:
        'Designed a strictly separated control-plane (Next.js 16, React 19, Prisma 7, Better Auth) and isolated per-tenant storefront architecture linked via a signed internal API with nonce replay protection, a 10-step idempotent provisioning pipeline, and automated Caddy SSL domain sync.',
      stats: [
        {
          value: '10 Steps',
          label: 'Auto Provision',
          detail: 'Idempotent DB job pipeline',
        },
        {
          value: '8,700+',
          label: 'Auto Tests',
          detail: 'Vitest + Playwright E2E',
        },
        {
          value: 'AR · FR · EN',
          label: 'RTL-First i18n',
          detail: 'Logical CSS + next-intl',
        },
        {
          value: '2-Min Sync',
          label: 'Custom Domains',
          detail: 'Caddy HTTPS + rollback',
        },
      ],
      architecture: [
        {
          code: '01',
          title: '10-Step Idempotent Store Provisioning Engine',
          badge: 'Next.js 16 · Prisma 7 · DigitalOcean · Neon',
          summary:
            'DB-backed time-sliced job queue taking a paid merchant order all the way to a verified live furniture store.',
          bullets: [
            'Executes locking, database provisioning, droplet/hosting allocation, env/secrets injection, signed internal bootstrap, health verification, and store-ready email notification.',
            'Enforces concurrency caps, backoff retries, and safe suspend/resume with mandatory pre-suspend backups.',
          ],
        },
        {
          code: '02',
          title: 'Furniture Storefront & 5-Step Onboarding Wizard',
          badge: 'React 19 · Tailwind 4 · next-intl · GSAP',
          summary:
            'Arabic-first RTL storefront for furniture catalogs, variants, cart, and orders paired with a guided merchant setup wizard.',
          bullets: [
            '5-step onboarding wizard features atomic slug/domain reservation, Arabic transliteration, Algerian wilaya geo-detection, and live storefront preview.',
            'Interactive GSAP showcase and logical-CSS design system passing automated Lighthouse 100 accessibility and policy checks.',
          ],
        },
        {
          code: '03',
          title: 'Custom Domains & Signed Internal API',
          badge: 'Caddy HTTPS · JOSE SSO · Nonce Auth',
          summary:
            'Zero-touch custom domain onboarding and cryptographically verified cross-repo control-plane communication.',
          bullets: [
            'Single A-record buyer setup with automated DNS/HTTPS pinning probes and 2-minute droplet sync with Caddy reload rollback protection.',
            'Signed cross-repo internal endpoints with database nonce replay prevention and JOSE single-sign-on handoff tokens.',
          ],
        },
        {
          code: '04',
          title: 'Billing, Local Payments & Security Hardening',
          badge: 'Better Auth · AES-256-GCM · SlickPay · Vitest',
          summary:
            'Tamper-resistant local billing, step-up authentication, and comprehensive automated test coverage across both repositories.',
          bullets: [
            'Server-computed whole-dinar totals, gapless yearly receipt numbers, AES-256-GCM gateway secrets, and idempotent SlickPay/CCP settlement with nightly reconciliation.',
            'Better Auth with 15-minute step-up auth, keyed-hash audit trails, and 8,700+ unit, DB, policy, and Playwright E2E tests.',
          ],
        },
      ],
    },
  },
  algmath: {
    id: 'algmath',
    title: 'Algerian BAC Maths — 3AS PWA',
    subtitle: 'Trilingual Interactive Baccalaureate Math Platform (AR · FR · EN)',
    description: [
      'Built an offline-capable, static-first Next.js 16 PWA teaching the Algerian 3AS Baccalauréat maths curriculum (SE, M, TM streams) in Arabic RTL, French, and English.',
      'Engineered a Web Worker symbolic CAS & step-by-step solver (@cortex-js/compute-engine, mathjs) achieving 150/152 on golden BAC problems with a 3-valued equivalence checker.',
      'Developed interactive calculus visualizers (Limit Zoom, Continuity & TVI), a MathLive live equation editor, QuickCheck exercises, and the Limit Detective learning game.',
      'Designed a static MDX + KaTeX content pipeline with Pagefind offline full-text search, Service Worker + IndexedDB local progress, and a strict ~132 KiB gzip JS budget.',
      'Enforced host-portable Docker + PostgreSQL 17 deployment, logical CSS RTL checks, Playwright offline E2E suites, and Lighthouse CI across Light/Dark modes in all 3 locales.',
    ],
    stack: [
      'nextjs 16',
      'react 19',
      'typescript',
      'katex',
      'mathlive',
      'pwa',
      'compute-engine',
      'mdx',
      'pagefind',
      'playwright',
    ],
    url: '',
    metrics: 'Offline-first Next.js PWA teaching 3AS BAC maths in AR/FR/EN with a CAS worker',
    color: '#4f46e5',
    visualType: 'alg-math',
    caseStudy: {
      overview:
        'A static-first, installable, offline-capable Next.js PWA turning the Algerian 3AS Baccalauréat mathematics curriculum (12 chapters across Sciences Expérimentales, Mathématiques, and Techniques Mathématiques) into interactive visual animations, step-by-step symbolic solutions, exercises, and games — delivered in Arabic (RTL), French, and English for low-end mobile devices.',
      problem:
        'Algerian high-school students preparing for the national ONEC Baccalauréat exam rely heavily on static PDFs and fragmented videos that lack interactive mathematical intuition, step-by-step feedback, offline mobile reliability on 3G/4G, or synchronized trilingual terminology.',
      solution:
        'Built a static-prerendered Next.js 16 + React 19 PWA that keeps initial page payloads near ~132 KiB gzip while lazy-loading leaf interactive islands — a Web Worker CAS step engine, MathLive equation editor, custom SVG calculus visualizers, Pagefind offline search, and IndexedDB progress storage.',
      stats: [
        {
          value: '150 / 152',
          label: 'CAS Golden Suite',
          detail: 'Verified BAC step solver',
        },
        {
          value: 'AR · FR · EN',
          label: 'Trilingual RTL',
          detail: 'Logical CSS + LTR math',
        },
        {
          value: '12 Ch · 3AS',
          label: 'Full Syllabus',
          detail: 'SE, M & TM BAC streams',
        },
        {
          value: '~132 KiB',
          label: 'Offline PWA',
          detail: 'Static HTML + Pagefind',
        },
      ],
      architecture: [
        {
          code: '01',
          title: 'Web Worker Symbolic CAS & Step Engine',
          badge: 'Compute Engine · mathjs · Web Workers',
          summary:
            'Off-main-thread symbolic engine verifying student answers and generating Algerian Baccalauréat step-by-step proofs.',
          bullets: [
            'Covers limits, derivatives, integrals, equations, ODEs, complex numbers, and number theory — scoring 150/152 on the golden BAC benchmark suite.',
            'Three-valued equivalence checker (113/113 labeled pairs) respecting strict mathematical domains of definition.',
          ],
        },
        {
          code: '02',
          title: 'Interactive Calculus Visualizers, Editor & Games',
          badge: 'MathLive · KaTeX · Custom SVG',
          summary:
            'Purpose-built visual widgets and interactive drills that turn abstract 3AS theorems into intuitive geometric motion.',
          bullets: [
            'Includes Limit Zoom, Limits Explainer, and TVI Number-Line visualizers alongside a lazy-loaded MathLive equation editor.',
            'Interactive QuickCheck practice problems and the Limit Detective gamified chapter challenge for Chapter 01.',
          ],
        },
        {
          code: '03',
          title: 'Static-First MDX Pipeline & Offline PWA',
          badge: 'Next.js 16 · MDX · Pagefind · IndexedDB',
          summary:
            'Zero-CLS static HTML lessons engineered to stay fast on budget Android phones and remain usable completely offline.',
          bullets: [
            'Build-time MDX + remark-math + KaTeX rendering with post-build Pagefind full-text search index excluding internal KaTeX markup.',
            'Custom Service Worker offline caching and IndexedDB local-first progress tracking with optional cloud sync.',
          ],
        },
        {
          code: '04',
          title: 'Trilingual RTL Engineering & Quality Gates',
          badge: 'CSS Logical · Playwright · Lighthouse CI · Docker',
          summary:
            'Native Arabic (RTL), French, and English experience backed by automated layout, color, performance, and portability gates.',
          bullets: [
            'Logical CSS layout enforcement keeping mathematical notation strictly LTR inside RTL Arabic lessons.',
            'Host-portable standalone Docker + PostgreSQL 17 setup verified with Vitest, Playwright offline E2E, and Lighthouse CI across Light & Dark themes.',
          ],
        },
      ],
    },
  },
};
