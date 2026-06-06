/**
 * Destinations + helpers for the "Leave a Review" dialog. Google/Yelp/Facebook
 * can't accept review text, a rating, or photos from a website, so the dialog
 * collects the review, copies the text to the clipboard, and opens the chosen
 * app's review composer for the user to paste into. Photos go through the native
 * share sheet (the only way to push an image to another app from the web).
 *
 * All public URLs — safe to keep here; swap a value if a listing URL changes.
 */
export const REVIEW_LINKS = {
  /** Our branded short link -> the verified Google listing ("Write a review"). */
  google: '/review',
  yelp: 'https://www.yelp.com/writeareview/biz/american-heroes-and-brew-carlsbad',
  facebook: 'https://www.facebook.com/AmericanHeroesAndBrew/reviews',
} as const;

export const REVIEW_PLATFORM_LABEL: Record<keyof typeof REVIEW_LINKS, string> = {
  google: 'Google',
  yelp: 'Yelp',
  facebook: 'Facebook',
};

/**
 * One-tap phrases that help people who don't want to type write a real review
 * fast. They append to (and are fully editable in) the text box — the reviewer
 * picks what's true for them; nothing is auto-submitted.
 */
export const REVIEW_PROMPTS = [
  'Killer burgers 🍔',
  'Best spot to watch the game 📺',
  'Great craft beer selection 🍺',
  'Awesome wings 🍗',
  'Friendly, fast service',
  'Fun game-day atmosphere',
  'Great weekend breakfast 🍳',
];
