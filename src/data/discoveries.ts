import { roomStore } from '@/store/useRoomStore';
import { exploreStore } from '@/store/exploreStore';
import { achievements, languages, personalInfo } from './resumeData';
import type { ActiveStation } from '@/types/room';

/**
 * Everything worth finding in the room. Each find reveals one real fact from
 * the CV, and every entry can be jumped to from the discoveries list, so the
 * quest doubles as a table of contents.
 */
export interface Discovery {
  id: string;
  emoji: string;
  title: string;
  /** Shown before it's found */
  hint: string;
  /** Shown once found (and in the toast) */
  fact: string;
  /** What he says when he gets there (stations only) */
  line?: string;
  /** Jump straight to it */
  go: () => void;
}

const stat = (title: string) => achievements.find((a) => a.title === title)?.number ?? '';
const station = (s: ActiveStation) => () => roomStore.setActiveStation(s);

export const DISCOVERIES: Discovery[] = [
  {
    id: 'me',
    emoji: '👋',
    title: "That's me",
    hint: 'Say hi to the guy in the orange hoodie.',
    fact: `${personalInfo.name}: ${personalInfo.role}, ${personalInfo.experienceYears} years in.`,
    go: () => exploreStore.say(`Hi! I'm ${personalInfo.name.split(' ')[0]}. Click around, everything does something.`),
  },
  {
    id: 'desk',
    emoji: '🖥️',
    title: 'The workstation',
    hint: 'Where the code gets written.',
    fact: `${stat('Commercial Projects')} commercial projects shipped. The screen shows the case studies.`,
    line: 'My desk. Pick a project on the screen.',
    go: station('workstation'),
  },
  {
    id: 'cartridges',
    emoji: '🎮',
    title: 'Project cartridges',
    hint: 'Some games on the bookcase are not games.',
    fact: 'Each cartridge is a real project, from a C++ search engine to a telehealth platform.',
    go: () => roomStore.setActiveCartridge('jud'),
  },
  {
    id: 'skills',
    emoji: '🧩',
    title: 'Skill badges',
    hint: 'Shiny hexagons on the bookcase.',
    fact: 'TypeScript, React, Node.js, PostgreSQL, C++ and more. Every badge has a story in the resume.',
    go: () => exploreStore.openDrawer('skills'),
  },
  {
    id: 'couch',
    emoji: '🛋️',
    title: 'Reading chair',
    hint: 'The comfiest seat in the house.',
    fact: 'Sit down and the full resume opens.',
    line: "Grab a coffee. Here's the whole story.",
    go: station('couch'),
  },
  {
    id: 'flags',
    emoji: '🌍',
    title: 'Desk flags',
    hint: 'Three little flags on the desk.',
    fact: languages.map((l) => `${l.name} (${l.fluency.split(' ')[0].toLowerCase()})`).join(', ') + '.',
    line: languages.map((l) => l.nativeName).join(' · '),
    go: station('flags'),
  },
  {
    id: 'window',
    emoji: '🪟',
    title: 'The window',
    hint: 'Let some air in.',
    fact: `${personalInfo.availability}.`,
    line: 'Fresh air. Also: open to remote work and relocation.',
    go: station('window'),
  },
  {
    id: 'darts',
    emoji: '🎯',
    title: 'Dartboard',
    hint: 'Something round on the left wall.',
    fact: `${stat('Completion Rate')} project completion rate. I finish what I start.`,
    line: 'Aim small, miss small.',
    go: station('dartboard'),
  },
  {
    id: 'guitar',
    emoji: '🎸',
    title: 'The guitar',
    hint: 'Leaning against the wall, waiting to be played.',
    fact: 'Every developer needs an off switch.',
    line: 'Quick break between deploys.',
    go: station('guitar'),
  },
  {
    id: 'volleyball',
    emoji: '🏐',
    title: 'Volleyball',
    hint: 'Out on the lawn.',
    fact: 'Team player: set code-review standards and led delivery as a lead engineer.',
    line: 'Keep it up. Same as uptime.',
    go: station('volleyball'),
  },
  {
    id: 'portrait',
    emoji: '🖼️',
    title: 'Framed photo',
    hint: 'On the shelf under the name.',
    fact: `${stat('Master’s Class Standing')} of my Master’s class in Computer Science.`,
    go: () => exploreStore.openDrawer('education'),
  },
  {
    id: 'mailbox',
    emoji: '📬',
    title: 'Mailbox',
    hint: 'By the walkway. It takes messages.',
    fact: 'Messages go straight to my inbox.',
    go: () => {
      if (!roomStore.getState().isContactOpen) roomStore.toggleContact();
    },
  },
  {
    id: 'lamp',
    emoji: '💡',
    title: 'Desk lamp',
    hint: 'Click it and see what happens to the sky.',
    fact: 'Day or night, the room keeps working.',
    go: () => roomStore.toggleNightMode(),
  },
  {
    id: 'duck',
    emoji: '🦆',
    title: 'Rubber-duck debugging',
    hint: 'Someone is swimming in the pond.',
    fact: 'Every bug gets explained to the duck first. It sleeps at night.',
    go: () => exploreStore.say('The duck is out by the pond. Go say hi!'),
  },
  {
    id: 'cactus',
    emoji: '🌵',
    title: 'Office cactus',
    hint: 'Prickly, in the corner.',
    fact: 'Low maintenance, high uptime.',
    go: () => exploreStore.say('Careful, it bites. The cactus is in the corner.'),
  },
];

export const DISCOVERY_BY_ID = Object.fromEntries(DISCOVERIES.map((d) => [d.id, d]));

/** Stations the boy walks to -> the discovery they count as */
export const STATION_DISCOVERY: Partial<Record<ActiveStation, string>> = {
  workstation: 'desk',
  couch: 'couch',
  guitar: 'guitar',
  window: 'window',
  dartboard: 'darts',
  volleyball: 'volleyball',
  flags: 'flags',
};

/** Things he says when you click on him */
export const FUN_FACTS: string[] = [
  `${personalInfo.experienceYears} years of building software, and still having fun.`,
  `${stat('Commercial Projects')} commercial projects, ${stat('Client Satisfaction')} from clients.`,
  `${stat('Payment Gateways')} payment gateways integrated. Money moves, I make sure it lands.`,
  `${stat('Automated Web Scrapers')} automated scrapers built. The web is my database.`,
  'I wrote a C++ search addon that queries thousands of documents in milliseconds.',
  `Based in ${personalInfo.location}. ${personalInfo.availability}.`,
  'Try the drag: you can walk the camera all the way round the house.',
  'Psst, the duck falls asleep at night.',
];
