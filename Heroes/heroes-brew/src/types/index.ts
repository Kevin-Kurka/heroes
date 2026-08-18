// =====================
// Unified Event Types
// =====================
export type EventType = 'SPORTS' | 'HOLIDAY';
export type SportLeague = 'MLB' | 'NFL' | 'NBA' | 'NHL' | 'MLS' | 'CFB' | 'WORLDCUP';

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
  homeColor?: string; // team primary brand color (hex) — used for marquee gradient
  awayColor?: string;
  homeAltColor?: string; // team secondary color — used for marquee text (contrasts primary)
  awayAltColor?: string;
  status?: string;
  isLive?: boolean;
  highlighted?: boolean;
  /**
   * Emphasis tier for content/marketing. MARQUEE = headline draw (followed team,
   * Monday Night Football, or a championship); LOCAL = any other local-team game.
   * Best-effort on the website; the sheet's manual "Marquee" tag is authoritative
   * for what becomes a designed Feed post vs an auto Story invite.
   */
  tier?: 'MARQUEE' | 'LOCAL';
  /** Promo/preview image for this event (auto matchup art) — shown on the card. */
  posterUrl?: string;
  emoji?: string;
  holidayTheme?: string;
}

// =====================
// Menu Types
// =====================
export interface MenuItem {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  /** Staff-only. Public /menu never renders this (see SHOW_PRICES). */
  price?: number;
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
  displayMode?: 'cards' | 'variants' | 'starters';
  /** Honest plate photo for the group (single-item cards, nachos, drafts, etc.). */
  imageUrl?: string;
  /** Staff-only. Public /menu never renders this (see SHOW_PRICES). */
  basePrice?: number;
  addOns?: MenuGroupAddOn[];
  addOnLabel?: string;
  mods?: MenuGroupAddOn[];
  choices?: MenuGroupChoice[];
  subGroups?: MenuGroup[];
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
// Instagram
// =====================
export interface InstagramPost {
  id: string;
  caption?: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  like_count?: number;
  comments_count?: number;
}

// =====================
// Navigation
// =====================
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
