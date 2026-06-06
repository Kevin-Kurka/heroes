/**
 * Site-wide display configuration.
 *
 * SHOW_PRICES gates every price shown on the customer-facing menu. The owner
 * asked to suppress prices on the website; flip this to `true` to restore them
 * everywhere at once (MenuCard, VariantGroupCard, MenuPageClient).
 */
export const SHOW_PRICES = true;

/**
 * Gates the QR-unlocked Secret Menu tab end-to-end. While `false`, the tab never
 * appears — not via the `?secret` QR link, not from a prior cached unlock — and
 * the lead-capture gate never opens. Flip to `true` once the secret menu items
 * are confirmed.
 */
export const SECRET_MENU_ENABLED = false;

/**
 * Strip inline "+N" upcharge tokens (e.g. "Add Carnitas +3") from menu copy when
 * prices are hidden, so descriptions don't leak partial pricing. No-op when
 * prices are shown.
 */
export function stripPriceTokens(text: string): string {
  return SHOW_PRICES ? text : text.replace(/\s*\+\d+/g, '');
}
