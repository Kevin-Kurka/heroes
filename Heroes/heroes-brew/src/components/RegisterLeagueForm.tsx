'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Instagram, Phone } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type Status = 'idle' | 'submitting' | 'success' | 'fallback' | 'error';
const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none';

/** Register your own league: commissioner name, league name, email, phone, draft date. */
export default function RegisterLeagueForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    trackEvent('fantasy_register_submit', {});
    try {
      const res = await fetch('/api/fantasy/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'register',
          name: fd.get('name'),
          leagueName: fd.get('leagueName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          draftDate: fd.get('draftDate'),
        }),
      });
      const data = await res.json();
      if (data.ok) setStatus('success');
      else if (data.configured === false) setStatus('fallback');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success')
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-5 text-center">
        <CheckCircle2 className="mx-auto mb-2 text-accent" size={36} />
        <h3 className="text-lg font-bold text-foreground">League registered!</h3>
        <p className="mt-1 text-sm text-foreground/80">We’ll confirm your draft at the bar (munchies + big screen) and your $100 prize eligibility by email.</p>
      </div>
    );

  if (status === 'fallback')
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-5 text-center">
        <p className="text-foreground/85">Online signups are opening shortly — register now by reaching out:</p>
        <div className="mt-3 flex flex-col gap-2">
          <a href="https://www.instagram.com/americanheroesandbrew/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2.5 font-semibold text-white hover:bg-accent-dim">
            <Instagram size={18} /> DM @americanheroesandbrew
          </a>
          <a href="tel:7609940187" className="inline-flex items-center justify-center gap-2 rounded-sm border border-border px-4 py-2.5 text-foreground">
            <Phone size={18} /> (760) 994-0187
          </a>
        </div>
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Commissioner name</span>
        <input name="name" required autoComplete="name" className={inputCls} placeholder="Your name" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">League name</span>
        <input name="leagueName" required className={inputCls} placeholder="Your league’s name" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@email.com" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Phone</span>
        <input name="phone" type="tel" required autoComplete="tel" className={inputCls} placeholder="(760) 555-0123" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Draft date (at the bar)</span>
        <input name="draftDate" type="date" required className={inputCls} />
      </label>
      {status === 'error' && (
        <p className="text-sm text-red-400">That didn’t go through. Try again, or DM @americanheroesandbrew / call (760) 994-0187.</p>
      )}
      <button type="submit" disabled={status === 'submitting'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dim disabled:opacity-60">
        {status === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> Registering…</> : 'Register my league'}
      </button>
    </form>
  );
}
