import { UnifiedEvent } from '@/types';
import { SITE_URL } from '@/lib/structured-data';
import {
  eventCalendarTitle,
  formatEventWhen,
  buildInviteText,
  buildGoogleCalendarUrl,
} from '@/lib/calendar';

/**
 * Channel-specific share content for the "Let's Go" dialog. Every message is
 * built to *promote Heroes*: it carries the venue geotag, the site link, the
 * @handle, and hashtags, and it points at a /share landing page whose OG preview
 * is the branded matchup image — so a texted/tweeted link shows the game card.
 */

const HANDLE = '@americanheroesandbrew';
const GEOTAG = 'American Heroes & Brew · Carlsbad Village';
const HASHTAGS = [
  'AmericanHeroesAndBrew',
  'CarlsbadEats',
  'CarlsbadVillage',
  'SportsBar',
  'GameDay',
  'NorthCountySD',
];
const MAPS_URL =
  'https://www.google.com/maps/dir//American+Heroes+%26+Brew,+300+Carlsbad+Village+Dr+STE+120,+Carlsbad,+CA+92008';

/** Params that fully describe the matchup card (used by the OG image + landing). */
function imageParams(event: UnifiedEvent): URLSearchParams {
  const p = new URLSearchParams({ title: event.eventTitle, when: formatEventWhen(event) });
  if (event.awayTeam) p.set('away', event.awayTeam);
  if (event.homeTeam) p.set('home', event.homeTeam);
  if (event.awayLogo) p.set('aw', event.awayLogo);
  if (event.homeLogo) p.set('hm', event.homeLogo);
  if (event.league) p.set('league', event.league);
  return p;
}

/** Same-origin path to the matchup PNG; `social` bakes in hashtags/geotag/handle. */
export function buildEventImagePath(event: UnifiedEvent, social = false): string {
  const p = imageParams(event);
  if (social) p.set('social', '1');
  return `/api/og/event?${p.toString()}`;
}

/** Absolute URL of the per-event landing page (its OG preview is the card). */
export function buildShareLandingUrl(event: UnifiedEvent): string {
  const p = imageParams(event);
  p.set('ts', event.eventTimestamp);
  return `${SITE_URL}/share?${p.toString()}`;
}

/** Caption for image-first channels (Instagram/TikTok): promo-loaded, no link clutter up top. */
export function buildSocialCaption(event: UnifiedEvent): string {
  const matchup =
    event.awayTeam && event.homeTeam
      ? `${event.awayTeam} vs ${event.homeTeam}`
      : event.eventTitle;
  return [
    `${matchup} on the big screens at American Heroes & Brew`,
    `📅 ${formatEventWhen(event)}`,
    `📍 ${GEOTAG}`,
    SITE_URL.replace('https://', ''),
    `${HANDLE} ${HASHTAGS.map((h) => `#${h}`).join(' ')}`,
  ].join('\n');
}

export interface ShareContent {
  landingUrl: string;
  smsBody: string;
  emailSubject: string;
  emailBody: string;
  socialCaption: string;
  socialImagePath: string;
}

/** Build everything the dialog needs for one event. */
export function buildShareContent(event: UnifiedEvent): ShareContent {
  const landingUrl = buildShareLandingUrl(event);
  const invite = buildInviteText(event);
  const calendarUrl = buildGoogleCalendarUrl(event);

  const smsBody = `${invite}\n${landingUrl}`;

  const emailBody = [
    invite,
    '',
    `Details & add to calendar: ${landingUrl}`,
    `Add to your calendar: ${calendarUrl}`,
    `Directions: ${MAPS_URL}`,
  ].join('\n');

  return {
    landingUrl,
    smsBody,
    emailSubject: eventCalendarTitle(event),
    emailBody,
    socialCaption: buildSocialCaption(event),
    socialImagePath: buildEventImagePath(event, true),
  };
}

/** Fetch the matchup PNG as a File for the native share sheet (Instagram/TikTok). */
export async function fetchEventImageFile(event: UnifiedEvent, social = true): Promise<File | null> {
  try {
    const res = await fetch(buildEventImagePath(event, social));
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], `heroes-${event.id}.png`, { type: 'image/png' });
  } catch {
    return null;
  }
}
