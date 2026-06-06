'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Instagram, X as CloseIcon } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import { buildShareContent, fetchEventImageFile } from '@/lib/share-content';
import { trackEvent } from '@/lib/analytics';

type Channel = 'sms' | 'instagram' | 'tiktok' | 'x' | 'email';

/** Brand glyphs lucide doesn't ship (kept inline to avoid an icon dependency). */
function XGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.16 17.52h1.833L7.084 4.126H5.117l11.967 15.644Z" />
    </svg>
  );
}
function TikTokGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.2v12.86a2.59 2.59 0 0 1-2.59 2.46 2.59 2.59 0 0 1-.6-5.11v-3.27a5.77 5.77 0 0 0-5.42 5.76A5.77 5.77 0 0 0 9.76 21.5a5.77 5.77 0 0 0 5.77-5.77V9.01a7.46 7.46 0 0 0 4.36 1.4V7.2a4.28 4.28 0 0 1-3.29-1.38Z" />
    </svg>
  );
}

interface ChannelDef {
  id: Channel;
  label: string;
  icon: React.ReactNode;
  tint: string;
}

const CHANNELS: ChannelDef[] = [
  { id: 'sms', label: 'Messages', icon: <MessageSquare size={22} />, tint: 'bg-green-500/15 text-green-400' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={22} />, tint: 'bg-pink-500/15 text-pink-400' },
  { id: 'tiktok', label: 'TikTok', icon: <TikTokGlyph />, tint: 'bg-cyan-500/15 text-cyan-300' },
  { id: 'x', label: 'X', icon: <XGlyph />, tint: 'bg-white/10 text-foreground' },
  { id: 'email', label: 'Email', icon: <Mail size={22} />, tint: 'bg-amber-500/15 text-amber-400' },
];

function triggerDownload(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface Props {
  event: UnifiedEvent;
  onClose: () => void;
}

/**
 * Channel picker for sharing a watch party. SMS/Email/X open the device's native
 * composer pre-filled (text, subject/body, or tweet with hashtags + the /share
 * link whose OG preview is the matchup image). Instagram/TikTok can't take a
 * pre-filled caption from the web, so they use the native share sheet with the
 * promo matchup image attached (caption copied + image downloaded as a desktop
 * fallback).
 */
export default function ShareDialog({ event, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const content = buildShareContent(event);

  useEffect(() => {
    // Warm the social image so Instagram/TikTok shares fire promptly.
    fetchEventImageFile(event, true).then((f) => {
      fileRef.current = f;
    });
  }, [event]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shareToApp = async (channel: 'instagram' | 'tiktok') => {
    const file = fileRef.current ?? (await fetchEventImageFile(event, true));
    if (file && typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: content.socialCaption });
      } catch {
        // Dismissed — no-op.
      }
      onClose();
      return;
    }
    // Desktop / no file share: copy the caption, download the image, open the app.
    try {
      await navigator.clipboard.writeText(content.socialCaption);
    } catch {
      // Clipboard blocked — the download below still gives them the asset.
    }
    if (file) triggerDownload(file);
    window.open(
      channel === 'instagram'
        ? 'https://www.instagram.com/americanheroesandbrew/'
        : 'https://www.tiktok.com/',
      '_blank',
      'noopener,noreferrer',
    );
    setStatus('Caption copied + image saved — paste it in the app.');
  };

  const handle = async (channel: Channel) => {
    trackEvent('share_channel', { channel, event_id: event.id, league: event.league ?? 'NA' });
    switch (channel) {
      case 'sms': {
        const isAndroid = /android/i.test(navigator.userAgent);
        window.location.assign(`sms:${isAndroid ? '?' : '?&'}body=${encodeURIComponent(content.smsBody)}`);
        onClose();
        break;
      }
      case 'email':
        window.location.assign(
          `mailto:?subject=${encodeURIComponent(content.emailSubject)}&body=${encodeURIComponent(content.emailBody)}`,
        );
        onClose();
        break;
      case 'x':
        window.open(content.xUrl, '_blank', 'noopener,noreferrer');
        onClose();
        break;
      case 'instagram':
      case 'tiktok':
        await shareToApp(channel);
        break;
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share this watch party"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-card p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground">Invite your crew</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 -mr-1 text-muted hover:text-foreground transition-colors">
            <CloseIcon size={20} />
          </button>
        </div>
        <p className="text-sm text-muted mb-4">Share this watch party and tag Heroes.</p>

        <div className="grid grid-cols-3 gap-3">
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handle(c.id)}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 hover:bg-white/10 hover:border-accent/30 transition-colors"
            >
              <span className={`flex items-center justify-center w-11 h-11 rounded-full ${c.tint}`}>{c.icon}</span>
              <span className="text-xs font-medium text-foreground">{c.label}</span>
            </button>
          ))}
        </div>

        {status && <p className="mt-4 text-xs text-accent text-center">{status}</p>}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
