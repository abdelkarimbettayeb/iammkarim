export type RoomZone = 'overview' | 'skills' | 'experience' | 'workstation' | 'contact';

export type CartridgeId = 'alnurayn' | 'freelance' | 'tastytracks';

export interface FlagItem {
  name: string;
  countryCode: string;
  fluency: string;
  nativeName: string;
}

export type SkillCategory = 'frontend' | 'backend' | 'database' | 'tools' | 'languages';

export interface TechSkillItem {
  name: string;
  level: number;
  color: string;
  iconPath: string;
  category: SkillCategory;
  description?: string;
}

export interface CartridgeProject {
  id: CartridgeId;
  title: string;
  subtitle: string;
  description: string[];
  stack: string[];
  url: string;
  metrics: string;
  color: string;
  image?: string;
}

export interface AchievementItem {
  title: string;
  number: string;
}

export interface RoomState {
  activeZone: RoomZone;
  activeCartridge: CartridgeId | null;
  isMuted: boolean;
  isDrawerOpen: boolean;
  isContactOpen: boolean;
  isNightMode: boolean;
  setActiveZone: (zone: RoomZone) => void;
  setActiveCartridge: (id: CartridgeId | null) => void;
  toggleMute: () => void;
  toggleDrawer: () => void;
  toggleContact: () => void;
  toggleNightMode: () => void;
}

