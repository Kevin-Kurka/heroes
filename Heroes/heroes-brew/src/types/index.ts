// =====================
// Unified Event Types
// =====================
export type EventType = 'SPORTS' | 'HOLIDAY';
export type SportLeague = 'MLB' | 'NFL' | 'NBA' | 'NHL' | 'MLS' | 'CFB';

export interface UnifiedEvent {
  id: string;
  eventTimestamp: string;
  eventTitle: string;
  eventType: EventType;
  league?: SportLeague;
  displayMessage: string;
  venue?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  homeLogo?: string;
  awayLogo?: string;
  status?: string;
  isLive?: boolean;
  highlighted?: boolean;
  emoji?: string;
  holidayTheme?: string;
}

// =====================
// Menu Types
// =====================
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  calories?: number;
}

export interface MenuGroupAddOn {
  name: string;
  price: string;
  description?: string;
}

export interface MenuGroupChoice {
  label: string;
  options: string[];
}

export interface MenuGroup {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  displayMode?: 'cards' | 'variants';
  basePrice?: number;
  addOns?: MenuGroupAddOn[];
  choices?: MenuGroupChoice[];
}

export interface Menu {
  id: string;
  name: string;
  groups: MenuGroup[];
}

// =====================
// Restaurant Types
// =====================
export interface Restaurant {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateCode: string;
  zipCode: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  hours: DaySchedule[];
}

export interface DaySchedule {
  dayOfWeek: string;
  open: string;
  close: string;
}

// =====================
// Navigation
// =====================
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
