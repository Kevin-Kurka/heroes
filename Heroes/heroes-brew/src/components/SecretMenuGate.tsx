'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Lock, X as CloseIcon } from 'lucide-react';
import { MenuItem } from '@/types';
import { trackEvent } from '@/lib/analytics';

export interface SecretUnlock {
  items: MenuItem[];
  note: string;
  name: string;
  contact: string;
}

interface Props {
  onClose: () => void;
  onUnlock: (data: SecretUnlock) => void;
}

/**
 * "Secret Menu Access" — the lead-capture gate behind the hidden menu tab. Asks
 * for a name plus an email or phone, posts it to /api/secret-menu (which logs it
 * to Google Sheets) and, on success, hands the off-menu items back to the menu
 * page to render + cache.
 */
export default function SecretMenuGate({ onClose, onUnlock }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim() && !phone.trim()) return setError('Add an email or phone number.');

    setSubmitting(true);
    trackEvent('secret_menu_unlock_attempt', { has_email: email.trim() ? 'yes' : 'no' });
    try {
      const res = await fetch('/api/secret-menu', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), source: 'secret-menu-qr' }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Something went wrong — try again.');
        setSubmitting(false);
        return;
      }
      trackEvent('secret_menu_unlocked', {});
      onUnlock({ items: data.items, note: data.note, name: name.trim(), contact: email.trim() || phone.trim() });
    } catch {
      setError('Network hiccup — please try again.');
      setSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40';

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Secret Menu Access"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-sm rounded-2xl border border-accent/30 bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/15">
              <Lock size={16} className="text-accent" />
            </span>
            <h2 className="text-lg font-bold text-foreground">Secret Menu Access</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 -mr-1 text-muted hover:text-foreground transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="text-sm text-muted mb-4">
          You found it. 🤫 Drop your info to unlock the off-menu items.
        </p>

        <form onSubmit={submit} className="space-y-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className={inputClass}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className={inputClass}
          />
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="h-px flex-1 bg-white/10" /> and / or <span className="h-px flex-1 bg-white/10" />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            autoComplete="tel"
            className={inputClass}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold px-4 py-3 rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-60"
          >
            <Lock size={16} /> {submitting ? 'Unlocking…' : 'Unlock Secret Menu'}
          </button>
        </form>

        <p className="mt-3 text-[11px] text-muted text-center">
          Just the occasional Heroes update — no spam, ever.
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
