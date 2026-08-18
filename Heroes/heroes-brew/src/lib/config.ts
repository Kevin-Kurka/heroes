/**
 * Site-wide display configuration.
 *
 * SHOW_PRICES gates every price shown on the customer-facing menu. The owner
 * asked to suppress prices on the website; flip this to `true` to restore them
 * everywhere at once (MenuCard, VariantGroupCard, MenuPageClient, menu JSON-LD).
 * Staff printable at /menu/printable does not read this flag and may still
 * show prices.
 */
export const SHOW_PRICES = false;

/**
 * Gates the QR-unlocked Secret Menu tab end-to-end. While `false`, the tab never
 * appears — not via the `?secret` QR link, not from a prior cached unlock — and
 * the lead-capture gate never opens. Flip to `true` once the secret menu items
 * are confirmed.
 */
export const SECRET_MENU_ENABLED = false;

const PRICE_TOKEN_RE = [
  // from $12 / starting at $12 — before bare $ amounts so "from" does not linger
  /\b(?:from|starting at)\s+\$?\d+(?:\.\d+)?/gi,
  // $4, $4ea, $4 ea, $2 off, $5 each
  /\$\s*\d+(?:\.\d+)?(?:\s*(?:ea|each|off))?/gi,
  // inline +2 / +6 meat upcharges
  /\s*\+\s*\d+(?:\.\d+)?/g,
  // drink size prices left in copy (Pitcher 30, Bottle 52)
  /\b(?:Pitcher|Bottle)\s+\d+(?:\.\d+)?/gi,
  // juice size prices (Short 4 / Tall 7)
  /\bShort\s+\d+(?:\.\d+)?\s*\/\s*Tall\s+\d+(?:\.\d+)?\.?/gi,
] as const;

function tidyStrippedCopy(text: string): string {
  return text
    .replace(/\s*[·•]\s*[·•]/g, ' · ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s*·\s*$/g, '')
    .replace(/^\s*·\s*/g, '')
    .replace(/\.\s*\./g, '.')
    .trim();
}

/**
 * Strip dollar amounts, "+N" upcharges, and "from $X" language from menu copy
 * when prices are hidden, so descriptions don't leak partial pricing. No-op
 * when prices are shown. Pass `showPrices` to test both modes.
 */
export function stripPriceTokens(text: string, showPrices: boolean = SHOW_PRICES): string {
  if (showPrices) return text;
  let next = text;
  for (const re of PRICE_TOKEN_RE) {
    next = next.replace(re, '');
  }
  return tidyStrippedCopy(next);
}
