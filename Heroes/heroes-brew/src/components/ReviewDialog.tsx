'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Star, Camera, Share2, Facebook, ExternalLink, X as CloseIcon } from 'lucide-react';
import { REVIEW_LINKS, REVIEW_PLATFORM_LABEL, REVIEW_PROMPTS } from '@/lib/review';
import { trackEvent } from '@/lib/analytics';

type Platform = keyof typeof REVIEW_LINKS;

interface Props {
  onClose: () => void;
}

/**
 * "Leave a Review" composer. Defaults to 5 stars and offers one-tap prompts to
 * make writing a genuine review effortless, then hands off to Google / Yelp /
 * Facebook (or the device share sheet) — copying the text to the clipboard so the
 * reviewer just pastes. Photos ride the native share sheet, the only way to push
 * an image to another app from the web.
 */
export default function ReviewDialog({ onClose }: Props) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const addPrompt = (prompt: string) => {
    setText((t) => (t.trim() ? `${t.trim()}, ${prompt}` : prompt));
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  const copyText = async () => {
    const t = text.trim();
    if (!t) return;
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      // Clipboard blocked — the reviewer can still type in the app.
    }
  };

  const postTo = async (platform: Platform) => {
    trackEvent('review_submit', { platform, rating, has_photo: photoFile ? 'yes' : 'no' });
    await copyText();
    window.open(REVIEW_LINKS[platform], '_blank', 'noopener,noreferrer');
    setStatus(
      `${REVIEW_PLATFORM_LABEL[platform]} opened — paste your review${photoFile ? ', then add your photo' : ''}.`,
    );
  };

  const shareMore = async () => {
    trackEvent('review_submit', { platform: 'share', rating, has_photo: photoFile ? 'yes' : 'no' });
    const message = text.trim() || 'Highly recommend American Heroes & Brew in Carlsbad! 🇺🇸';
    const data: ShareData = { text: message };
    if (photoFile && navigator.canShare?.({ files: [photoFile] })) data.files = [photoFile];
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Dismissed.
      }
      return;
    }
    await copyText();
    setStatus('Review copied — paste it in your review app.');
  };

  if (typeof document === 'undefined') return null;

  const activeStars = hover || rating;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Leave a review"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Leave a review</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 -mr-1 text-muted hover:text-foreground transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="text-sm text-muted mb-3">Takes 10 seconds — and helps other fans find us. 🙌</p>

        {/* Stars (default 5) */}
        <div className="flex justify-center gap-1.5 mb-4" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="p-0.5"
            >
              <Star size={30} className={n <= activeStars ? 'fill-accent text-accent' : 'text-white/20'} />
            </button>
          ))}
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {REVIEW_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => addPrompt(p)}
              className="text-[11px] rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-muted hover:text-foreground hover:border-accent/30 transition-colors"
            >
              + {p}
            </button>
          ))}
        </div>

        {/* Text */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Tell everyone what you loved…"
          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 resize-none"
        />

        {/* Photo */}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors"
          >
            <Camera size={15} /> {photoUrl ? 'Change photo' : 'Add a photo'}
          </button>
          {photoUrl && (
            <span className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img src={photoUrl} alt="Your upload" className="w-10 h-10 rounded object-cover border border-white/10" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => {
                  if (photoUrl) URL.revokeObjectURL(photoUrl);
                  setPhotoFile(null);
                  setPhotoUrl(null);
                }}
                className="absolute -top-1.5 -right-1.5 bg-card border border-white/20 rounded-full p-0.5 text-muted hover:text-foreground"
              >
                <CloseIcon size={11} />
              </button>
            </span>
          )}
        </div>

        <div className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Post to</div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => postTo('google')} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 py-2.5 text-sm font-semibold text-foreground hover:border-accent/30 transition-colors">
            <ExternalLink size={16} /> Google
          </button>
          <button type="button" onClick={() => postTo('yelp')} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-red-500/15 py-2.5 text-sm font-semibold text-red-400 hover:border-red-500/40 transition-colors">
            <ExternalLink size={16} /> Yelp
          </button>
          <button type="button" onClick={() => postTo('facebook')} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-blue-500/15 py-2.5 text-sm font-semibold text-blue-400 hover:border-blue-500/40 transition-colors">
            <Facebook size={16} /> Facebook
          </button>
          <button type="button" onClick={shareMore} className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-accent/15 py-2.5 text-sm font-semibold text-accent hover:border-accent/40 transition-colors">
            <Share2 size={16} /> More
          </button>
        </div>

        <p className="mt-3 text-[11px] text-muted text-center">
          {status ?? 'Your review text is copied automatically — just paste it in the app.'}
        </p>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
