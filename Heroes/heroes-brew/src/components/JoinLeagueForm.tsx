'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Instagram, Phone, ExternalLink } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { leagueDateText, MAX_LEAGUES_PER_USER } from '@/lib/fantasy';
import type { LeagueAvailability } from '@/lib/fantasy-leagues';

type Status = 'idle' | 'submitting' | 'success' | 'fallback' | 'error';
const inputCls =
  'w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none';

/** Join official Heroes leagues: name, email, pick up to 3 draft dates (cap 10/league). */
export default function JoinLeagueForm({ leagues }: { leagues: LeagueAvailability[] }) {
  const [status, setStatus] = useState<Status>('idle');
  const [picked, setPicked] = useState<string[]>([]);
  const [joined, setJoined] = useState<Array<{ name: string; dateLabel?: string; time?: string; link?: string }>>([]);
  const open = leagues.filter((l) => !l.full);
  const atMax = picked.length >= MAX_LEAGUES_PER_USER;

  function toggle(id: string) {
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < MAX_LEAGUES_PER_USER ? [...prev, id] : prev));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!picked.length) return;
    setStatus('submitting');
    const fd = new FormData(e.currentTarget);
    const draftDates = picked.map((id) => leagueDateText(leagues.find((l) => l.id === id)!));
    trackEvent('fantasy_join_submit', { leagues: picked.length });
    try {
      const res = await fetch('/api/fantasy/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'join', name: fd.get('name'), email: fd.get('email'), leagueIds: picked, draftDates }),
      });
      const data = await res.json();
      if (data.ok) {
        setJoined(Array.isArray(data.joined) ? data.joined : []);
        setStatus('success');
      } else if (data.configured === false) setStatus('fallback');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success')
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-5">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-2 text-accent" size={36} />
          <h3 className="text-lg font-bold text-foreground">You’re in! 🏈</h3>
          <p className="mt-1 text-sm text-foreground/80">
            {joined.length > 1 ? 'Tap each link to join your leagues on Yahoo' : 'Tap below to join your league on Yahoo'} — we’ve emailed {joined.length > 1 ? 'them' : 'it'} to you too.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {joined.map((j) => (
            <a
              key={j.name}
              href={j.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-3 hover:border-accent transition-colors"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-foreground">{j.name}</span>
                {(j.dateLabel || j.time) && (
                  <span className="block text-xs text-muted">Draft {j.dateLabel}{j.time ? ` · ${j.time}` : ''}</span>
                )}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent">
                Join on Yahoo <ExternalLink size={14} />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Drafts are at American Heroes &amp; Brew in Carlsbad Village. The $100 winner gift card is claimed in person on championship day.</p>
      </div>
    );

  if (status === 'fallback')
    return (
      <div className="rounded-lg border border-accent/40 bg-card p-5 text-center">
        <p className="text-foreground/85">Online signups are opening shortly — grab your spot now:</p>
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

  if (open.length === 0)
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-center text-foreground/85">
        All official Heroes leagues are full for now! Want the next one, or to run your own?{' '}
        <a href="https://www.instagram.com/americanheroesandbrew/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">DM us</a>.
      </div>
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Name</span>
        <input name="name" required autoComplete="name" className={inputCls} placeholder="Your name" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-foreground">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@email.com" />
      </label>

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          Pick your draft date{leagues.length > 1 ? 's' : ''} <span className="text-muted">(up to {MAX_LEAGUES_PER_USER})</span>
        </span>
        <div className="space-y-2">
          {leagues.map((l) => {
            const checked = picked.includes(l.id);
            const disabled = l.full || (!checked && atMax);
            return (
              <label
                key={l.id}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-3 ${
                  l.full ? 'border-border opacity-50' : checked ? 'border-accent bg-accent/10' : 'border-border'
                } ${disabled && !l.full ? 'opacity-50' : ''}`}
              >
                <span className="flex items-center gap-3">
                  <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(l.id)}
                    className="h-5 w-5 accent-[var(--accent)]" />
                  <span className="text-foreground">{leagueDateText(l)}</span>
                </span>
                <span className={`text-xs font-semibold ${l.full ? 'text-muted' : 'text-accent'}`}>
                  {l.full ? 'FULL' : `${l.spotsLeft} left`}
                </span>
              </label>
            );
          })}
        </div>
        {atMax && <p className="mt-1 text-xs text-muted">You’ve selected the max of {MAX_LEAGUES_PER_USER} leagues.</p>}
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">That didn’t go through (a date may have just filled, or you’re already in 3 leagues). Try again or DM @americanheroesandbrew.</p>
      )}
      <button type="submit" disabled={status === 'submitting' || picked.length === 0}
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-dim disabled:opacity-50">
        {status === 'submitting' ? <><Loader2 className="animate-spin" size={18} /> Joining…</> : picked.length > 1 ? `Join ${picked.length} leagues` : 'Join league'}
      </button>
    </form>
  );
}
