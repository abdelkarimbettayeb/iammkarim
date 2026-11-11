export type RoomZone = 'overview' | 'skills' | 'experience' | 'workstation' | 'contact';

export type ActiveStation = 'none' | 'workstation' | 'guitar' | 'couch' | 'window' | 'dartboard' | 'volleyball' | 'flags';

export type CharacterState = 'spawning' | 'walking' | 'waving' | 'idle' | 'interacting' | 'autonomous_idle';

export type WeatherState = 'clear' | 'rain' | 'snow';

export type CartridgeId = 'jud' | 'alnurayn' | 'freelance' | 'tastytracks';

export interface FlagItem {
  name: string;
  countryCode: string;
  fluency: string;
  nativeName: string;
}

export type SkillCategory = 'frontend' | 'backend' | 'database' | 'tools' | 'languages' | 'systems' | 'ai';

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

export interface WorkExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  type: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  location: string;
  period: string;
  honors: string;
}

export interface AchievementItem {
  title: string;
  number: string;
}

export interface RoomState {
  activeZone: RoomZone;
  activeCartridge: CartridgeId | null;
  activeStation: ActiveStation;
  characterState: CharacterState;
  weatherState: WeatherState;
  dartsLeft: number;
  isWindowOpen: boolean;
  isMuted: boolean;
  isDrawerOpen: boolean;
  isContactOpen: boolean;
  isNightMode: boolean;
  stationNonce: number;
  isGuitarHeld: boolean;
  setActiveZone: (zone: RoomZone) => void;
  setActiveCartridge: (id: CartridgeId | null) => void;
  setActiveStation: (station: ActiveStation) => void;
  setGuitarHeld: (held: boolean) => void;
  setCharacterState: (state: CharacterState) => void;
  setWeatherState: (weather: WeatherState) => void;
  decrementDarts: () => void;
  resetDarts: () => void;
  toggleWindow: (forceOpen?: boolean) => void;
  toggleMute: () => void;
  toggleDrawer: () => void;
  toggleContact: () => void;
  toggleNightMode: () => void;
}
