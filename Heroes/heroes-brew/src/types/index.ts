// =====================
// Unified Event Types
// =====================
export type EventType = 'SPORTS' | 'HOLIDAY';
export type SportLeague = 'MLB' | 'NFL' | 'NBA';

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
  status?: string;
  isLive?: boolean;
  highlighted?: boolean;
}

// =====================
// Toast Menu Types
// =====================
export interface ToastMenuItem {
  guid: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  calories?: number;
  modifierGroups?: ToastModifierGroup[];
}

export interface ToastModifierGroup {
  guid: string;
  name: string;
  modifiers: ToastModifier[];
  minSelections?: number;
  maxSelections?: number;
}

export interface ToastModifier {
  guid: string;
  name: string;
  price: number;
}

export interface ToastMenuGroup {
  guid: string;
  name: string;
  description?: string;
  items: ToastMenuItem[];
}

export interface ToastMenu {
  guid: string;
  name: string;
  groups: ToastMenuGroup[];
}

// =====================
// Toast Restaurant Types
// =====================
export interface ToastRestaurant {
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
