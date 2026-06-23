'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Instagram, Phone } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { YAHOO_FANTASY_URL } from '@/lib/fantasy';

type Status = 'idle' | 'submitting' | 'success' | 'fallback' | 'error';

const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted focus:border-accent focus:outline-none';

/**
 * Heroes Fantasy Football League signup. Posts to /api/fantasy/signup (→ Google
 * Sheet via Apps Script). If signup capture isn't configured yet, shows a
 * graceful "DM/call us" fallback so the form is never a dead end.
 */
export default function FantasySignupForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [mode, setMode] = useState<'join' | 'register'>('join');
  const [hostDraft, setHostDraft] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      contact: fd.get('contact'),
      mode,
      leagueName: fd.get('leagueName'),
      players: fd.get('players'),
      hostDraft: hostDraft ? 'yes' : 'no',
      draftDate: fd.get('draftDate'),
      message: fd.get('message'),
    };
    trackEvent('fantasy_signup_submit', { mode, hostDraft: hostDraft ? 1 : 0 });
    try {
      const res = await fetch('/api/fantasy/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) setStatus('success');
      else if (data.configured === false) setStatus('fallback');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 text-accent" size={40} />
        <h3 className="text-xl font-bold text-foreground">You’re in the game!</h3>
        <p className="mt-2 text-foreground/80">
          Thanks for signing up for the Heroes Fantasy Football League. We’ll reach out with the details —
          see you at the bar. 🏈🍻
        </p>
      </div>
    );
  }

  if (status === 'fallback') {
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-6 text-center">
        <h3 className="text-xl font-bold text-foreground">Almost there — let’s get you in</h3>
        <p className="mt-2 text-foreground/80">
          Online signups are opening shortly. To grab your spot now, message us or give us a call:
        </p>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="https://www.instagram.com/americanheroesandbrew/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-2.5 font-semibold text-white hover:bg-accent-dim">
            <Instagram size={18} /> DM @americanheroesandbrew
          </a>
          <a href="tel:7609940187"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-5 py-2.5 text-foreground hover:border-accent/40">
            <Phone size={18} /> (760) 994-0187
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-accent/30 bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">Your name *</span>
          <input name="name" required className={inputCls} placeholder="First & last" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">Email or phone *</span>
          <input name="contact" required className={inputCls} placeholder="So we can reach you" />
        </label>
      </div>

      <fieldset>
        <span className="mb-2 block text-sm font-medium text-foreground">How do you want in?</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {([
            ['join', 'Join an official Heroes league'],
            ['register', 'Register my own league'],
          ] as const).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setMode(val)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                mode === val ? 'border-accent bg-accent/10 text-foreground' : 'border-border text-foreground/80 hover:border-accent/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === 'register' && (
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">League name</span>
            <input name="leagueName" className={inputCls} placeholder="Your league" />
          </label>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground"># of players (if known)</span>
          <input name="players" type="number" min={2} max={20} className={inputCls} placeholder="e.g. 10" />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={hostDraft} onChange={(e) => setHostDraft(e.target.checked)}
          className="h-4 w-4 accent-[var(--accent)]" />
        <span className="text-sm text-foreground">I want to host my draft at American Heroes &amp; Brew (free munchies + big-screen draft)</span>
      </label>

      {hostDraft && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">Preferred draft date</span>
          <input name="draftDate" type="date" className={inputCls} />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Anything else?</span>
        <textarea name="message" rows={2} className={inputCls} placeholder="Questions or notes (optional)" />
      </label>

      {status === 'error' && (
        <p className="text-sm text-red-400">
          Something went wrong. Please try again, or DM us @americanheroesandbrew / call (760) 994-0187.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-dim disabled:opacity-60 sm:w-auto"
      >
        {status === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> Submitting…</> : 'Sign me up'}
      </button>
      <p className="text-xs text-muted">
        Free to join. Need a Yahoo league?{' '}
        <a href={YAHOO_FANTASY_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Set one up on Yahoo
        </a>{' '}first, then sign up here.
      </p>
    </form>
  );
}
