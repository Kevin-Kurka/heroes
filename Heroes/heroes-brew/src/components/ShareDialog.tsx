'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, Instagram, X as CloseIcon } from 'lucide-react';
import { UnifiedEvent } from '@/types';
import { buildShareContent, fetchEventImageFile } from '@/lib/share-content';
import { trackEvent } from '@/lib/analytics';

type Channel = 'sms' | 'instagram' | 'email';

interface ChannelDef {
  id: Channel;
  label: string;
  icon: React.ReactNode;
  tint: string;
}

const CHANNELS: ChannelDef[] = [
  { id: 'sms', label: 'Messages', icon: <MessageSquare size={22} />, tint: 'bg-green-500/15 text-green-400' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={22} />, tint: 'bg-pink-500/15 text-pink-400' },
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
 * Channel picker for sharing a watch party. SMS and Email open the device's
 * native composer pre-filled (text, or subject/body) with the /share link whose
 * OG preview is the matchup image. Instagram can't take a pre-filled caption from
 * the web, so it uses the native share sheet with the promo matchup image
 * attached (caption copied + image downloaded as a desktop fallback). X/TikTok
 * are intentionally omitted — Heroes has no presence there.
 */
export default function ShareDialog({ event, onClose }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);
  const content = buildShareContent(event);

  useEffect(() => {
    // Warm the social image so the Instagram share fires promptly.
    fetchEventImageFile(event, true).then((f) => {
      fileRef.current = f;
    });
  }, [event]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shareToInstagram = async () => {
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
    window.open('https://www.instagram.com/americanheroesandbrew/', '_blank', 'noopener,noreferrer');
    setStatus('Caption copied + image saved — paste it in Instagram.');
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
      case 'instagram':
        await shareToInstagram();
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
