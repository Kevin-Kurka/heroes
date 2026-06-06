import { MenuItem } from '@/types';

/**
 * The Secret Menu — off-menu, ask-only items unlocked via the QR code. Kept
 * server-side (imported only by the /api/secret-menu route, never the public
 * menu bundle) so the items don't appear in the page source until a guest
 * unlocks them.
 */
export const SECRET_MENU_NOTE = 'Off-menu — order by name. Tell your server you know the password. 🤫';

export const SECRET_MENU_ITEMS: MenuItem[] = [
  {
    id: 'secret-hail-mary',
    name: 'The Hail Mary',
    description: 'Triple smash patties, double bacon, beer cheese, crispy onion straws, toasted brioche.',
    price: 19,
  },
  {
    id: 'secret-overtime-nachos',
    name: 'Overtime Nachos',
    description: 'Smoked brisket, queso, pico, pickled jalapeños & crema — built for the whole table.',
    price: 16,
  },
  {
    id: 'secret-mvp-wings',
    name: 'MVP Wings',
    subtitle: 'HOT',
    description: 'Our hottest off-menu sauce: Carolina Reaper honey. Not for rookies.',
    price: 15,
  },
  {
    id: 'secret-two-minute-drill',
    name: '2-Minute Drill',
    description: 'Chorizo, egg & hash-brown breakfast burrito smothered in green chile. Weekends only.',
    price: 13,
  },
  {
    id: 'secret-the-audible',
    name: 'The Audible',
    subtitle: 'MKT',
    description: "Dealer's choice — tell the kitchen your wildest sandwich and they'll call the play.",
    price: 14,
  },
  {
    id: 'secret-sudden-death',
    name: 'Sudden Death',
    description: 'Ghost-pepper double burger. Finish it and you make the Wall of Fame. 🔥',
    price: 18,
  },
];
