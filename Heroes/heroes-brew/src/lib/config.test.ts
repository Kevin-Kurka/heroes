import { describe, expect, it } from 'vitest';
import { SHOW_PRICES, publicMenuCopy, stripPriceTokens } from './config';

describe('stripPriceTokens', () => {
  it('leaves copy alone when prices are shown', () => {
    expect(stripPriceTokens('Kalua Pork Sliders $4ea · Modelo $3ea.', true)).toBe(
      'Kalua Pork Sliders $4ea · Modelo $3ea.',
    );
  });

  it('strips dollar amounts, ea, and off language', () => {
    expect(stripPriceTokens('Kalua Pork Sliders $4ea · Modelo, Ultra, Coors & Miller Lite $3ea.', false))
      .toBe('Kalua Pork Sliders · Modelo, Ultra, Coors & Miller Lite.');
    expect(stripPriceTokens('Village Tacos $4ea · All Tequila Cocktails $2 off · Industry Drafts or Wells $5ea (all day).', false))
      .toBe('Village Tacos · All Tequila Cocktails · Industry Drafts or Wells (all day).');
    expect(stripPriceTokens('Wings $6 off · Well Cocktails $6ea.', false)).toBe('Wings · Well Cocktails.');
    expect(stripPriceTokens('Friar Franks $6 · Heroes Drafts $2 off.', false)).toBe('Friar Franks · Heroes Drafts.');
    expect(stripPriceTokens('Drinks & Munchies $2 off.', false)).toBe('Drinks & Munchies.');
  });

  it('strips +N upcharges and from-$ language', () => {
    expect(stripPriceTokens('Cheddar/jack cheese, AHB Whiz. +2 Add Bacon.', false))
      .toBe('Cheddar/jack cheese, AHB Whiz. Add Bacon.');
    expect(stripPriceTokens('+1 Grilled Onions · +1 Grilled Mushrooms.', false))
      .toBe('Grilled Onions · Grilled Mushrooms.');
    expect(stripPriceTokens('Burgers from $18', false)).toBe('Burgers');
  });

  it('strips pitcher, bottle, and juice size prices without touching ABV', () => {
    expect(stripPriceTokens('4.2% ABV · Coors Brewing · Pitcher 30', false))
      .toBe('4.2% ABV · Coors Brewing');
    expect(stripPriceTokens('Monterey, California · Bottle 52', false))
      .toBe('Monterey, California');
    expect(stripPriceTokens('Short 4 / Tall 7. Orange, Pineapple, Apple, Cranberry, Grapefruit.', false))
      .toBe('Orange, Pineapple, Apple, Cranberry, Grapefruit.');
  });

  it('defaults to the site SHOW_PRICES flag (off for the public menu)', () => {
    expect(SHOW_PRICES).toBe(false);
    expect(stripPriceTokens('Wings $6 off')).toBe('Wings');
  });
});

describe('publicMenuCopy', () => {
  it('keeps Early Bird $22 / $5 deal prices on guest menu cards', () => {
    expect(publicMenuCopy('Two plates for $22. Friday–Sunday 9–11 AM.', 'Early Bird Weekend Breakfast'))
      .toBe('Two plates for $22. Friday–Sunday 9–11 AM.');
    expect(publicMenuCopy('$5 Screwdriver, Tequila Sunrise.', 'Breakfast Happy Hour'))
      .toBe('$5 Screwdriver, Tequila Sunrise.');
    expect(publicMenuCopy('Kalua Pork Sliders $4ea.', 'Mahalo Monday')).toBe('Kalua Pork Sliders.');
  });
});
