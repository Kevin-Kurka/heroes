import { UnifiedEvent } from '@/types';
import { SITE_URL } from '@/lib/structured-data';
import { eventCalendarTitle, formatEventWhen, buildInviteText } from '@/lib/calendar';

/**
 * Channel-specific share content for the "Let's Go" dialog. Every message is
 * built to *promote Heroes*: it carries the venue geotag, the site link, the
 * @handle, and hashtags. The texted/emailed link is a short /g/<id> URL (kept
 * clean for the message) whose OG preview is the branded matchup image.
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
export const MAPS_URL =
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

/** Absolute 1080×1920 (9:16) Story image URL for an event — used by IG Story invites. */
export function buildEventStoryImageUrl(event: UnifiedEvent): string {
  const p = imageParams(event);
  p.set('social', '1');
  p.set('ratio', '9x16');
  return `${SITE_URL}/api/og/event?${p.toString()}`;
}

/** Short, clean per-event landing URL (e.g. .../g/mlb-746123). The page looks the
 *  game up from the live feed and its OG preview is the matchup card. */
export function buildShareLandingUrl(event: UnifiedEvent): string {
  return `${SITE_URL}/g/${encodeURIComponent(event.id)}`;
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

/** Build everything the dialog needs for one event. The link sits on its own
 *  labeled line ("Let's go 👉 <short url>") so the message reads clean — the
 *  landing page carries the add-to-calendar and directions buttons. */
export function buildShareContent(event: UnifiedEvent): ShareContent {
  const landingUrl = buildShareLandingUrl(event);
  const invite = buildInviteText(event);

  return {
    landingUrl,
    smsBody: `${invite}\nLet's go 👉 ${landingUrl}`,
    emailSubject: eventCalendarTitle(event),
    emailBody: `${invite}\n\nLet's go 👉 ${landingUrl}`,
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
