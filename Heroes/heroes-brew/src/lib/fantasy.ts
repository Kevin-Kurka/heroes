/**
 * "Heroes Fantasy Football League" program content for /fantasy-football.
 *
 * MVP (no Yahoo API): an info + signup hub. Customers can JOIN an official Heroes
 * league OR REGISTER their own league; both get prize eligibility + draft-at-Heroes
 * perks. Signup is a native on-site form that posts to /api/fantasy/signup, which
 * forwards to a Google Apps Script Web App (env FANTASY_SIGNUP_URL) that appends to
 * a Sheet + emails the owner — same pattern as the promos pipeline. Yahoo is
 * link-out only (their API can't create/join leagues). See
 * docs/fantasy-football-signup-setup.md for the Apps Script.
 */

export const YAHOO_FANTASY_URL = 'https://football.fantasysports.yahoo.com/';

export const FANTASY = {
  title: 'Heroes Fantasy Football League',
  tagline: 'Draft at the bar. Win a $100 gift card. Watch every game where you signed up.',
  intro: [
    'American Heroes & Brew is running a Fantasy Football League for the season — and you’re invited. Whether you want to jump into an official Heroes league or bring your own crew, we’ve got prizes, draft-day perks, and every game on 16 TVs all season long.',
    'Free to join — we cover the prize. Sign up below and we’ll be in touch with the details.',
  ],

  // The two ways in (user chose: support both).
  models: [
    {
      key: 'join',
      title: 'Join an Official Heroes League',
      body:
        'Solo or with a few friends? Hop into one of our official Heroes leagues — we’ll place you in a league, set the draft, and get you playing. Perfect if you don’t have a league yet.',
    },
    {
      key: 'register',
      title: 'Register Your Own League',
      body:
        'Already a commissioner? Register your league with Heroes to qualify for the prize and unlock the draft-at-the-bar perks for your crew. Run your league however you like — we just make draft day legendary.',
    },
  ],

  // Perks / rules (stated plainly; the $100 claim condition is explicit).
  perks: [
    {
      icon: 'trophy',
      title: '$100 gift card to the winner',
      body:
        'Each registered league’s champion wins a $100 American Heroes & Brew gift card. Winners must claim it in person at the bar on championship day.',
    },
    {
      icon: 'wings',
      title: 'Draft at Heroes = free munchies',
      body:
        'Commissioners who host their draft at American Heroes & Brew get draft-day munchies on us. Gather your league, grab a table, and draft over wings and cold beer.',
    },
    {
      icon: 'tv',
      title: 'Your draft on the big screen',
      body:
        'Hosting your draft here? We’ll stream it live on one of our TVs so the whole bar can feel the picks (and the reaches). Live drafts hit different on the big screen.',
    },
  ],

  // Yahoo link-out + how-to (API can't create/join, so we guide + link).
  yahoo: {
    intro:
      'We run on Yahoo Fantasy — it’s free and easy. Here’s how to get set up, then come back and sign up with us to lock in your prize eligibility and draft perks.',
    steps: [
      'Create a free Yahoo Fantasy Football league (or join your existing one) at football.fantasysports.yahoo.com.',
      'Set your draft date — and pick American Heroes & Brew as your draft spot to get the munchies + big-screen draft.',
      'Come back here and fill out the signup form so we can register your league for the $100 prize and reserve your draft.',
    ],
  },

  faqs: [
    {
      question: 'How do I join the Heroes Fantasy Football League?',
      answer:
        'Sign up on this page. You can either join an official American Heroes & Brew league or register your own league. It’s free — we cover the prize. We’ll follow up with the details after you sign up.',
    },
    {
      question: 'What does the winner get?',
      answer:
        'Each registered league’s champion wins a $100 American Heroes & Brew gift card. The winner must be present in person at the bar on championship day to claim it.',
    },
    {
      question: 'Can my league draft at American Heroes & Brew?',
      answer:
        'Yes — that’s the best part. Commissioners who host their draft at American Heroes & Brew get free draft munchies, and we’ll stream the live draft on one of our TVs. Reserve your draft date on the signup form.',
    },
    {
      question: 'Is there an entry fee?',
      answer:
        'No. The Heroes Fantasy Football League is free to join — American Heroes & Brew provides the prize. Just sign up.',
    },
    {
      question: 'Do I need a Yahoo account?',
      answer:
        'Yes — our leagues run on Yahoo Fantasy Football, which is free. Create or join a league at football.fantasysports.yahoo.com, then sign up here so we can register it for the prize and draft perks.',
    },
  ],
};
