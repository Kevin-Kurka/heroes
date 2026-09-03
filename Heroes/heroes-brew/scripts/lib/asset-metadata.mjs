/**
 * Shared content-metadata embedder for American Heroes & Brew social assets.
 *
 * Every photo/video we generate for Instagram, Facebook, Google Business Profile,
 * etc. should carry rich, machine-readable metadata so it stays attributable,
 * geo-located, and *legible to AI + search engines* as we keep producing content
 * (see AI_DOMINANCE_PLAYBOOK.md — entity authority + freshness). This writes a
 * standardized IPTC/XMP/EXIF (images) and XMP/QuickTime (video) block via
 * exiftool: title, AI-friendly description, keywords, creator, copyright, the
 * Carlsbad Village location + GPS, and a source URL back to the site.
 *
 * Note on platforms: Instagram re-encodes uploads and strips most file metadata,
 * but (a) the site-hosted copies under /public retain it for crawlers/AI, (b)
 * Google Business Profile + Google Images preserve more, and (c) the local master
 * library stays self-describing and searchable. The embedded description also
 * mirrors the caption so the asset itself states what it is and who made it.
 *
 * Requires exiftool on PATH (`brew install exiftool`).
 *
 * Use as a library:  import { embedMetadata, deriveMetadata } from './asset-metadata.mjs'
 * Or via the sweep:  node scripts/stamp-content-metadata.mjs
 */
import { execFileSync } from 'node:child_process';
import { basename, extname } from 'node:path';

// ─── Business identity (single source of truth for asset attribution) ──────────
export const BUSINESS = {
  name: 'American Heroes & Brew',
  url: 'https://americanheroesandbrew.com',
  creator: 'American Heroes & Brew',
  copyright: `© ${new Date().getFullYear()} American Heroes & Brew`,
  city: 'Carlsbad',
  sublocation: 'Carlsbad Village',
  state: 'CA',
  country: 'United States',
  countryCode: 'US',
  // From src/lib/menu.ts getRestaurantInfo()
  latitude: 33.1592675,
  longitude: -117.3502525,
  software: 'American Heroes & Brew content pipeline',
  marker: 'AHB-META-v1', // written to XMP:Label for idempotency/traceability
};

const BASE_KEYWORDS = [
  'American Heroes & Brew',
  'sports bar',
  'Carlsbad',
  'Carlsbad Village',
  'North County San Diego',
  'restaurant',
];

// ─── Per-asset descriptors ─────────────────────────────────────────────────────
// Daily-special render keys (scratch-render.mjs / slot-render.mjs / render.mjs).
const SPECIALS = {
  mahalo: {
    title: 'Mahalo Monday at American Heroes & Brew',
    desc: 'Mahalo Monday — Kalua pork sliders $4 each and select cans $3 at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village.',
    keywords: ['Mahalo Monday', 'daily specials', 'sliders', 'happy hour Carlsbad'],
  },
  taco: {
    title: 'Taco Tuesday at American Heroes & Brew',
    desc: 'Taco Tuesday — Village tacos $4 each and $2 off tequila at American Heroes & Brew in Carlsbad Village. Every game on 16 TVs.',
    keywords: ['Taco Tuesday', 'tacos Carlsbad', 'daily specials', 'tequila'],
  },
  wings: {
    title: 'Wings & Wells Wednesday at American Heroes & Brew',
    desc: 'Wings & Wells Wednesday — wings $6 off and well cocktails $6 at American Heroes & Brew, Carlsbad Village sports bar.',
    keywords: ['Wing Wednesday', 'wings Carlsbad', 'daily specials', 'happy hour'],
  },
  burgers: {
    title: 'Thirsty Thursday Burgers at American Heroes & Brew',
    desc: 'Thirsty Thursday — all burgers $5 off and select drafts $5 at American Heroes & Brew in Carlsbad Village.',
    keywords: ['burgers Carlsbad', 'Thirsty Thursday', 'daily specials', 'craft beer'],
  },
  funday: {
    title: 'Friday Funday Happy Hour at American Heroes & Brew',
    desc: 'Friday Funday — 1–4PM, drinks & apps $2 off at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village.',
    keywords: ['Friday Funday', 'happy hour Carlsbad', 'daily specials'],
  },
  gameday: {
    title: 'Every Game on 16 TVs at American Heroes & Brew',
    desc: 'Watch every game on 16 TVs — NFL, NBA, college football, and UFC — at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village.',
    keywords: ['watch the game Carlsbad', 'NFL', 'UFC', 'game day', 'sports bar near LEGOLAND'],
  },
  watch: {
    title: 'Your Seat Awaits — Watch the Game in Carlsbad',
    desc: 'Every game, big screens, cold beer at American Heroes & Brew in Carlsbad Village — the spot to watch the game in Carlsbad.',
    keywords: ['watch the game Carlsbad', 'sports bar', 'game day', 'Carlsbad Village'],
  },
  fantasy: {
    title: 'Fantasy Football HQ at American Heroes & Brew',
    desc: 'Draft your fantasy football league at American Heroes & Brew in Carlsbad Village — apps on us. Football is back.',
    keywords: ['fantasy football', 'NFL', 'draft party Carlsbad', 'sports bar'],
  },
  philly: {
    title: 'The Philly Cheesesteak at American Heroes & Brew',
    desc: 'The only authentic Philly cheesesteak in Carlsbad — Amoroso rolls flown in from Philadelphia — at American Heroes & Brew in Carlsbad Village.',
    keywords: ['Philly cheesesteak Carlsbad', 'cheesesteak', 'best cheesesteak'],
  },
  breakfast: {
    title: 'Weekend Brunch at American Heroes & Brew',
    desc: 'Weekend brunch Friday–Sunday at American Heroes & Brew — the only sports bar in Carlsbad Village serving brunch. Chilaquiles brunch special and bottomless mimosas.',
    keywords: ['breakfast Carlsbad Village', 'brunch', 'bottomless mimosas', 'weekend breakfast'],
  },
};

// Sports/brand acronyms that should stay uppercase after title-casing.
const ACRONYMS = new Set(['UFC', 'NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'CFB', 'USA', 'UEFA', 'PPV', 'AHB', 'PGA', 'NCAA', 'HQ']);
// Smushed-token fixes for slugs that lack separators.
const WORD_FIXES = { worldcup: 'World Cup', southkorea: 'South Korea', socal: 'SoCal' };

/** Title-case a slug like "padres-dodgers" → "Padres Dodgers", keeping acronyms upper. */
function humanize(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => {
      const lower = w.toLowerCase();
      if (WORD_FIXES[lower]) return WORD_FIXES[lower];
      if (ACRONYMS.has(w.toUpperCase())) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ')
    .trim();
}

/**
 * Infer {title, description, keywords} from a generated asset's filename.
 * Falls back to a generic brand descriptor for anything unrecognized.
 */
export function deriveMetadata(filePath) {
  const name = basename(filePath, extname(filePath));

  // Daily-special videos: <key>-scratcher | <key>-slot | <key>-foodporn | <key>-N
  const specialMatch = name.match(/^([a-z]+)(?:-(?:scratcher|slot|foodporn|menu|\d+))?$/);
  if (specialMatch && SPECIALS[specialMatch[1]]) {
    const s = SPECIALS[specialMatch[1]];
    return { title: s.title, description: s.desc, keywords: [...BASE_KEYWORDS, ...s.keywords] };
  }

  // Watch-party videos: AHB-watchparty_usa-australia
  const wp = name.match(/watchparty[_-](.+)/i);
  if (wp) {
    const matchup = humanize(wp[1]).replace(/\s+/, ' vs ');
    return {
      title: `Watch ${matchup} at American Heroes & Brew`,
      description: `Watch party for ${matchup} at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village — every game on 16 TVs.`,
      keywords: [...BASE_KEYWORDS, 'watch party', 'World Cup', matchup, 'watch the game Carlsbad'],
    };
  }

  // Event posters: event-padres-dodgers, event-ufc-white-house, event-fathers-day
  const ev = name.match(/^event-(.+)/);
  if (ev) {
    const label = humanize(ev[1]);
    return {
      title: `${label} at American Heroes & Brew`,
      description: `${label} at American Heroes & Brew — the family-friendly sports bar in Carlsbad Village. Every game on 16 TVs, full menu and bar.`,
      keywords: [...BASE_KEYWORDS, label, 'watch the game Carlsbad', 'event'],
    };
  }

  // Foodporn / menu item videos: burgers-foodporn, philly-billy-cheesesteak-menu
  if (/cheesesteak|philly/i.test(name)) {
    return { title: SPECIALS.philly.title, description: SPECIALS.philly.desc, keywords: [...BASE_KEYWORDS, ...SPECIALS.philly.keywords] };
  }
  if (/burger/i.test(name)) {
    const s = SPECIALS.burgers;
    return { title: 'Burgers at American Heroes & Brew', description: 'Juicy all-American burgers at American Heroes & Brew, the family-friendly sports bar in Carlsbad Village.', keywords: [...BASE_KEYWORDS, 'burgers Carlsbad', ...s.keywords.slice(0, 2)] };
  }

  // Generic brand fallback.
  return {
    title: 'American Heroes & Brew — Carlsbad Village Sports Bar',
    description: 'American Heroes & Brew is a family-friendly sports bar and restaurant in Carlsbad Village — 16 TVs, an all-American menu, the only Philly cheesesteak in town, and weekend breakfast.',
    keywords: [...BASE_KEYWORDS, 'watch the game Carlsbad', 'family-friendly', 'near LEGOLAND'],
  };
}

/** Build the exiftool argument list for one asset's metadata. */
function buildArgs(meta) {
  const kw = Array.from(new Set(meta.keywords)).join(', ');
  const args = [
    '-overwrite_original',
    '-m', // ignore minor warnings (e.g. tags not valid for a given format)
    '-sep', ', ', // split the keyword string into a replaced list
    // Title / headline
    `-XMP-dc:Title=${meta.title}`,
    `-IPTC:ObjectName=${meta.title}`,
    `-XMP-photoshop:Headline=${meta.title}`,
    `-QuickTime:Title=${meta.title}`,
    // Description / caption (the AI-readable "what is this")
    `-XMP-dc:Description=${meta.description}`,
    `-IPTC:Caption-Abstract=${meta.description}`,
    `-EXIF:ImageDescription=${meta.description}`,
    `-QuickTime:Comment=${meta.description}`,
    `-QuickTime:Description=${meta.description}`,
    // Keywords / subject
    `-XMP-dc:Subject=${kw}`,
    `-IPTC:Keywords=${kw}`,
    `-QuickTime:Keywords=${kw}`,
    // Creator / attribution
    `-XMP-dc:Creator=${BUSINESS.creator}`,
    `-IPTC:By-line=${BUSINESS.creator}`,
    `-EXIF:Artist=${BUSINESS.creator}`,
    `-QuickTime:Artist=${BUSINESS.creator}`,
    `-QuickTime:Author=${BUSINESS.creator}`,
    // Copyright
    `-XMP-dc:Rights=${BUSINESS.copyright}`,
    `-IPTC:CopyrightNotice=${BUSINESS.copyright}`,
    `-EXIF:Copyright=${BUSINESS.copyright}`,
    `-QuickTime:Copyright=${BUSINESS.copyright}`,
    // Source / credit back to the site
    `-XMP-photoshop:Credit=${BUSINESS.name}`,
    `-XMP-photoshop:Source=${BUSINESS.url}`,
    `-IPTC:Credit=${BUSINESS.name}`,
    `-IPTC:Source=${BUSINESS.url}`,
    // Location
    `-XMP-photoshop:City=${BUSINESS.city}`,
    `-IPTC:City=${BUSINESS.city}`,
    `-XMP-iptcCore:Location=${BUSINESS.sublocation}`,
    `-IPTC:Sub-location=${BUSINESS.sublocation}`,
    `-XMP-photoshop:State=${BUSINESS.state}`,
    `-IPTC:Province-State=${BUSINESS.state}`,
    `-XMP-photoshop:Country=${BUSINESS.country}`,
    `-IPTC:Country-PrimaryLocationName=${BUSINESS.country}`,
    `-XMP-iptcCore:CountryCode=${BUSINESS.countryCode}`,
    // GPS (images via EXIF GPS; exiftool sets refs from sign automatically)
    `-EXIF:GPSLatitude=${BUSINESS.latitude}`,
    `-EXIF:GPSLatitudeRef=${BUSINESS.latitude >= 0 ? 'N' : 'S'}`,
    `-EXIF:GPSLongitude=${BUSINESS.longitude}`,
    `-EXIF:GPSLongitudeRef=${BUSINESS.longitude >= 0 ? 'E' : 'W'}`,
    `-XMP:GPSLatitude=${BUSINESS.latitude}`,
    `-XMP:GPSLongitude=${BUSINESS.longitude}`,
    // Video GPS (ISO-6709, e.g. "+33.1593-117.3503/")
    `-QuickTime:GPSCoordinates=${(BUSINESS.latitude >= 0 ? '+' : '') + BUSINESS.latitude.toFixed(4)}${(BUSINESS.longitude >= 0 ? '+' : '') + BUSINESS.longitude.toFixed(4)}/`,
    // Tooling + idempotency marker
    `-XMP-xmp:CreatorTool=${BUSINESS.software}`,
    `-EXIF:Software=${BUSINESS.software}`,
    `-XMP-xmp:Label=${BUSINESS.marker}`,
  ];
  return args;
}

/** True if the asset already carries our metadata marker. */
export function isStamped(filePath) {
  try {
    const out = execFileSync('exiftool', ['-s3', '-XMP-xmp:Label', filePath], {
      encoding: 'utf8',
    }).trim();
    return out === BUSINESS.marker;
  } catch {
    return false;
  }
}

/**
 * Embed standardized metadata into one asset (image or video).
 * @param {string} filePath
 * @param {object} [override] - partial {title, description, keywords} to override the derived values.
 * @returns {{file:string, title:string, derived:boolean}}
 */
export function embedMetadata(filePath, override = {}) {
  const derived = deriveMetadata(filePath);
  const meta = {
    title: override.title ?? derived.title,
    description: override.description ?? derived.description,
    keywords: override.keywords
      ? [...BASE_KEYWORDS, ...override.keywords]
      : derived.keywords,
  };
  execFileSync('exiftool', [...buildArgs(meta), filePath], { stdio: ['ignore', 'ignore', 'pipe'] });
  return { file: basename(filePath), title: meta.title };
}
